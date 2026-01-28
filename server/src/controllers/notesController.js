/**
 * Notes Controller
 * Handles all note-related API operations with enhanced validation,
 * caching, logging, and comprehensive error handling.
 */

const { PrismaClient } = require('@prisma/client');
const { generateSlug, paginate } = require('../utils/helpers');
const config = require('../config');

const prisma = new PrismaClient();

// ============================================================================
// CONSTANTS
// ============================================================================

const VALID_CATEGORIES = ['UPSC', 'SSC', 'BANKING', 'STATE_PCS', 'RAILWAY', 'DEFENCE', 'TEACHING', 'OTHER'];
const VALID_SORT_OPTIONS = ['latest', 'oldest', 'price_low', 'price_high', 'popular', 'rating'];
const MAX_PAGE_LIMIT = 50;
const DEFAULT_LIMIT = 12;
const FEATURED_LIMIT = 8;

// ============================================================================
// SIMPLE IN-MEMORY CACHE
// ============================================================================

const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getFromCache(key) {
  const item = cache.get(key);
  if (!item) return null;
  if (Date.now() > item.expiry) {
    cache.delete(key);
    return null;
  }
  return item.data;
}

function setCache(key, data, ttl = CACHE_TTL) {
  cache.set(key, { data, expiry: Date.now() + ttl });
}

function clearCache(pattern = null) {
  if (!pattern) {
    cache.clear();
    return;
  }
  for (const key of cache.keys()) {
    if (key.includes(pattern)) {
      cache.delete(key);
    }
  }
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

function validatePagination(page, limit) {
  const parsedPage = Math.max(1, parseInt(page) || 1);
  const parsedLimit = Math.min(MAX_PAGE_LIMIT, Math.max(1, parseInt(limit) || DEFAULT_LIMIT));
  return { page: parsedPage, limit: parsedLimit };
}

function validateCategory(category) {
  if (!category) return null;
  const normalized = category.toUpperCase();
  return VALID_CATEGORIES.includes(normalized) ? normalized : null;
}

function validateSort(sort) {
  return VALID_SORT_OPTIONS.includes(sort) ? sort : 'latest';
}

function validateNoteInput(data) {
  const errors = [];

  if (!data.title || data.title.trim().length < 3) {
    errors.push('Title must be at least 3 characters long');
  }
  if (!data.category || !VALID_CATEGORIES.includes(data.category.toUpperCase())) {
    errors.push(`Category must be one of: ${VALID_CATEGORIES.join(', ')}`);
  }
  if (!data.instituteId) {
    errors.push('Institute ID is required');
  }
  if (data.pricePerPage && (isNaN(data.pricePerPage) || data.pricePerPage < 0)) {
    errors.push('Price per page must be a positive number');
  }
  if (data.pageCount && (isNaN(data.pageCount) || data.pageCount < 1)) {
    errors.push('Page count must be at least 1');
  }

  return errors;
}

// ============================================================================
// RESPONSE HELPERS
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

function paginatedResponse(res, data, pagination, message = 'Success') {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      pages: Math.ceil(pagination.total / pagination.limit),
      hasNext: pagination.page < Math.ceil(pagination.total / pagination.limit),
      hasPrev: pagination.page > 1,
    },
    timestamp: new Date().toISOString(),
  });
}

// ============================================================================
// CONTROLLER METHODS
// ============================================================================

/**
 * Get all notes with filtering, pagination, and sorting
 * GET /api/notes
 */
async function getAll(req, res) {
  try {
    const { category, institute, search, featured, sort = 'latest' } = req.query;
    const { page, limit } = validatePagination(req.query.page, req.query.limit);

    // Build cache key
    const cacheKey = `notes:list:${JSON.stringify({ page, limit, category, institute, search, featured, sort })}`;
    const cached = getFromCache(cacheKey);
    if (cached) {
      return paginatedResponse(res, cached.notes, cached.pagination, 'Notes retrieved from cache');
    }

    // Build where clause
    const where = { isActive: true };

    const validCategory = validateCategory(category);
    if (validCategory) where.category = validCategory;

    if (institute) where.instituteId = institute;

    if (featured === 'true') where.isFeatured = true;

    if (search && search.trim().length >= 2) {
      const searchTerm = search.trim();
      where.OR = [
        { title: { contains: searchTerm, mode: 'insensitive' } },
        { subject: { contains: searchTerm, mode: 'insensitive' } },
        { description: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }

    // Build order clause
    const validSort = validateSort(sort);
    let orderBy;
    switch (validSort) {
      case 'oldest':
        orderBy = { createdAt: 'asc' };
        break;
      case 'price_low':
        orderBy = { pricePerPage: 'asc' };
        break;
      case 'price_high':
        orderBy = { pricePerPage: 'desc' };
        break;
      case 'popular':
        orderBy = { viewCount: 'desc' };
        break;
      case 'rating':
        orderBy = { rating: 'desc' };
        break;
      default:
        orderBy = { createdAt: 'desc' };
    }

    const { skip, take } = paginate(page, limit);

    // Execute queries in parallel
    const [notes, total] = await Promise.all([
      prisma.note.findMany({
        where,
        include: {
          institute: {
            select: { id: true, name: true, slug: true, logo: true },
          },
        },
        orderBy,
        skip,
        take,
      }),
      prisma.note.count({ where }),
    ]);

    const pagination = { page, limit, total };

    // Cache the result
    setCache(cacheKey, { notes, pagination });

    return paginatedResponse(res, notes, pagination, 'Notes retrieved successfully');
  } catch (error) {
    console.error('Error fetching notes:', error);
    return errorResponse(res, 'Failed to fetch notes');
  }
}

/**
 * Get note by slug
 * GET /api/notes/:slug
 */
async function getBySlug(req, res) {
  try {
    const { slug } = req.params;

    if (!slug || slug.trim().length < 1) {
      return errorResponse(res, 'Invalid slug', 400);
    }

    // Check cache
    const cacheKey = `notes:slug:${slug}`;
    const cached = getFromCache(cacheKey);
    if (cached) {
      return successResponse(res, cached, 'Note retrieved from cache');
    }

    const note = await prisma.note.findUnique({
      where: { slug },
      include: {
        institute: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true,
            description: true,
          },
        },
      },
    });

    if (!note) {
      return errorResponse(res, 'Note not found', 404);
    }

    // Increment view count asynchronously
    prisma.note.update({
      where: { id: note.id },
      data: { viewCount: { increment: 1 } },
    }).catch(err => console.error('Failed to update view count:', err));

    // Get related notes
    const relatedNotes = await prisma.note.findMany({
      where: {
        isActive: true,
        category: note.category,
        id: { not: note.id },
      },
      take: 4,
      select: {
        id: true,
        title: true,
        slug: true,
        pageCount: true,
        pricePerPage: true,
        isFeatured: true,
        institute: { select: { name: true } },
      },
    });

    const result = { ...note, relatedNotes };

    // Cache the result
    setCache(cacheKey, result);

    return successResponse(res, result, 'Note retrieved successfully');
  } catch (error) {
    console.error('Error fetching note:', error);
    return errorResponse(res, 'Failed to fetch note');
  }
}

/**
 * Get featured notes
 * GET /api/notes/featured
 */
async function getFeatured(req, res) {
  try {
    const limit = Math.min(parseInt(req.query.limit) || FEATURED_LIMIT, 20);

    // Check cache
    const cacheKey = `notes:featured:${limit}`;
    const cached = getFromCache(cacheKey);
    if (cached) {
      return successResponse(res, cached, 'Featured notes retrieved from cache');
    }

    const notes = await prisma.note.findMany({
      where: { isActive: true, isFeatured: true },
      include: {
        institute: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    // Cache for longer since featured notes don't change often
    setCache(cacheKey, notes, 10 * 60 * 1000);

    return successResponse(res, notes, 'Featured notes retrieved successfully');
  } catch (error) {
    console.error('Error fetching featured notes:', error);
    return errorResponse(res, 'Failed to fetch featured notes');
  }
}

/**
 * Get all unique subjects
 * GET /api/notes/subjects
 */
async function getSubjects(req, res) {
  try {
    const { category } = req.query;

    // Check cache
    const cacheKey = `notes:subjects:${category || 'all'}`;
    const cached = getFromCache(cacheKey);
    if (cached) {
      return successResponse(res, cached, 'Subjects retrieved from cache');
    }

    const where = { isActive: true };
    const validCategory = validateCategory(category);
    if (validCategory) where.category = validCategory;

    const subjects = await prisma.note.findMany({
      where,
      select: { subject: true },
      distinct: ['subject'],
      orderBy: { subject: 'asc' },
    });

    const result = subjects.map(s => s.subject).filter(Boolean);

    // Cache for longer since subjects don't change often
    setCache(cacheKey, result, 30 * 60 * 1000);

    return successResponse(res, result, 'Subjects retrieved successfully');
  } catch (error) {
    console.error('Error fetching subjects:', error);
    return errorResponse(res, 'Failed to fetch subjects');
  }
}

/**
 * Get category statistics
 * GET /api/notes/categories/stats
 */
async function getCategoryStats(req, res) {
  try {
    // Check cache
    const cacheKey = 'notes:category-stats';
    const cached = getFromCache(cacheKey);
    if (cached) {
      return successResponse(res, cached, 'Category stats retrieved from cache');
    }

    const stats = await prisma.note.groupBy({
      by: ['category'],
      where: { isActive: true },
      _count: { id: true },
      _avg: { pricePerPage: true },
    });

    const result = stats.map(stat => ({
      category: stat.category,
      count: stat._count.id,
      avgPrice: Math.round((stat._avg.pricePerPage || 0) * 100) / 100,
    }));

    // Cache for longer since stats don't change frequently
    setCache(cacheKey, result, 15 * 60 * 1000);

    return successResponse(res, result, 'Category stats retrieved successfully');
  } catch (error) {
    console.error('Error fetching category stats:', error);
    return errorResponse(res, 'Failed to fetch category stats');
  }
}

/**
 * Calculate price for a note
 * POST /api/notes/calculate-price
 */
async function calculatePrice(req, res) {
  try {
    const { noteId, paperType, printType, bindingType, quantity = 1 } = req.body;

    if (!noteId) {
      return errorResponse(res, 'Note ID is required', 400);
    }

    const parsedQuantity = Math.max(1, Math.min(100, parseInt(quantity) || 1));

    const note = await prisma.note.findUnique({
      where: { id: noteId },
      select: { id: true, title: true, pageCount: true, pricePerPage: true },
    });

    if (!note) {
      return errorResponse(res, 'Note not found', 404);
    }

    const paperConfig = config.pricing.paperTypes[paperType];
    const printConfig = config.pricing.printTypes[printType];
    const bindingConfig = config.pricing.bindingTypes[bindingType];

    const paperMult = paperConfig?.multiplier || 1;
    const printMult = printConfig?.multiplier || 1;
    const bindingPrice = bindingConfig?.price || 0;

    const basePrice = note.pageCount * note.pricePerPage;
    const unitPrice = Math.round(basePrice * paperMult * printMult);
    const bindingTotal = bindingPrice * parsedQuantity;
    const subtotal = unitPrice * parsedQuantity;
    const totalPrice = subtotal + bindingTotal;

    // Calculate savings if applicable
    let savings = 0;
    let savingsPercentage = 0;
    if (parsedQuantity >= 5) {
      savings = Math.round(totalPrice * 0.05);
      savingsPercentage = 5;
    } else if (parsedQuantity >= 3) {
      savings = Math.round(totalPrice * 0.02);
      savingsPercentage = 2;
    }

    return successResponse(res, {
      note: { id: note.id, title: note.title, pageCount: note.pageCount },
      pricing: {
        basePrice,
        paperType: paperConfig?.name || paperType,
        paperMultiplier: paperMult,
        printType: printConfig?.name || printType,
        printMultiplier: printMult,
        bindingType: bindingConfig?.name || bindingType,
        bindingPrice,
      },
      calculation: {
        unitPrice,
        quantity: parsedQuantity,
        subtotal,
        bindingTotal,
        savings,
        savingsPercentage,
        totalPrice: totalPrice - savings,
      },
    }, 'Price calculated successfully');
  } catch (error) {
    console.error('Error calculating price:', error);
    return errorResponse(res, 'Failed to calculate price');
  }
}

/**
 * Create a new note (Admin only)
 * POST /api/admin/notes
 */
async function create(req, res) {
  try {
    const {
      title,
      description,
      subject,
      category,
      instituteId,
      pricePerPage,
      pageCount,
      isFeatured,
    } = req.body;

    // Validate input
    const errors = validateNoteInput(req.body);
    if (errors.length > 0) {
      return errorResponse(res, 'Validation failed', 400, errors);
    }

    // Check if institute exists
    const institute = await prisma.institute.findUnique({
      where: { id: instituteId },
    });
    if (!institute) {
      return errorResponse(res, 'Institute not found', 404);
    }

    // Generate unique slug
    let slug = generateSlug(title);
    const existing = await prisma.note.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    const note = await prisma.note.create({
      data: {
        title: title.trim(),
        slug,
        description: description?.trim(),
        subject: subject?.trim(),
        category: category.toUpperCase(),
        instituteId,
        pdfUrl: req.file ? `/${req.file.path}` : '/uploads/sample.pdf',
        pdfFileName: req.file?.originalname || 'sample.pdf',
        pageCount: parseInt(pageCount) || 100,
        pricePerPage: parseFloat(pricePerPage) || 1.0,
        isFeatured: isFeatured === 'true' || isFeatured === true,
      },
      include: {
        institute: { select: { id: true, name: true } },
      },
    });

    // Clear relevant caches
    clearCache('notes:');

    return successResponse(res, note, 'Note created successfully', 201);
  } catch (error) {
    console.error('Error creating note:', error);
    return errorResponse(res, 'Failed to create note');
  }
}

/**
 * Update a note (Admin only)
 * PUT /api/admin/notes/:id
 */
async function update(req, res) {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      subject,
      category,
      instituteId,
      pricePerPage,
      pageCount,
      isFeatured,
      isActive,
    } = req.body;

    // Check if note exists
    const existing = await prisma.note.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse(res, 'Note not found', 404);
    }

    // Build update data
    const updateData = {};
    if (title) {
      updateData.title = title.trim();
      if (title.trim() !== existing.title) {
        updateData.slug = generateSlug(title);
      }
    }
    if (description !== undefined) updateData.description = description?.trim();
    if (subject) updateData.subject = subject.trim();
    if (category) updateData.category = category.toUpperCase();
    if (instituteId) updateData.instituteId = instituteId;
    if (pricePerPage !== undefined) updateData.pricePerPage = parseFloat(pricePerPage);
    if (pageCount !== undefined) updateData.pageCount = parseInt(pageCount);
    if (isFeatured !== undefined) updateData.isFeatured = isFeatured === 'true' || isFeatured === true;
    if (isActive !== undefined) updateData.isActive = isActive === 'true' || isActive === true;

    if (req.file) {
      updateData.pdfUrl = `/${req.file.path}`;
      updateData.pdfFileName = req.file.originalname;
    }

    const note = await prisma.note.update({
      where: { id },
      data: updateData,
      include: {
        institute: { select: { id: true, name: true } },
      },
    });

    // Clear relevant caches
    clearCache('notes:');

    return successResponse(res, note, 'Note updated successfully');
  } catch (error) {
    console.error('Error updating note:', error);
    return errorResponse(res, 'Failed to update note');
  }
}

/**
 * Delete a note (Admin only)
 * DELETE /api/admin/notes/:id
 */
async function deleteNote(req, res) {
  try {
    const { id } = req.params;

    // Check if note exists
    const existing = await prisma.note.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse(res, 'Note not found', 404);
    }

    // Soft delete by setting isActive to false
    await prisma.note.update({
      where: { id },
      data: { isActive: false },
    });

    // Clear relevant caches
    clearCache('notes:');

    return successResponse(res, { id }, 'Note deleted successfully');
  } catch (error) {
    console.error('Error deleting note:', error);
    return errorResponse(res, 'Failed to delete note');
  }
}

/**
 * Get all notes for admin (including inactive)
 * GET /api/admin/notes
 */
async function getAllAdmin(req, res) {
  try {
    const { category, search, status } = req.query;
    const { page, limit } = validatePagination(req.query.page, req.query.limit);

    const where = {};

    const validCategory = validateCategory(category);
    if (validCategory) where.category = validCategory;

    if (status === 'active') where.isActive = true;
    else if (status === 'inactive') where.isActive = false;

    if (search && search.trim().length >= 2) {
      where.OR = [
        { title: { contains: search.trim(), mode: 'insensitive' } },
        { subject: { contains: search.trim(), mode: 'insensitive' } },
      ];
    }

    const { skip, take } = paginate(page, limit);

    const [notes, total] = await Promise.all([
      prisma.note.findMany({
        where,
        include: {
          institute: { select: { id: true, name: true } },
          _count: { select: { orderItems: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      prisma.note.count({ where }),
    ]);

    return paginatedResponse(res, notes, { page, limit, total }, 'Notes retrieved successfully');
  } catch (error) {
    console.error('Error fetching admin notes:', error);
    return errorResponse(res, 'Failed to fetch notes');
  }
}

/**
 * Get note statistics for admin dashboard
 * GET /api/admin/notes/stats
 */
async function getStats(req, res) {
  try {
    const [total, active, featured, categoryStats, recentNotes] = await Promise.all([
      prisma.note.count(),
      prisma.note.count({ where: { isActive: true } }),
      prisma.note.count({ where: { isFeatured: true } }),
      prisma.note.groupBy({
        by: ['category'],
        _count: { id: true },
      }),
      prisma.note.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, title: true, category: true, createdAt: true },
      }),
    ]);

    return successResponse(res, {
      total,
      active,
      inactive: total - active,
      featured,
      byCategory: categoryStats.map(s => ({
        category: s.category,
        count: s._count.id,
      })),
      recentNotes,
    }, 'Stats retrieved successfully');
  } catch (error) {
    console.error('Error fetching note stats:', error);
    return errorResponse(res, 'Failed to fetch stats');
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  // Public routes
  getAll,
  getBySlug,
  getFeatured,
  getSubjects,
  getCategoryStats,
  calculatePrice,
  // Admin routes
  create,
  update,
  deleteNote,
  getAllAdmin,
  getStats,
  // Utilities
  clearCache,
};