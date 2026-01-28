/**
 * Auth Controller
 * Handles authentication, authorization, password management,
 * and admin user operations with enhanced security.
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const config = require('../config');

const prisma = new PrismaClient();

// ============================================================================
// CONSTANTS
// ============================================================================

const PASSWORD_MIN_LENGTH = 8;
const TOKEN_EXPIRY = '7d';
const REFRESH_TOKEN_EXPIRY = '30d';
const PASSWORD_RESET_EXPIRY = 60 * 60 * 1000; // 1 hour
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

// In-memory rate limiting (use Redis in production)
const loginAttempts = new Map();

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function successResponse(res, data, message = 'Success', statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  });
}

function errorResponse(res, message, statusCode = 500, errors = null) {
  const response = {
    success: false,
    message,
    timestamp: new Date().toISOString(),
  };
  if (errors) response.errors = errors;
  return res.status(statusCode).json(response);
}

function generateToken(payload, expiresIn = TOKEN_EXPIRY) {
  return jwt.sign(payload, config.jwt.secret, { expiresIn });
}

function generateRefreshToken() {
  return crypto.randomBytes(40).toString('hex');
}

function hashPassword(password) {
  return bcrypt.hash(password, 12);
}

function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

function validatePassword(password) {
  const errors = [];

  if (!password || password.length < PASSWORD_MIN_LENGTH) {
    errors.push(`Password must be at least ${PASSWORD_MIN_LENGTH} characters`);
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  return errors;
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function checkRateLimit(email) {
  const key = email.toLowerCase();
  const attempts = loginAttempts.get(key);

  if (!attempts) return { allowed: true };

  if (attempts.count >= MAX_LOGIN_ATTEMPTS) {
    const timeRemaining = attempts.lockUntil - Date.now();
    if (timeRemaining > 0) {
      return {
        allowed: false,
        message: `Too many login attempts. Try again in ${Math.ceil(timeRemaining / 60000)} minutes.`,
      };
    }
    loginAttempts.delete(key);
  }

  return { allowed: true };
}

function recordLoginAttempt(email, success) {
  const key = email.toLowerCase();

  if (success) {
    loginAttempts.delete(key);
    return;
  }

  const attempts = loginAttempts.get(key) || { count: 0 };
  attempts.count += 1;

  if (attempts.count >= MAX_LOGIN_ATTEMPTS) {
    attempts.lockUntil = Date.now() + LOCKOUT_DURATION;
  }

  loginAttempts.set(key, attempts);
}

// ============================================================================
// CONTROLLER METHODS
// ============================================================================

/**
 * Admin login
 * POST /api/auth/login
 */
async function login(req, res) {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return errorResponse(res, 'Email and password are required', 400);
    }

    if (!validateEmail(email)) {
      return errorResponse(res, 'Invalid email format', 400);
    }

    // Check rate limiting
    const rateCheck = checkRateLimit(email);
    if (!rateCheck.allowed) {
      return errorResponse(res, rateCheck.message, 429);
    }

    // Find admin
    const admin = await prisma.admin.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!admin) {
      recordLoginAttempt(email, false);
      return errorResponse(res, 'Invalid email or password', 401);
    }

    // Check if account is active
    if (!admin.isActive) {
      return errorResponse(res, 'Your account has been deactivated. Please contact support.', 401);
    }

    // Verify password
    const isValid = await verifyPassword(password, admin.password);

    if (!isValid) {
      recordLoginAttempt(email, false);
      return errorResponse(res, 'Invalid email or password', 401);
    }

    // Record successful login
    recordLoginAttempt(email, true);

    // Generate tokens
    const tokenPayload = {
      id: admin.id,
      email: admin.email,
      role: admin.role,
    };

    const accessToken = generateToken(tokenPayload);
    const refreshToken = generateRefreshToken();

    // Store refresh token
    await prisma.admin.update({
      where: { id: admin.id },
      data: {
        refreshToken,
        lastLoginAt: new Date(),
        lastLoginIp: req.ip || req.headers['x-forwarded-for'] || 'unknown',
      },
    });

    return successResponse(res, {
      accessToken,
      refreshToken,
      expiresIn: TOKEN_EXPIRY,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
        avatar: admin.avatar,
      },
    }, 'Login successful');
  } catch (error) {
    console.error('Login error:', error);
    return errorResponse(res, 'Login failed. Please try again.');
  }
}

/**
 * Refresh access token
 * POST /api/auth/refresh
 */
async function refreshToken(req, res) {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return errorResponse(res, 'Refresh token is required', 400);
    }

    // Find admin with this refresh token
    const admin = await prisma.admin.findFirst({
      where: { refreshToken, isActive: true },
    });

    if (!admin) {
      return errorResponse(res, 'Invalid refresh token', 401);
    }

    // Generate new tokens
    const tokenPayload = {
      id: admin.id,
      email: admin.email,
      role: admin.role,
    };

    const newAccessToken = generateToken(tokenPayload);
    const newRefreshToken = generateRefreshToken();

    // Update refresh token
    await prisma.admin.update({
      where: { id: admin.id },
      data: { refreshToken: newRefreshToken },
    });

    return successResponse(res, {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      expiresIn: TOKEN_EXPIRY,
    }, 'Token refreshed successfully');
  } catch (error) {
    console.error('Token refresh error:', error);
    return errorResponse(res, 'Failed to refresh token');
  }
}

/**
 * Logout
 * POST /api/auth/logout
 */
async function logout(req, res) {
  try {
    if (req.admin?.id) {
      await prisma.admin.update({
        where: { id: req.admin.id },
        data: { refreshToken: null },
      });
    }

    return successResponse(res, null, 'Logged out successfully');
  } catch (error) {
    console.error('Logout error:', error);
    return errorResponse(res, 'Failed to logout');
  }
}

/**
 * Get current admin profile
 * GET /api/auth/profile
 */
async function getProfile(req, res) {
  try {
    const admin = await prisma.admin.findUnique({
      where: { id: req.admin.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        phone: true,
        createdAt: true,
        lastLoginAt: true,
      },
    });

    if (!admin) {
      return errorResponse(res, 'Admin not found', 404);
    }

    return successResponse(res, admin, 'Profile retrieved successfully');
  } catch (error) {
    console.error('Get profile error:', error);
    return errorResponse(res, 'Failed to get profile');
  }
}

/**
 * Update admin profile
 * PUT /api/auth/profile
 */
async function updateProfile(req, res) {
  try {
    const { name, phone, avatar } = req.body;

    const updateData = {};
    if (name) updateData.name = name.trim();
    if (phone) updateData.phone = phone.replace(/\D/g, '');
    if (avatar !== undefined) updateData.avatar = avatar;

    const admin = await prisma.admin.update({
      where: { id: req.admin.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        phone: true,
      },
    });

    return successResponse(res, admin, 'Profile updated successfully');
  } catch (error) {
    console.error('Update profile error:', error);
    return errorResponse(res, 'Failed to update profile');
  }
}

/**
 * Change password
 * POST /api/auth/change-password
 */
async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // Validate inputs
    if (!currentPassword || !newPassword || !confirmPassword) {
      return errorResponse(res, 'All password fields are required', 400);
    }

    if (newPassword !== confirmPassword) {
      return errorResponse(res, 'New passwords do not match', 400);
    }

    // Validate new password strength
    const passwordErrors = validatePassword(newPassword);
    if (passwordErrors.length > 0) {
      return errorResponse(res, 'Password does not meet requirements', 400, passwordErrors);
    }

    // Get current admin
    const admin = await prisma.admin.findUnique({
      where: { id: req.admin.id },
    });

    // Verify current password
    const isValid = await verifyPassword(currentPassword, admin.password);
    if (!isValid) {
      return errorResponse(res, 'Current password is incorrect', 400);
    }

    // Check if new password is same as current
    const isSamePassword = await verifyPassword(newPassword, admin.password);
    if (isSamePassword) {
      return errorResponse(res, 'New password must be different from current password', 400);
    }

    // Update password
    const hashedPassword = await hashPassword(newPassword);
    await prisma.admin.update({
      where: { id: req.admin.id },
      data: {
        password: hashedPassword,
        refreshToken: null, // Invalidate all sessions
      },
    });

    return successResponse(res, null, 'Password changed successfully. Please login again.');
  } catch (error) {
    console.error('Change password error:', error);
    return errorResponse(res, 'Failed to change password');
  }
}

/**
 * Request password reset
 * POST /api/auth/forgot-password
 */
async function forgotPassword(req, res) {
  try {
    const { email } = req.body;

    if (!email || !validateEmail(email)) {
      return errorResponse(res, 'Valid email is required', 400);
    }

    const admin = await prisma.admin.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Always return success to prevent email enumeration
    if (!admin) {
      return successResponse(res, null, 'If an account exists with this email, you will receive a password reset link.');
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    await prisma.admin.update({
      where: { id: admin.id },
      data: {
        resetToken: resetTokenHash,
        resetTokenExpiry: new Date(Date.now() + PASSWORD_RESET_EXPIRY),
      },
    });

    // TODO: Send password reset email
    // const resetUrl = `${config.frontendUrl}/admin/reset-password/${resetToken}`;
    // await emailService.sendPasswordReset(admin.email, resetUrl);

    console.log('Password reset token:', resetToken); // Remove in production

    return successResponse(res, null, 'If an account exists with this email, you will receive a password reset link.');
  } catch (error) {
    console.error('Forgot password error:', error);
    return errorResponse(res, 'Failed to process request');
  }
}

/**
 * Reset password with token
 * POST /api/auth/reset-password
 */
async function resetPassword(req, res) {
  try {
    const { token, newPassword, confirmPassword } = req.body;

    if (!token) {
      return errorResponse(res, 'Reset token is required', 400);
    }

    if (!newPassword || !confirmPassword) {
      return errorResponse(res, 'New password and confirmation are required', 400);
    }

    if (newPassword !== confirmPassword) {
      return errorResponse(res, 'Passwords do not match', 400);
    }

    const passwordErrors = validatePassword(newPassword);
    if (passwordErrors.length > 0) {
      return errorResponse(res, 'Password does not meet requirements', 400, passwordErrors);
    }

    // Hash the token to compare with database
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const admin = await prisma.admin.findFirst({
      where: {
        resetToken: tokenHash,
        resetTokenExpiry: { gt: new Date() },
      },
    });

    if (!admin) {
      return errorResponse(res, 'Invalid or expired reset token', 400);
    }

    // Update password and clear reset token
    const hashedPassword = await hashPassword(newPassword);
    await prisma.admin.update({
      where: { id: admin.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
        refreshToken: null,
      },
    });

    return successResponse(res, null, 'Password reset successfully. Please login with your new password.');
  } catch (error) {
    console.error('Reset password error:', error);
    return errorResponse(res, 'Failed to reset password');
  }
}

/**
 * Create new admin (Super Admin only)
 * POST /api/admin/users
 */
async function createAdmin(req, res) {
  try {
    const { email, password, name, role = 'ADMIN' } = req.body;

    // Check if requester is super admin
    if (req.admin.role !== 'SUPER_ADMIN') {
      return errorResponse(res, 'Only super admins can create new admin accounts', 403);
    }

    // Validate inputs
    if (!email || !validateEmail(email)) {
      return errorResponse(res, 'Valid email is required', 400);
    }

    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      return errorResponse(res, 'Password does not meet requirements', 400, passwordErrors);
    }

    // Check if email already exists
    const existing = await prisma.admin.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existing) {
      return errorResponse(res, 'An admin with this email already exists', 400);
    }

    const hashedPassword = await hashPassword(password);

    const admin = await prisma.admin.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name: name?.trim() || email.split('@')[0],
        role: ['ADMIN', 'SUPER_ADMIN'].includes(role) ? role : 'ADMIN',
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    return successResponse(res, admin, 'Admin created successfully', 201);
  } catch (error) {
    console.error('Create admin error:', error);
    return errorResponse(res, 'Failed to create admin');
  }
}

/**
 * Get all admins (Super Admin only)
 * GET /api/admin/users
 */
async function getAllAdmins(req, res) {
  try {
    if (req.admin.role !== 'SUPER_ADMIN') {
      return errorResponse(res, 'Only super admins can view all admin accounts', 403);
    }

    const admins = await prisma.admin.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(res, admins, 'Admins retrieved successfully');
  } catch (error) {
    console.error('Get all admins error:', error);
    return errorResponse(res, 'Failed to get admins');
  }
}

/**
 * Toggle admin active status (Super Admin only)
 * PATCH /api/admin/users/:id/status
 */
async function toggleAdminStatus(req, res) {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (req.admin.role !== 'SUPER_ADMIN') {
      return errorResponse(res, 'Only super admins can modify admin accounts', 403);
    }

    if (id === req.admin.id) {
      return errorResponse(res, 'You cannot modify your own account status', 400);
    }

    const admin = await prisma.admin.update({
      where: { id },
      data: {
        isActive,
        refreshToken: isActive ? undefined : null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
      },
    });

    return successResponse(res, admin, `Admin ${isActive ? 'activated' : 'deactivated'} successfully`);
  } catch (error) {
    console.error('Toggle admin status error:', error);
    return errorResponse(res, 'Failed to update admin status');
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  login,
  refreshToken,
  logout,
  getProfile,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  createAdmin,
  getAllAdmins,
  toggleAdminStatus,
};