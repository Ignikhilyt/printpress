const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const config = require('../config');

const prisma = new PrismaClient();

async function authenticateAdmin(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
    }

    const token = authHeader.split(' ')[1];

    // Verify token asynchronously
    const decoded = await new Promise((resolve, reject) => {
      jwt.verify(token, config.jwt.secret, (err, decoded) => {
        if (err) reject(err);
        else resolve(decoded);
      });
    });


    const admin = await prisma.admin.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
      },
    });

    if (!admin || !admin.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.',
      });
    }

    req.admin = admin;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token.',
    });
  }
}

module.exports = { authenticateAdmin };