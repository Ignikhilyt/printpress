/**
 * Institutes Controller
 * Comprehensive institute management with validation, caching,
 * statistics, featured institutes, and search functionality.
 */

const { PrismaClient } = require('@prisma/client');
const { generateSlug, paginate } = require('../utils/helpers');

const prisma = new PrismaClient();

// ============================================================================
// CACHE MANAGEMENT
// ============================================================================

let institutesCache = {
  data: null,
  timestamp: null,
  ttl: 5 * 60 * 1000, // 5 minutes
};

function clearCache() {
  institutesCache.data = null;
  institutesCache.timestamp = null;
}

function isCacheValid() {
  return institutesCache.data &&
    institutesCache.timestamp &&
    (Date.now() - institutesCache.timestamp) < institutesCache.ttl;
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

function validateInstituteData(data, isUpdate = false) {
  const errors = [];

  if (!isUpdate || data.name !== undefined) {
    if (!data.name || typeof data.name !== 'string') {
      errors.push('Name is required and must be a string');
    } else if (data.name.length < 3 || data.name.length > 100) {
      errors.push('Name must be between 3 and 100 characters');
    }
  }

  if (data.email && !/^\S+@\S+\.\S+$/.test(data.email)) {
    errors.push('Invalid email format');
  }

  if (data.phone && !/^[+]?[\d\s-]{10,15}$/.test(data.phone)) {
    errors.push('Invalid phone format');
  }

  if (data.website && data.website.length > 0) {
    const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/;
    if (!urlPattern.test(data.website)) {
      errors.push('Invalid website URL format');
    }
  }

  if (data.rating !== undefined) {
    const rating = parseFloat(data.rating);
    if (isNaN(rating) || rating < 0 || rating > 5) {
      errors.push('Rating must be between 0 and 5');
    }
  }

  return errors;
}

// ============================================================================
// STANDARDIZED RESPONSE
// ============================================================================

function sendResponse(res, { success = true, data = null, message = null, status = 200, meta = null }) {
  const response = { success };
  if (message) response.message = message;
  if (data !== null) response.data = data;
  if (meta) response.meta = meta;
  return res.status(status).json(response);
}

function sendError(res, message, status = 400, errors = null) {
  const response = { success: false, message };
  if (errors) response.errors = errors;
  return res.status(status).json(response);
}

// ============================================================================
// GET ALL INSTITUTES
// ============================================================================

async function getAll(req, res) {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      featured,
      isActive,
      sortBy = 'name',
      sortOrder = 'asc',
    } = req.query;

    // Build where clause
    const where = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (featured !== undefined) {
      where.isFeatured = featured === 'true';
    }

    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    // Count total
    const total = await prisma.institute.count({ where });

    // Valid sort fields
    const validSortFields = ['name', 'createdAt', 'rating', 'notesCount'];
    const orderField = validSortFields.includes(sortBy) ? sortBy : 'name';
    const orderDir = sortOrder === 'desc' ? 'desc' : 'asc';

    // Fetch institutes
    const institutes = await prisma.institute.findMany({
      where,
      include: {
        _count: { select: { notes: true } },
      },
      orderBy: { [orderField]: orderDir },
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit),
    });

    // Transform data
    const transformed = institutes.map(inst => ({
      id: inst.id,
      name: inst.name,
      slug: inst.slug,
      description: inst.description,
      location: inst.location,
      website: inst.website,
      email: inst.email,
      phone: inst.phone,
      rating: inst.rating,
      isFeatured: inst.isFeatured,
      isActive: inst.isActive,
      notesCount: inst._count.notes,
      createdAt: inst.createdAt,
      updatedAt: inst.updatedAt,
    }));

    const pagination = paginate(total, parseInt(page), parseInt(limit));

    return sendResponse(res, {
      data: transformed,
      meta: { pagination },
    });
  } catch (error) {
    console.error('Error fetching institutes:', error);
    return sendError(res, 'Failed to fetch institutes', 500);
  }
}

// ============================================================================
// GET FEATURED INSTITUTES
// ============================================================================

async function getFeatured(req, res) {
  try {
    // Check cache
    if (isCacheValid() && institutesCache.data?.featured) {
      return sendResponse(res, { data: institutesCache.data.featured });
    }

    const institutes = await prisma.institute.findMany({
      where: { isFeatured: true, isActive: true },
      include: {
        _count: { select: { notes: true } },
      },
      orderBy: { name: 'asc' },
      take: 10,
    });

    const transformed = institutes.map(inst => ({
      id: inst.id,
      name: inst.name,
      slug: inst.slug,
      description: inst.description,
      location: inst.location,
      website: inst.website,
      rating: inst.rating,
      notesCount: inst._count.notes,
    }));

    // Update cache
    if (!institutesCache.data) institutesCache.data = {};
    institutesCache.data.featured = transformed;
    institutesCache.timestamp = Date.now();

    return sendResponse(res, { data: transformed });
  } catch (error) {
    console.error('Error fetching featured institutes:', error);
    return sendError(res, 'Failed to fetch featured institutes', 500);
  }
}

// ============================================================================
// GET SINGLE INSTITUTE
// ============================================================================

async function getById(req, res) {
  try {
    const { id } = req.params;

    const institute = await prisma.institute.findUnique({
      where: { id },
      include: {
        notes: {
          where: { isPublished: true },
          select: {
            id: true,
            title: true,
            slug: true,
            pageCount: true,
            pricePerPage: true,
            category: { select: { name: true } },
          },
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
        _count: { select: { notes: true } },
      },
    });

    if (!institute) {
      return sendError(res, 'Institute not found', 404);
    }

    return sendResponse(res, {
      data: {
        id: institute.id,
        name: institute.name,
        slug: institute.slug,
        description: institute.description,
        location: institute.location,
        website: institute.website,
        email: institute.email,
        phone: institute.phone,
        rating: institute.rating,
        isFeatured: institute.isFeatured,
        isActive: institute.isActive,
        notesCount: institute._count.notes,
        recentNotes: institute.notes,
        createdAt: institute.createdAt,
        updatedAt: institute.updatedAt,
      },
    });
  } catch (error) {
    console.error('Error fetching institute:', error);
    return sendError(res, 'Failed to fetch institute', 500);
  }
}

// ============================================================================
// GET BY SLUG
// ============================================================================

async function getBySlug(req, res) {
  try {
    const { slug } = req.params;

    const institute = await prisma.institute.findUnique({
      where: { slug },
      include: {
        notes: {
          where: { isPublished: true },
          select: {
            id: true,
            title: true,
            slug: true,
            pageCount: true,
            pricePerPage: true,
            thumbnail: true,
            category: { select: { name: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        _count: { select: { notes: true } },
      },
    });

    if (!institute) {
      return sendError(res, 'Institute not found', 404);
    }

    if (!institute.isActive) {
      return sendError(res, 'Institute is not available', 404);
    }

    return sendResponse(res, {
      data: {
        id: institute.id,
        name: institute.name,
        slug: institute.slug,
        description: institute.description,
        location: institute.location,
        website: institute.website,
        rating: institute.rating,
        notesCount: institute._count.notes,
        notes: institute.notes,
      },
    });
  } catch (error) {
    console.error('Error fetching institute by slug:', error);
    return sendError(res, 'Failed to fetch institute', 500);
  }
}

// ============================================================================
// CREATE INSTITUTE
// ============================================================================

async function create(req, res) {
  try {
    const { name, description, location, website, email, phone, rating } = req.body;

    // Validate
    const errors = validateInstituteData(req.body);
    if (errors.length > 0) {
      return sendError(res, 'Validation failed', 400, errors);
    }

    // Generate slug
    const slug = generateSlug(name);

    // Check if slug exists
    const existing = await prisma.institute.findUnique({ where: { slug } });
    if (existing) {
      return sendError(res, 'An institute with this name already exists', 409);
    }

    // Create institute
    const institute = await prisma.institute.create({
      data: {
        name: name.trim(),
        slug,
        description: description?.trim(),
        location: location?.trim(),
        website: website?.trim(),
        email: email?.toLowerCase().trim(),
        phone: phone?.trim(),
        rating: rating ? parseFloat(rating) : 0,
        isActive: true,
        isFeatured: false,
      },
    });

    clearCache();

    return sendResponse(res, {
      data: institute,
      message: 'Institute created successfully',
      status: 201,
    });
  } catch (error) {
    console.error('Error creating institute:', error);
    return sendError(res, 'Failed to create institute', 500);
  }
}

// ============================================================================
// UPDATE INSTITUTE
// ============================================================================

async function update(req, res) {
  try {
    const { id } = req.params;
    const { name, description, location, website, email, phone, rating, isActive, isFeatured } = req.body;

    // Validate
    const errors = validateInstituteData(req.body, true);
    if (errors.length > 0) {
      return sendError(res, 'Validation failed', 400, errors);
    }

    // Check if exists
    const existing = await prisma.institute.findUnique({ where: { id } });
    if (!existing) {
      return sendError(res, 'Institute not found', 404);
    }

    // Build update data
    const updateData = {};
    if (name !== undefined) {
      updateData.name = name.trim();
      updateData.slug = generateSlug(name);
    }
    if (description !== undefined) updateData.description = description?.trim();
    if (location !== undefined) updateData.location = location?.trim();
    if (website !== undefined) updateData.website = website?.trim();
    if (email !== undefined) updateData.email = email?.toLowerCase().trim();
    if (phone !== undefined) updateData.phone = phone?.trim();
    if (rating !== undefined) updateData.rating = parseFloat(rating);
    if (isActive !== undefined) updateData.isActive = isActive;
    if (isFeatured !== undefined) updateData.isFeatured = isFeatured;

    const institute = await prisma.institute.update({
      where: { id },
      data: updateData,
    });

    clearCache();

    return sendResponse(res, {
      data: institute,
      message: 'Institute updated successfully',
    });
  } catch (error) {
    console.error('Error updating institute:', error);
    return sendError(res, 'Failed to update institute', 500);
  }
}

// ============================================================================
// TOGGLE FEATURED
// ============================================================================

async function toggleFeatured(req, res) {
  try {
    const { id } = req.params;

    const existing = await prisma.institute.findUnique({ where: { id } });
    if (!existing) {
      return sendError(res, 'Institute not found', 404);
    }

    const institute = await prisma.institute.update({
      where: { id },
      data: { isFeatured: !existing.isFeatured },
    });

    clearCache();

    return sendResponse(res, {
      data: institute,
      message: institute.isFeatured ? 'Added to featured' : 'Removed from featured',
    });
  } catch (error) {
    console.error('Error toggling featured:', error);
    return sendError(res, 'Failed to update institute', 500);
  }
}

// ============================================================================
// DELETE INSTITUTE
// ============================================================================

async function remove(req, res) {
  try {
    const { id } = req.params;

    const existing = await prisma.institute.findUnique({
      where: { id },
      include: { _count: { select: { notes: true } } },
    });

    if (!existing) {
      return sendError(res, 'Institute not found', 404);
    }

    // Soft delete - set inactive instead of deleting
    if (existing._count.notes > 0) {
      await prisma.institute.update({
        where: { id },
        data: { isActive: false },
      });

      return sendResponse(res, {
        message: `Institute deactivated. ${existing._count.notes} associated notes preserved.`,
      });
    }

    // Hard delete if no notes
    await prisma.institute.delete({ where: { id } });

    clearCache();

    return sendResponse(res, {
      message: 'Institute deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting institute:', error);
    return sendError(res, 'Failed to delete institute', 500);
  }
}

// ============================================================================
// GET STATISTICS
// ============================================================================

async function getStatistics(req, res) {
  try {
    const [total, active, featured, totalNotes, topInstitutes] = await Promise.all([
      prisma.institute.count(),
      prisma.institute.count({ where: { isActive: true } }),
      prisma.institute.count({ where: { isFeatured: true } }),
      prisma.note.count(),
      prisma.institute.findMany({
        where: { isActive: true },
        include: { _count: { select: { notes: true } } },
        orderBy: { rating: 'desc' },
        take: 5,
      }),
    ]);

    const avgRating = await prisma.institute.aggregate({
      where: { isActive: true },
      _avg: { rating: true },
    });

    return sendResponse(res, {
      data: {
        total,
        active,
        inactive: total - active,
        featured,
        totalNotes,
        averageRating: avgRating._avg.rating?.toFixed(1) || '0.0',
        topInstitutes: topInstitutes.map(i => ({
          id: i.id,
          name: i.name,
          rating: i.rating,
          notesCount: i._count.notes,
        })),
      },
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    return sendError(res, 'Failed to fetch statistics', 500);
  }
}

// ============================================================================
// BULK UPDATE
// ============================================================================

async function bulkUpdate(req, res) {
  try {
    const { ids, action, value } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return sendError(res, 'No institutes selected', 400);
    }

    const validActions = ['setFeatured', 'setActive', 'delete'];
    if (!validActions.includes(action)) {
      return sendError(res, 'Invalid action', 400);
    }

    let result;

    switch (action) {
      case 'setFeatured':
        result = await prisma.institute.updateMany({
          where: { id: { in: ids } },
          data: { isFeatured: value === true },
        });
        break;

      case 'setActive':
        result = await prisma.institute.updateMany({
          where: { id: { in: ids } },
          data: { isActive: value === true },
        });
        break;

      case 'delete':
        // Soft delete
        result = await prisma.institute.updateMany({
          where: { id: { in: ids } },
          data: { isActive: false },
        });
        break;
    }

    clearCache();

    return sendResponse(res, {
      message: `Updated ${result.count} institutes`,
      data: { count: result.count },
    });
  } catch (error) {
    console.error('Error in bulk update:', error);
    return sendError(res, 'Failed to update institutes', 500);
  }
}

// ============================================================================
// EXPORT
// ============================================================================

module.exports = {
  getAll,
  getFeatured,
  getById,
  getBySlug,
  create,
  update,
  toggleFeatured,
  remove,
  getStatistics,
  bulkUpdate,
};