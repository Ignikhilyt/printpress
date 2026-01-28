/**
 * Orders Controller
 * Handles all order-related API operations with enhanced validation,
 * email notifications, status tracking, and comprehensive error handling.
 */

const { PrismaClient } = require('@prisma/client');
const { generateOrderNumber, paginate } = require('../utils/helpers');
const config = require('../config');

const prisma = new PrismaClient();

// ============================================================================
// CONSTANTS
// ============================================================================

const ORDER_STATUSES = ['PENDING', 'CONFIRMED', 'PROCESSING', 'PRINTED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
const PAYMENT_STATUSES = ['PENDING', 'PAID', 'FAILED', 'REFUNDED'];
const PAYMENT_METHODS = ['COD', 'UPI', 'CARD', 'NETBANKING'];
const MAX_ITEMS_PER_ORDER = 20;
const MAX_QUANTITY_PER_ITEM = 10;

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

function validateCustomerInfo(data) {
  const errors = [];

  if (!data.customerName || data.customerName.trim().length < 2) {
    errors.push('Customer name must be at least 2 characters');
  }

  if (!data.customerEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.customerEmail)) {
    errors.push('Valid email address is required');
  }

  if (!data.customerPhone || !/^[6-9]\d{9}$/.test(data.customerPhone.replace(/\D/g, ''))) {
    errors.push('Valid 10-digit Indian phone number is required');
  }

  return errors;
}

function validateAddress(data) {
  const errors = [];

  if (!data.addressLine1 || data.addressLine1.trim().length < 10) {
    errors.push('Address line 1 must be at least 10 characters');
  }

  if (!data.city || data.city.trim().length < 2) {
    errors.push('City is required');
  }

  if (!data.state || data.state.trim().length < 2) {
    errors.push('State is required');
  }

  if (!data.pincode || !/^\d{6}$/.test(data.pincode)) {
    errors.push('Valid 6-digit pincode is required');
  }

  return errors;
}

function validateOrderItems(items) {
  const errors = [];

  if (!items || !Array.isArray(items) || items.length === 0) {
    errors.push('Order must have at least one item');
    return errors;
  }

  if (items.length > MAX_ITEMS_PER_ORDER) {
    errors.push(`Maximum ${MAX_ITEMS_PER_ORDER} items allowed per order`);
  }

  items.forEach((item, index) => {
    if (!item.noteId) {
      errors.push(`Item ${index + 1}: Note ID is required`);
    }
    if (!item.quantity || item.quantity < 1 || item.quantity > MAX_QUANTITY_PER_ITEM) {
      errors.push(`Item ${index + 1}: Quantity must be between 1 and ${MAX_QUANTITY_PER_ITEM}`);
    }
  });

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
// PRICE CALCULATION
// ============================================================================

function calculateOrderPricing(notes, items, options) {
  const { paperType, printType, bindingType } = options;

  const paperMult = config.pricing.paperTypes[paperType]?.multiplier || 1;
  const printMult = config.pricing.printTypes[printType]?.multiplier || 1;
  const bindingPrice = config.pricing.bindingTypes[bindingType]?.price || 0;

  let subtotal = 0;
  let totalCopies = 0;
  const orderItems = [];

  items.forEach(item => {
    const note = notes.find(n => n.id === item.noteId);
    if (!note) return;

    const basePrice = note.pageCount * note.pricePerPage;
    const adjustedPrice = Math.round(basePrice * paperMult * printMult);
    const itemTotal = adjustedPrice * item.quantity;
    subtotal += itemTotal;
    totalCopies += item.quantity;

    orderItems.push({
      noteId: item.noteId,
      quantity: item.quantity,
      pageCount: note.pageCount,
      pricePerPage: note.pricePerPage,
      paperMultiplier: paperMult,
      printMultiplier: printMult,
      unitPrice: adjustedPrice,
      totalPrice: itemTotal,
    });
  });

  const bindingTotal = bindingPrice * totalCopies;

  // Calculate delivery charge (free above ₹499)
  const deliveryCharge = subtotal >= 499 ? 0 : 50;

  // Bulk discount
  let discount = 0;
  let discountPercentage = 0;
  if (totalCopies >= 10) {
    discountPercentage = 10;
  } else if (totalCopies >= 5) {
    discountPercentage = 5;
  }
  discount = Math.round((subtotal * discountPercentage) / 100);

  const totalAmount = subtotal + bindingTotal + deliveryCharge - discount;

  return {
    orderItems,
    pricing: {
      subtotal,
      bindingTotal,
      deliveryCharge,
      discount,
      discountPercentage,
      totalAmount,
      totalCopies,
    },
  };
}

// ============================================================================
// CONTROLLER METHODS
// ============================================================================

/**
 * Create a new order
 * POST /api/orders
 */
async function create(req, res) {
  try {
    const {
      customerName,
      customerEmail,
      customerPhone,
      addressLine1,
      addressLine2,
      city,
      state,
      pincode,
      landmark,
      paperType,
      printType,
      bindingType,
      paymentMethod,
      customerNotes,
      items,
    } = req.body;

    // Validate customer info
    const customerErrors = validateCustomerInfo({ customerName, customerEmail, customerPhone });
    if (customerErrors.length > 0) {
      return errorResponse(res, 'Customer validation failed', 400, customerErrors);
    }

    // Validate address
    const addressErrors = validateAddress({ addressLine1, city, state, pincode });
    if (addressErrors.length > 0) {
      return errorResponse(res, 'Address validation failed', 400, addressErrors);
    }

    // Validate items
    const itemErrors = validateOrderItems(items);
    if (itemErrors.length > 0) {
      return errorResponse(res, 'Items validation failed', 400, itemErrors);
    }

    // Get notes from database
    const noteIds = items.map(i => i.noteId);
    const notes = await prisma.note.findMany({
      where: { id: { in: noteIds }, isActive: true },
    });

    if (notes.length !== noteIds.length) {
      const foundIds = notes.map(n => n.id);
      const missingIds = noteIds.filter(id => !foundIds.includes(id));
      return errorResponse(res, 'Some notes not found or inactive', 400, {
        missingNotes: missingIds,
      });
    }

    // Calculate pricing
    const { orderItems, pricing } = calculateOrderPricing(notes, items, {
      paperType,
      printType,
      bindingType,
    });

    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        customerName: customerName.trim(),
        customerEmail: customerEmail.toLowerCase().trim(),
        customerPhone: customerPhone.replace(/\D/g, ''),
        addressLine1: addressLine1.trim(),
        addressLine2: addressLine2?.trim() || null,
        city: city.trim(),
        state: state.trim(),
        pincode: pincode,
        landmark: landmark?.trim() || null,
        subtotal: pricing.subtotal,
        bindingTotal: pricing.bindingTotal,
        deliveryCharge: pricing.deliveryCharge,
        discount: pricing.discount,
        totalAmount: pricing.totalAmount,
        paperType,
        printType,
        bindingType,
        paymentMethod: paymentMethod || 'COD',
        paymentStatus: paymentMethod === 'COD' ? 'PENDING' : 'PENDING',
        customerNotes: customerNotes?.trim() || null,
        items: { create: orderItems },
      },
      include: {
        items: {
          include: {
            note: {
              select: { id: true, title: true, slug: true },
            },
          },
        },
      },
    });

    // TODO: Send order confirmation email
    // await emailService.sendOrderConfirmation(order);

    // TODO: Send SMS notification
    // await smsService.sendOrderConfirmation(order);

    return successResponse(res, order, 'Order placed successfully', 201);
  } catch (error) {
    console.error('Error creating order:', error);
    return errorResponse(res, 'Failed to create order');
  }
}

/**
 * Track order by order number and phone
 * GET /api/orders/track
 */
async function trackOrder(req, res) {
  try {
    const { orderNumber, phone } = req.query;

    if (!orderNumber || !phone) {
      return errorResponse(res, 'Order number and phone are required', 400);
    }

    const order = await prisma.order.findFirst({
      where: {
        orderNumber: orderNumber.toUpperCase(),
        customerPhone: phone.replace(/\D/g, ''),
      },
      include: {
        items: {
          include: {
            note: {
              select: { id: true, title: true, slug: true },
            },
          },
        },
      },
    });

    if (!order) {
      return errorResponse(res, 'Order not found. Please check your order number and phone.', 404);
    }

    // Build tracking history
    const trackingHistory = [
      { status: 'PENDING', label: 'Order Placed', date: order.createdAt, completed: true },
    ];

    const statusOrder = ['PENDING', 'CONFIRMED', 'PROCESSING', 'PRINTED', 'SHIPPED', 'DELIVERED'];
    const currentStatusIndex = statusOrder.indexOf(order.status);

    statusOrder.forEach((status, index) => {
      if (index === 0) return;
      trackingHistory.push({
        status,
        label: getStatusLabel(status),
        date: index <= currentStatusIndex ? order.updatedAt : null,
        completed: index <= currentStatusIndex,
      });
    });

    return successResponse(res, {
      order: {
        orderNumber: order.orderNumber,
        status: order.status,
        statusLabel: getStatusLabel(order.status),
        paymentStatus: order.paymentStatus,
        totalAmount: order.totalAmount,
        createdAt: order.createdAt,
        estimatedDelivery: order.estimatedDelivery,
        trackingNumber: order.trackingNumber,
        courierName: order.courierName,
      },
      items: order.items.map(item => ({
        title: item.note.title,
        quantity: item.quantity,
        price: item.totalPrice,
      })),
      shipping: {
        addressLine1: order.addressLine1,
        addressLine2: order.addressLine2,
        city: order.city,
        state: order.state,
        pincode: order.pincode,
      },
      trackingHistory,
    }, 'Order tracking retrieved successfully');
  } catch (error) {
    console.error('Error tracking order:', error);
    return errorResponse(res, 'Failed to track order');
  }
}

function getStatusLabel(status) {
  const labels = {
    PENDING: 'Order Placed',
    CONFIRMED: 'Order Confirmed',
    PROCESSING: 'Processing',
    PRINTED: 'Printed',
    SHIPPED: 'Shipped',
    DELIVERED: 'Delivered',
    CANCELLED: 'Cancelled',
  };
  return labels[status] || status;
}

/**
 * Get all orders (Admin)
 * GET /api/admin/orders
 */
async function getAll(req, res) {
  try {
    const { status, paymentStatus, search, dateFrom, dateTo } = req.query;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));

    const where = {};

    if (status && ORDER_STATUSES.includes(status)) {
      where.status = status;
    }

    if (paymentStatus && PAYMENT_STATUSES.includes(paymentStatus)) {
      where.paymentStatus = paymentStatus;
    }

    if (search) {
      where.OR = [
        { orderNumber: { contains: search.toUpperCase(), mode: 'insensitive' } },
        { customerName: { contains: search, mode: 'insensitive' } },
        { customerPhone: { contains: search } },
        { customerEmail: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) where.createdAt.lte = new Date(dateTo);
    }

    const { skip, take } = paginate(page, limit);

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: {
            include: {
              note: { select: { id: true, title: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      prisma.order.count({ where }),
    ]);

    return paginatedResponse(res, orders, { page, limit, total }, 'Orders retrieved successfully');
  } catch (error) {
    console.error('Error fetching orders:', error);
    return errorResponse(res, 'Failed to fetch orders');
  }
}

/**
 * Get order by ID (Admin)
 * GET /api/admin/orders/:id
 */
async function getById(req, res) {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            note: {
              include: {
                institute: { select: { name: true } },
              },
            },
          },
        },
      },
    });

    if (!order) {
      return errorResponse(res, 'Order not found', 404);
    }

    return successResponse(res, order, 'Order retrieved successfully');
  } catch (error) {
    console.error('Error fetching order:', error);
    return errorResponse(res, 'Failed to fetch order');
  }
}

/**
 * Update order status (Admin)
 * PATCH /api/admin/orders/:id/status
 */
async function updateStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, trackingNumber, courierName, estimatedDelivery, adminNotes } = req.body;

    // Validate status
    if (status && !ORDER_STATUSES.includes(status)) {
      return errorResponse(res, `Invalid status. Must be one of: ${ORDER_STATUSES.join(', ')}`, 400);
    }

    // Check if order exists
    const existing = await prisma.order.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse(res, 'Order not found', 404);
    }

    // Build update data
    const updateData = {};
    if (status) updateData.status = status;
    if (trackingNumber !== undefined) updateData.trackingNumber = trackingNumber;
    if (courierName !== undefined) updateData.courierName = courierName;
    if (estimatedDelivery) updateData.estimatedDelivery = new Date(estimatedDelivery);
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes;

    // Auto-update payment status for COD orders when delivered
    if (status === 'DELIVERED' && existing.paymentMethod === 'COD') {
      updateData.paymentStatus = 'PAID';
    }

    const order = await prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        items: { include: { note: { select: { title: true } } } },
      },
    });

    // TODO: Send status update notification
    // if (status) await emailService.sendStatusUpdate(order);

    return successResponse(res, order, 'Order status updated successfully');
  } catch (error) {
    console.error('Error updating order status:', error);
    return errorResponse(res, 'Failed to update order status');
  }
}

/**
 * Update payment status (Admin)
 * PATCH /api/admin/orders/:id/payment
 */
async function updatePaymentStatus(req, res) {
  try {
    const { id } = req.params;
    const { paymentStatus, transactionId } = req.body;

    if (!PAYMENT_STATUSES.includes(paymentStatus)) {
      return errorResponse(res, `Invalid payment status. Must be one of: ${PAYMENT_STATUSES.join(', ')}`, 400);
    }

    const order = await prisma.order.update({
      where: { id },
      data: { paymentStatus, transactionId },
    });

    return successResponse(res, order, 'Payment status updated successfully');
  } catch (error) {
    console.error('Error updating payment status:', error);
    return errorResponse(res, 'Failed to update payment status');
  }
}

/**
 * Cancel order (Admin)
 * POST /api/admin/orders/:id/cancel
 */
async function cancelOrder(req, res) {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const existing = await prisma.order.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse(res, 'Order not found', 404);
    }

    if (['SHIPPED', 'DELIVERED', 'CANCELLED'].includes(existing.status)) {
      return errorResponse(res, `Cannot cancel order with status: ${existing.status}`, 400);
    }

    const order = await prisma.order.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        cancelReason: reason,
        cancelledAt: new Date(),
      },
    });

    // TODO: Send cancellation email
    // await emailService.sendCancellation(order);

    // TODO: Process refund if payment was made
    // if (existing.paymentStatus === 'PAID') await paymentService.refund(order);

    return successResponse(res, order, 'Order cancelled successfully');
  } catch (error) {
    console.error('Error cancelling order:', error);
    return errorResponse(res, 'Failed to cancel order');
  }
}

/**
 * Get order statistics (Admin)
 * GET /api/admin/orders/stats
 */
async function getStats(req, res) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);

    const [
      totalOrders,
      todayOrders,
      pendingOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      thisMonthRevenue,
      lastMonthRevenue,
      recentOrders,
      statusCounts,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { createdAt: { gte: today } } }),
      prisma.order.count({ where: { status: 'PENDING' } }),
      prisma.order.count({ where: { status: 'PROCESSING' } }),
      prisma.order.count({ where: { status: 'SHIPPED' } }),
      prisma.order.count({ where: { status: 'DELIVERED' } }),
      prisma.order.aggregate({
        where: { createdAt: { gte: thisMonth }, status: { not: 'CANCELLED' } },
        _sum: { totalAmount: true },
      }),
      prisma.order.aggregate({
        where: { createdAt: { gte: lastMonth, lt: thisMonth }, status: { not: 'CANCELLED' } },
        _sum: { totalAmount: true },
      }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          orderNumber: true,
          customerName: true,
          totalAmount: true,
          status: true,
          createdAt: true,
        },
      }),
      prisma.order.groupBy({
        by: ['status'],
        _count: { id: true },
      }),
    ]);

    const thisMonthTotal = thisMonthRevenue._sum.totalAmount || 0;
    const lastMonthTotal = lastMonthRevenue._sum.totalAmount || 0;
    const revenueGrowth = lastMonthTotal > 0
      ? Math.round(((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100)
      : 100;

    return successResponse(res, {
      overview: {
        totalOrders,
        todayOrders,
        pendingOrders,
        processingOrders,
        shippedOrders,
        deliveredOrders,
      },
      revenue: {
        thisMonth: thisMonthTotal,
        lastMonth: lastMonthTotal,
        growth: revenueGrowth,
      },
      byStatus: statusCounts.map(s => ({
        status: s.status,
        count: s._count.id,
      })),
      recentOrders,
    }, 'Order stats retrieved successfully');
  } catch (error) {
    console.error('Error fetching order stats:', error);
    return errorResponse(res, 'Failed to fetch order stats');
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  // Public routes
  create,
  trackOrder,
  // Admin routes
  getAll,
  getById,
  updateStatus,
  updatePaymentStatus,
  cancelOrder,
  getStats,
};