/**
 * Email Service
 * Comprehensive email service for sending transactional emails
 * including order confirmations, status updates, and password resets.
 */

const nodemailer = require('nodemailer');
const config = require('../config');

// ============================================================================
// CONFIGURATION
// ============================================================================

// Create transporter (configure based on your email provider)
const createTransporter = () => {
    // For development, use ethereal.email or mailtrap
    if (process.env.NODE_ENV === 'development') {
        return nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            auth: {
                user: process.env.SMTP_USER || 'ethereal_user',
                pass: process.env.SMTP_PASS || 'ethereal_pass',
            },
        });
    }

    // For production, use your email provider (Gmail, SendGrid, AWS SES, etc.)
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });
};

let transporter = null;

const getTransporter = () => {
    if (!transporter) {
        transporter = createTransporter();
    }
    return transporter;
};

// ============================================================================
// EMAIL TEMPLATES
// ============================================================================

const EMAIL_FROM = process.env.EMAIL_FROM || 'PrintPress <noreply@printpress.in>';
const BRAND_COLOR = '#f59e0b';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

/**
 * Base email template wrapper
 */
function baseTemplate(content, previewText = '') {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>PrintPress</title>
    <!--[if mso]>
    <style type="text/css">
        body, table, td {font-family: Arial, Helvetica, sans-serif !important;}
    </style>
    <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;">
    ${previewText ? `<div style="display: none; max-height: 0; overflow: hidden;">${previewText}</div>` : ''}
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f4f5;">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 30px; text-align: center;">
                            <h1 style="margin: 0; color: ${BRAND_COLOR}; font-size: 28px; font-weight: bold;">
                                PrintPress
                            </h1>
                            <p style="margin: 5px 0 0; color: #94a3b8; font-size: 14px;">Premium Study Notes</p>
                        </td>
                    </tr>
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            ${content}
                        </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #1a1a2e; padding: 30px; text-align: center;">
                            <p style="margin: 0 0 10px; color: #94a3b8; font-size: 14px;">
                                Need help? Contact us at <a href="mailto:support@printpress.in" style="color: ${BRAND_COLOR}; text-decoration: none;">support@printpress.in</a>
                            </p>
                            <p style="margin: 0; color: #64748b; font-size: 12px;">
                                © ${new Date().getFullYear()} PrintPress India Pvt. Ltd. All rights reserved.
                            </p>
                            <p style="margin: 10px 0 0; color: #64748b; font-size: 12px;">
                                <a href="${FRONTEND_URL}/privacy" style="color: #64748b; text-decoration: none;">Privacy Policy</a> | 
                                <a href="${FRONTEND_URL}/terms" style="color: #64748b; text-decoration: none;">Terms of Service</a>
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `;
}

/**
 * Button component for emails
 */
function emailButton(text, url, isPrimary = true) {
    const bgColor = isPrimary ? BRAND_COLOR : '#64748b';
    const textColor = isPrimary ? '#000000' : '#ffffff';
    return `
        <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 20px 0;">
            <tr>
                <td style="background-color: ${bgColor}; border-radius: 8px; padding: 14px 28px;">
                    <a href="${url}" style="color: ${textColor}; text-decoration: none; font-weight: 600; font-size: 16px; display: inline-block;">
                        ${text}
                    </a>
                </td>
            </tr>
        </table>
    `;
}

/**
 * Order items table component
 */
function orderItemsTable(items) {
    const rows = items.map(item => `
        <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                <strong style="color: #1e293b;">${item.note?.title || item.title}</strong>
                <br><span style="color: #64748b; font-size: 13px;">Qty: ${item.quantity}</span>
            </td>
            <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; text-align: right; color: #1e293b; font-weight: 600;">
                ₹${item.totalPrice || item.price}
            </td>
        </tr>
    `).join('');

    return `
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 20px 0;">
            ${rows}
        </table>
    `;
}

// ============================================================================
// EMAIL CONTENT GENERATORS
// ============================================================================

/**
 * Generate order confirmation email content
 */
function orderConfirmationContent(order) {
    return `
        <h2 style="margin: 0 0 20px; color: #1e293b; font-size: 24px;">Order Confirmed! 🎉</h2>
        <p style="margin: 0 0 20px; color: #475569; line-height: 1.6;">
            Thank you for your order, <strong>${order.customerName}</strong>! We've received your order and will process it shortly.
        </p>
        
        <div style="background-color: #f8fafc; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                    <td>
                        <p style="margin: 0 0 5px; color: #64748b; font-size: 13px;">Order Number</p>
                        <p style="margin: 0; color: #1e293b; font-size: 18px; font-weight: bold;">${order.orderNumber}</p>
                    </td>
                    <td style="text-align: right;">
                        <p style="margin: 0 0 5px; color: #64748b; font-size: 13px;">Order Date</p>
                        <p style="margin: 0; color: #1e293b; font-size: 14px;">${new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    </td>
                </tr>
            </table>
        </div>

        <h3 style="margin: 30px 0 15px; color: #1e293b; font-size: 18px;">Order Summary</h3>
        ${orderItemsTable(order.items)}

        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 20px 0;">
            <tr>
                <td style="color: #64748b;">Subtotal</td>
                <td style="text-align: right; color: #1e293b;">₹${order.subtotal}</td>
            </tr>
            ${order.deliveryCharge > 0 ? `
            <tr>
                <td style="color: #64748b; padding-top: 8px;">Delivery</td>
                <td style="text-align: right; color: #1e293b; padding-top: 8px;">₹${order.deliveryCharge}</td>
            </tr>
            ` : `
            <tr>
                <td style="color: #10b981; padding-top: 8px;">Delivery</td>
                <td style="text-align: right; color: #10b981; padding-top: 8px;">FREE</td>
            </tr>
            `}
            ${order.discount > 0 ? `
            <tr>
                <td style="color: #10b981; padding-top: 8px;">Discount</td>
                <td style="text-align: right; color: #10b981; padding-top: 8px;">-₹${order.discount}</td>
            </tr>
            ` : ''}
            <tr>
                <td style="color: #1e293b; font-weight: bold; padding-top: 15px; border-top: 2px solid #e2e8f0;">Total</td>
                <td style="text-align: right; color: ${BRAND_COLOR}; font-weight: bold; font-size: 20px; padding-top: 15px; border-top: 2px solid #e2e8f0;">₹${order.totalAmount}</td>
            </tr>
        </table>

        <h3 style="margin: 30px 0 15px; color: #1e293b; font-size: 18px;">Shipping Address</h3>
        <div style="background-color: #f8fafc; border-radius: 8px; padding: 20px;">
            <p style="margin: 0; color: #1e293b; line-height: 1.8;">
                <strong>${order.customerName}</strong><br>
                ${order.addressLine1}<br>
                ${order.addressLine2 ? `${order.addressLine2}<br>` : ''}
                ${order.city}, ${order.state} - ${order.pincode}<br>
                ${order.landmark ? `Landmark: ${order.landmark}<br>` : ''}
                Phone: ${order.customerPhone}
            </p>
        </div>

        ${emailButton('Track Your Order', `${FRONTEND_URL}/track?orderNumber=${order.orderNumber}&phone=${order.customerPhone}`)}

        <p style="margin: 20px 0 0; color: #64748b; font-size: 14px; line-height: 1.6;">
            Estimated delivery: <strong>3-5 business days</strong><br>
            We'll send you a shipping confirmation email with tracking details once your order ships.
        </p>
    `;
}

/**
 * Generate order status update email content
 */
function orderStatusUpdateContent(order) {
    const statusMessages = {
        CONFIRMED: {
            emoji: '✅',
            title: 'Order Confirmed',
            message: 'Your order has been confirmed and is being prepared for printing.',
        },
        PROCESSING: {
            emoji: '⚙️',
            title: 'Order Processing',
            message: 'Your notes are currently being printed with care.',
        },
        PRINTED: {
            emoji: '📄',
            title: 'Printing Complete',
            message: 'Your notes have been printed and are being prepared for shipping.',
        },
        SHIPPED: {
            emoji: '🚚',
            title: 'Order Shipped',
            message: `Your order is on its way! ${order.courierName ? `Courier: ${order.courierName}` : ''}`,
        },
        DELIVERED: {
            emoji: '🎉',
            title: 'Order Delivered',
            message: 'Your order has been delivered. Happy studying!',
        },
    };

    const status = statusMessages[order.status] || { emoji: '📦', title: order.status, message: '' };

    return `
        <div style="text-align: center; margin-bottom: 30px;">
            <span style="font-size: 48px;">${status.emoji}</span>
            <h2 style="margin: 20px 0 10px; color: #1e293b; font-size: 24px;">${status.title}</h2>
            <p style="margin: 0; color: #64748b; font-size: 16px;">${status.message}</p>
        </div>

        <div style="background-color: #f8fafc; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                    <td>
                        <p style="margin: 0 0 5px; color: #64748b; font-size: 13px;">Order Number</p>
                        <p style="margin: 0; color: #1e293b; font-size: 18px; font-weight: bold;">${order.orderNumber}</p>
                    </td>
                    ${order.trackingNumber ? `
                    <td style="text-align: right;">
                        <p style="margin: 0 0 5px; color: #64748b; font-size: 13px;">Tracking Number</p>
                        <p style="margin: 0; color: #1e293b; font-size: 14px; font-weight: bold;">${order.trackingNumber}</p>
                    </td>
                    ` : ''}
                </tr>
            </table>
        </div>

        ${emailButton('Track Your Order', `${FRONTEND_URL}/track?orderNumber=${order.orderNumber}&phone=${order.customerPhone}`)}
    `;
}

/**
 * Generate password reset email content
 */
function passwordResetContent(resetUrl) {
    return `
        <h2 style="margin: 0 0 20px; color: #1e293b; font-size: 24px;">Reset Your Password</h2>
        <p style="margin: 0 0 20px; color: #475569; line-height: 1.6;">
            We received a request to reset your password. Click the button below to create a new password:
        </p>

        ${emailButton('Reset Password', resetUrl)}

        <p style="margin: 20px 0; color: #64748b; font-size: 14px; line-height: 1.6;">
            This link will expire in <strong>1 hour</strong>. If you didn't request this, you can safely ignore this email.
        </p>

        <div style="background-color: #fef3c7; border-radius: 8px; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #92400e; font-size: 14px;">
                ⚠️ <strong>Security tip:</strong> Never share this link with anyone. PrintPress will never ask for your password via email.
            </p>
        </div>
    `;
}

/**
 * Generate welcome email content
 */
function welcomeContent(name) {
    return `
        <div style="text-align: center; margin-bottom: 30px;">
            <span style="font-size: 48px;">👋</span>
            <h2 style="margin: 20px 0 10px; color: #1e293b; font-size: 24px;">Welcome to PrintPress!</h2>
        </div>

        <p style="margin: 0 0 20px; color: #475569; line-height: 1.6;">
            Hi ${name || 'there'},<br><br>
            Welcome to PrintPress! We're thrilled to have you on board. Here's what you can do:
        </p>

        <ul style="margin: 0 0 20px; padding-left: 20px; color: #475569; line-height: 2;">
            <li>Browse <strong>200+</strong> premium study notes from top institutes</li>
            <li>Customize print settings (paper type, binding, etc.)</li>
            <li>Track your orders in real-time</li>
            <li>Get delivered within <strong>3-5 business days</strong></li>
        </ul>

        ${emailButton('Start Browsing', `${FRONTEND_URL}/notes`)}
    `;
}

// ============================================================================
// EMAIL SENDING FUNCTIONS
// ============================================================================

/**
 * Send email helper
 */
async function sendEmail(to, subject, htmlContent, previewText = '') {
    try {
        const transport = getTransporter();
        const html = baseTemplate(htmlContent, previewText);

        const info = await transport.sendMail({
            from: EMAIL_FROM,
            to,
            subject: `PrintPress - ${subject}`,
            html,
        });

        console.log(`Email sent to ${to}: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error(`Failed to send email to ${to}:`, error);
        return { success: false, error: error.message };
    }
}

/**
 * Send order confirmation email
 */
async function sendOrderConfirmation(order) {
    const subject = `Order Confirmed - ${order.orderNumber}`;
    const content = orderConfirmationContent(order);
    const preview = `Your order ${order.orderNumber} has been confirmed. Total: ₹${order.totalAmount}`;
    return sendEmail(order.customerEmail, subject, content, preview);
}

/**
 * Send order status update email
 */
async function sendOrderStatusUpdate(order) {
    const statusLabels = {
        CONFIRMED: 'Order Confirmed',
        PROCESSING: 'Order Processing',
        PRINTED: 'Printing Complete',
        SHIPPED: 'Order Shipped',
        DELIVERED: 'Order Delivered',
    };
    const subject = `${statusLabels[order.status] || 'Order Update'} - ${order.orderNumber}`;
    const content = orderStatusUpdateContent(order);
    return sendEmail(order.customerEmail, subject, content);
}

/**
 * Send password reset email
 */
async function sendPasswordReset(email, resetUrl) {
    const subject = 'Reset Your Password';
    const content = passwordResetContent(resetUrl);
    const preview = 'Click here to reset your PrintPress admin password';
    return sendEmail(email, subject, content, preview);
}

/**
 * Send welcome email
 */
async function sendWelcome(email, name) {
    const subject = 'Welcome to PrintPress!';
    const content = welcomeContent(name);
    const preview = 'Welcome to PrintPress! Start browsing premium study notes today.';
    return sendEmail(email, subject, content, preview);
}

/**
 * Send order cancellation email
 */
async function sendOrderCancellation(order) {
    const content = `
        <h2 style="margin: 0 0 20px; color: #1e293b; font-size: 24px;">Order Cancelled</h2>
        <p style="margin: 0 0 20px; color: #475569; line-height: 1.6;">
            Your order <strong>${order.orderNumber}</strong> has been cancelled.
            ${order.cancelReason ? `<br><br><strong>Reason:</strong> ${order.cancelReason}` : ''}
        </p>
        
        <p style="margin: 0 0 20px; color: #475569; line-height: 1.6;">
            If payment was already made, a refund will be processed within 5-7 business days.
        </p>

        ${emailButton('Browse Notes', `${FRONTEND_URL}/notes`)}
    `;
    const subject = `Order Cancelled - ${order.orderNumber}`;
    return sendEmail(order.customerEmail, subject, content);
}

/**
 * Send contact form notification to admin
 */
async function sendContactNotification(data) {
    const content = `
        <h2 style="margin: 0 0 20px; color: #1e293b; font-size: 24px;">New Contact Form Submission</h2>
        
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
            <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #64748b;">Name</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #1e293b;">${data.name}</td>
            </tr>
            <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #64748b;">Email</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #1e293b;">${data.email}</td>
            </tr>
            <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #64748b;">Phone</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #1e293b;">${data.phone || 'Not provided'}</td>
            </tr>
            <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #64748b;">Subject</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #1e293b;">${data.subject}</td>
            </tr>
        </table>

        <h3 style="margin: 30px 0 15px; color: #1e293b; font-size: 18px;">Message</h3>
        <div style="background-color: #f8fafc; border-radius: 8px; padding: 20px;">
            <p style="margin: 0; color: #1e293b; line-height: 1.6; white-space: pre-wrap;">${data.message}</p>
        </div>
    `;
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@printpress.in';
    return sendEmail(adminEmail, `Contact Form: ${data.subject}`, content);
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
    sendEmail,
    sendOrderConfirmation,
    sendOrderStatusUpdate,
    sendPasswordReset,
    sendWelcome,
    sendOrderCancellation,
    sendContactNotification,
    // Template helpers (for testing/customization)
    baseTemplate,
    emailButton,
    orderItemsTable,
};
