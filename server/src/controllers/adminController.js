/**
 * Admin Controller
 * Comprehensive admin dashboard with analytics, reports,
 * activity logs, and system health monitoring.
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// ============================================================================
// HELPERS
// ============================================================================

function sendResponse(res, { success = true, data = null, message = null, status = 200 }) {
  const response = { success };
  if (message) response.message = message;
  if (data !== null) response.data = data;
  return res.status(status).json(response);
}

function sendError(res, message, status = 400) {
  return res.status(status).json({ success: false, message });
}

function getDateRange(range) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (range) {
    case 'today':
      return { gte: today };
    case 'yesterday':
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      return { gte: yesterday, lt: today };
    case 'week':
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      return { gte: weekAgo };
    case 'month':
      const monthAgo = new Date(today);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      return { gte: monthAgo };
    case 'year':
      const yearAgo = new Date(today);
      yearAgo.setFullYear(yearAgo.getFullYear() - 1);
      return { gte: yearAgo };
    default:
      return { gte: new Date(0) };
  }
}

// ============================================================================
// DASHBOARD STATS
// ============================================================================

async function getDashboardStats(req, res) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);

    // Parallel queries for performance
    const [
      totalOrders,
      pendingOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      totalNotes,
      totalInstitutes,
      todayOrders,
      recentOrders,
      totalRevenue,
      thisMonthRevenue,
      lastMonthRevenue,
      todayRevenue,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: 'PENDING' } }),
      prisma.order.count({ where: { status: 'PROCESSING' } }),
      prisma.order.count({ where: { status: 'SHIPPED' } }),
      prisma.order.count({ where: { status: 'DELIVERED' } }),
      prisma.note.count({ where: { isActive: true } }),
      prisma.institute.count({ where: { isActive: true } }),
      prisma.order.count({ where: { createdAt: { gte: today } } }),
      prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          orderNumber: true,
          customerName: true,
          totalAmount: true,
          status: true,
          createdAt: true,
        },
      }),
      prisma.order.aggregate({
        where: { status: 'DELIVERED' },
        _sum: { totalAmount: true },
      }),
      prisma.order.aggregate({
        where: { createdAt: { gte: thisMonthStart }, status: 'DELIVERED' },
        _sum: { totalAmount: true },
      }),
      prisma.order.aggregate({
        where: {
          createdAt: { gte: lastMonthStart, lte: lastMonthEnd },
          status: 'DELIVERED',
        },
        _sum: { totalAmount: true },
      }),
      prisma.order.aggregate({
        where: { createdAt: { gte: today }, status: { not: 'CANCELLED' } },
        _sum: { totalAmount: true },
      }),
    ]);

    // Calculate growth
    const thisMonthTotal = thisMonthRevenue._sum.totalAmount || 0;
    const lastMonthTotal = lastMonthRevenue._sum.totalAmount || 0;
    const growth = lastMonthTotal > 0
      ? Math.round(((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100)
      : 0;

    // Order pipeline
    const pipeline = [
      { status: 'PENDING', count: pendingOrders, label: 'Pending' },
      { status: 'PROCESSING', count: processingOrders, label: 'Processing' },
      { status: 'SHIPPED', count: shippedOrders, label: 'Shipped' },
      { status: 'DELIVERED', count: deliveredOrders, label: 'Delivered' },
    ];

    return sendResponse(res, {
      data: {
        overview: {
          totalOrders,
          pendingOrders,
          totalNotes,
          totalInstitutes,
          todayOrders,
          processingOrders,
        },
        revenue: {
          total: totalRevenue._sum.totalAmount || 0,
          thisMonth: thisMonthTotal,
          lastMonth: lastMonthTotal,
          today: todayRevenue._sum.totalAmount || 0,
          growth,
        },
        pipeline,
        recentOrders,
      },
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return sendError(res, 'Failed to fetch dashboard stats', 500);
  }
}

// ============================================================================
// ANALYTICS DATA
// ============================================================================

async function getAnalytics(req, res) {
  try {
    const { range = 'month' } = req.query;
    const dateRange = getDateRange(range);

    // Orders by status
    const ordersByStatus = await prisma.order.groupBy({
      by: ['status'],
      where: { createdAt: dateRange },
      _count: { id: true },
      _sum: { totalAmount: true },
    });

    // Orders by day (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyOrders = await prisma.order.groupBy({
      by: ['createdAt'],
      where: { createdAt: { gte: thirtyDaysAgo } },
      _count: { id: true },
      _sum: { totalAmount: true },
    });

    // Aggregate daily orders
    const dailyData = {};
    dailyOrders.forEach(order => {
      const date = order.createdAt.toISOString().split('T')[0];
      if (!dailyData[date]) {
        dailyData[date] = { orders: 0, revenue: 0 };
      }
      dailyData[date].orders += order._count.id;
      dailyData[date].revenue += order._sum.totalAmount || 0;
    });

    // Top selling notes
    const topNotes = await prisma.orderItem.groupBy({
      by: ['noteId'],
      _count: { id: true },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 10,
    });

    // Get note details
    const noteIds = topNotes.map(n => n.noteId);
    const notes = await prisma.note.findMany({
      where: { id: { in: noteIds } },
      select: { id: true, title: true, category: { select: { name: true } } },
    });

    const topSellingNotes = topNotes.map(item => {
      const note = notes.find(n => n.id === item.noteId);
      return {
        noteId: item.noteId,
        title: note?.title || 'Unknown',
        category: note?.category?.name || 'General',
        totalSold: item._sum.quantity || 0,
        orderCount: item._count.id,
      };
    });

    // Top categories
    const categoryStats = await prisma.orderItem.findMany({
      where: { createdAt: dateRange },
      include: { note: { include: { category: true } } },
    });

    const categoryMap = {};
    categoryStats.forEach(item => {
      const catName = item.note?.category?.name || 'General';
      if (!categoryMap[catName]) {
        categoryMap[catName] = { orders: 0, revenue: 0 };
      }
      categoryMap[catName].orders += item.quantity;
      categoryMap[catName].revenue += item.totalPrice || 0;
    });

    const topCategories = Object.entries(categoryMap)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Customer locations
    const locationStats = await prisma.order.groupBy({
      by: ['state'],
      where: { state: { not: null } },
      _count: { id: true },
    });

    const topLocations = locationStats
      .sort((a, b) => b._count.id - a._count.id)
      .slice(0, 10)
      .map(loc => ({ state: loc.state, orders: loc._count.id }));

    return sendResponse(res, {
      data: {
        ordersByStatus,
        dailyData: Object.entries(dailyData).map(([date, data]) => ({ date, ...data })),
        topSellingNotes,
        topCategories,
        topLocations,
      },
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return sendError(res, 'Failed to fetch analytics', 500);
  }
}

// ============================================================================
// SALES REPORT
// ============================================================================

async function getSalesReport(req, res) {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;

    const where = { status: { not: 'CANCELLED' } };
    if (startDate) where.createdAt = { gte: new Date(startDate) };
    if (endDate) {
      where.createdAt = { ...where.createdAt, lte: new Date(endDate) };
    }

    const orders = await prisma.order.findMany({
      where,
      select: {
        createdAt: true,
        totalAmount: true,
        items: { select: { quantity: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Aggregate by period
    const salesData = {};
    orders.forEach(order => {
      let key;
      const date = new Date(order.createdAt);

      switch (groupBy) {
        case 'month':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
        case 'week':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().split('T')[0];
          break;
        default:
          key = date.toISOString().split('T')[0];
      }

      if (!salesData[key]) {
        salesData[key] = { orders: 0, revenue: 0, items: 0 };
      }
      salesData[key].orders += 1;
      salesData[key].revenue += order.totalAmount || 0;
      salesData[key].items += order.items.reduce((sum, i) => sum + i.quantity, 0);
    });

    const report = Object.entries(salesData)
      .map(([period, data]) => ({ period, ...data }))
      .sort((a, b) => a.period.localeCompare(b.period));

    // Summary
    const totalRevenue = report.reduce((sum, r) => sum + r.revenue, 0);
    const totalOrders = report.reduce((sum, r) => sum + r.orders, 0);
    const totalItems = report.reduce((sum, r) => sum + r.items, 0);
    const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

    return sendResponse(res, {
      data: {
        report,
        summary: {
          totalRevenue,
          totalOrders,
          totalItems,
          avgOrderValue,
        },
      },
    });
  } catch (error) {
    console.error('Sales report error:', error);
    return sendError(res, 'Failed to generate sales report', 500);
  }
}

// ============================================================================
// INVENTORY REPORT
// ============================================================================

async function getInventoryReport(req, res) {
  try {
    const notes = await prisma.note.findMany({
      where: { isPublished: true },
      include: {
        institute: { select: { name: true } },
        category: { select: { name: true } },
        _count: { select: { orderItems: true } },
      },
    });

    // Low stock items (would need actual stock tracking)
    const inventory = notes.map(note => ({
      id: note.id,
      title: note.title,
      institute: note.institute?.name || 'Unknown',
      category: note.category?.name || 'General',
      pageCount: note.pageCount,
      pricePerPage: note.pricePerPage,
      totalPrice: note.pageCount * note.pricePerPage,
      orderCount: note._count.orderItems,
      views: note.viewCount || 0,
      isActive: note.isPublished,
    }));

    // Summary
    const totalNotes = inventory.length;
    const avgPrice = totalNotes > 0
      ? Math.round(inventory.reduce((sum, n) => sum + n.totalPrice, 0) / totalNotes)
      : 0;
    const totalPages = inventory.reduce((sum, n) => sum + n.pageCount, 0);

    return sendResponse(res, {
      data: {
        inventory,
        summary: {
          totalNotes,
          avgPrice,
          totalPages,
          totalValue: inventory.reduce((sum, n) => sum + n.totalPrice, 0),
        },
      },
    });
  } catch (error) {
    console.error('Inventory report error:', error);
    return sendError(res, 'Failed to generate inventory report', 500);
  }
}

// ============================================================================
// ACTIVITY LOG
// ============================================================================

async function getActivityLog(req, res) {
  try {
    const { page = 1, limit = 20, type } = req.query;

    // Get recent orders as activity
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit),
      select: {
        id: true,
        orderNumber: true,
        customerName: true,
        status: true,
        totalAmount: true,
        createdAt: true,
      },
    });

    const activities = orders.map(order => ({
      id: order.id,
      type: 'ORDER',
      message: `New order ${order.orderNumber} from ${order.customerName}`,
      amount: order.totalAmount,
      status: order.status,
      timestamp: order.createdAt,
    }));

    return sendResponse(res, {
      data: { activities },
    });
  } catch (error) {
    console.error('Activity log error:', error);
    return sendError(res, 'Failed to fetch activity log', 500);
  }
}

// ============================================================================
// SYSTEM HEALTH
// ============================================================================

async function getSystemHealth(req, res) {
  try {
    const startTime = Date.now();

    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    const dbLatency = Date.now() - startTime;

    // Get counts
    const [orderCount, noteCount, userCount] = await Promise.all([
      prisma.order.count(),
      prisma.note.count(),
      prisma.user.count(),
    ]);

    return sendResponse(res, {
      data: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        database: {
          status: 'connected',
          latency: `${dbLatency}ms`,
        },
        counts: {
          orders: orderCount,
          notes: noteCount,
          users: userCount,
        },
        uptime: process.uptime(),
        memory: process.memoryUsage(),
      },
    });
  } catch (error) {
    console.error('System health error:', error);
    return sendResponse(res, {
      data: {
        status: 'unhealthy',
        error: error.message,
      },
      status: 500,
    });
  }
}

// ============================================================================
// EXPORT ORDERS
// ============================================================================

async function exportOrders(req, res) {
  try {
    const { format = 'json', startDate, endDate, status } = req.query;

    const where = {};
    if (startDate) where.createdAt = { gte: new Date(startDate) };
    if (endDate) where.createdAt = { ...where.createdAt, lte: new Date(endDate) };
    if (status) where.status = status;

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: {
          include: { note: { select: { title: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const exportData = orders.map(order => ({
      orderNumber: order.orderNumber,
      date: order.createdAt.toISOString().split('T')[0],
      customer: order.customerName,
      email: order.customerEmail,
      phone: order.customerPhone,
      address: `${order.addressLine1}, ${order.city}, ${order.state} - ${order.pincode}`,
      items: order.items.map(i => `${i.note?.title} (x${i.quantity})`).join('; '),
      subtotal: order.subtotal,
      delivery: order.deliveryCharge,
      total: order.totalAmount,
      status: order.status,
      paymentStatus: order.paymentStatus,
    }));

    if (format === 'csv') {
      const headers = Object.keys(exportData[0] || {}).join(',');
      const rows = exportData.map(row => Object.values(row).join(','));
      const csv = [headers, ...rows].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=orders.csv');
      return res.send(csv);
    }

    return sendResponse(res, { data: exportData });
  } catch (error) {
    console.error('Export orders error:', error);
    return sendError(res, 'Failed to export orders', 500);
  }
}

// ============================================================================
// EXPORT
// ============================================================================

module.exports = {
  getDashboardStats,
  getAnalytics,
  getSalesReport,
  getInventoryReport,
  getActivityLog,
  getSystemHealth,
  exportOrders,
};