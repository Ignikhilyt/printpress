/**
 * Newsletter Controller
 * Handles newsletter subscription endpoints
 */

const { PrismaClient } = require('@prisma/client');
const validator = require('validator');

const prisma = new PrismaClient();

/**
 * Subscribe to newsletter
 * POST /api/v1/newsletter/subscribe
 */
exports.subscribe = async (req, res) => {
    try {
        const { email } = req.body;

        // Validate email
        if (!email || !validator.isEmail(email)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid email address',
            });
        }

        // Check if already subscribed
        const existing = await prisma.newsletterSubscriber.findUnique({
            where: { email: email.toLowerCase() },
        });

        if (existing) {
            if (existing.isActive) {
                return res.status(400).json({
                    success: false,
                    message: 'This email is already subscribed to our newsletter',
                });
            } else {
                // Reactivate subscription
                await prisma.newsletterSubscriber.update({
                    where: { email: email.toLowerCase() },
                    data: { isActive: true, unsubscribedAt: null },
                });

                return res.status(200).json({
                    success: true,
                    message: 'Successfully resubscribed to our newsletter!',
                });
            }
        }

        // Create new subscriber
        await prisma.newsletterSubscriber.create({
            data: {
                email: email.toLowerCase(),
                ipAddress: req.ip || req.connection.remoteAddress,
                userAgent: req.headers['user-agent'],
            },
        });

        // TODO: Send welcome email
        sendWelcomeEmail(email);

        // TODO: Add to email marketing platform (Mailchimp/SendGrid)

        res.status(201).json({
            success: true,
            message: 'Successfully subscribed to our newsletter!',
        });
    } catch (error) {
        console.error('Newsletter subscription error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to subscribe. Please try again later.',
        });
    }
};

/**
 * Unsubscribe from newsletter
 * POST /api/v1/newsletter/unsubscribe
 */
exports.unsubscribe = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email || !validator.isEmail(email)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid email address',
            });
        }

        const subscriber = await prisma.newsletterSubscriber.findUnique({
            where: { email: email.toLowerCase() },
        });

        if (!subscriber || !subscriber.isActive) {
            return res.status(404).json({
                success: false,
                message: 'Email not found in our subscriber list',
            });
        }

        await prisma.newsletterSubscriber.update({
            where: { email: email.toLowerCase() },
            data: {
                isActive: false,
                unsubscribedAt: new Date(),
            },
        });

        res.status(200).json({
            success: true,
            message: 'Successfully unsubscribed from our newsletter',
        });
    } catch (error) {
        console.error('Newsletter unsubscribe error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to unsubscribe. Please try again later.',
        });
    }
};

/**
 * Get all newsletter subscribers (Admin only)
 * GET /api/v1/newsletter/subscribers
 */
exports.getSubscribers = async (req, res) => {
    try {
        const { page = 1, limit = 50, active } = req.query;

        const where = {};
        if (active !== undefined) {
            where.isActive = active === 'true';
        }

        const [subscribers, total] = await Promise.all([
            prisma.newsletterSubscriber.findMany({
                where,
                skip: (page - 1) * limit,
                take: parseInt(limit),
                orderBy: { createdAt: 'desc' },
            }),
            prisma.newsletterSubscriber.count({ where }),
        ]);

        res.status(200).json({
            success: true,
            data: subscribers,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Get subscribers error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch subscribers',
        });
    }
};

/**
 * Send welcome email to new subscriber
 */
async function sendWelcomeEmail(email) {
    // TODO: Implement email service
    console.log(`Sending welcome email to ${email}`);

    // Integration with your email service:
    // const emailService = require('../services/emailService');
    // emailService.sendWelcomeNewsletter(email);
}
