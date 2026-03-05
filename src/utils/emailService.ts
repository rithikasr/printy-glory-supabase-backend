/**
 * RESEND API INTEGRATION (HTTPS)
 * We use the REST API instead of SMTP because cloud providers like Render 
 * often block SMTP ports (587/465), leading to ETIMEDOUT.
 * HTTPS (Port 443) is never blocked.
 */

const RESEND_API_KEY = process.env.SMTP_PASS; // We reuse the pass field as the API key
const FROM_EMAIL = process.env.FROM_EMAIL || 'onboarding@resend.dev';
const FROM_NAME = process.env.FROM_NAME || 'Printy Glory';

/**
 * Generic function to send simple text/html emails via Resend API
 */
export const sendEmail = async (to: string, subject: string, message: string) => {
    try {
        console.log(`📧 Sending API email to: ${to}`);

        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${RESEND_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
                to: [to],
                subject: subject,
                html: message.replace(/\n/g, '<br/>'),
                text: message,
            }),
        });

        const data: any = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to send email via API');
        }

        console.log(`✅ Email sent via Resend API to ${to}:`, data.id);
        return data;
    } catch (error) {
        console.error(`❌ Error sending email to ${to}:`, error);
        throw error;
    }
};

/**
 * Send a beautifully designed OTP email for password reset
 */
export const sendOtpEmail = async (to: string, otp: string) => {
    const htmlContent = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; background: #ffffff;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%); padding: 40px 20px; text-align: center; border-radius: 12px 12px 0 0;">
                <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">🔐 Password Reset</h1>
                <p style="color: rgba(255,255,255,0.85); margin: 10px 0 0; font-size: 15px;">We received a request to reset your password</p>
            </div>

            <!-- Body -->
            <div style="padding: 40px 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
                <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 25px;">
                    Hi there! Use the code below to reset your password. This code is valid for <strong>5 minutes</strong>.
                </p>

                <!-- OTP Code Box -->
                <div style="text-align: center; margin: 30px 0;">
                    <div style="display: inline-block; background: linear-gradient(135deg, #f0f0ff 0%, #faf5ff 100%); border: 2px dashed #8b5cf6; border-radius: 16px; padding: 25px 50px;">
                        <span style="font-size: 42px; font-weight: 800; letter-spacing: 12px; color: #6366f1; font-family: 'Courier New', monospace;">${otp}</span>
                    </div>
                </div>

                <!-- Warning -->
                <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 14px 18px; border-radius: 0 8px 8px 0; margin: 25px 0;">
                    <p style="color: #92400e; margin: 0; font-size: 13px; line-height: 1.5;">
                        ⚠️ <strong>Security Tip:</strong> Never share this code with anyone. Printy Glory will never ask for your OTP via phone or chat.
                    </p>
                </div>

                <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 20px 0 0;">
                    If you didn't request a password reset, you can safely ignore this email. Your account is secure.
                </p>

                <!-- Divider -->
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />

                <!-- Footer -->
                <div style="text-align: center;">
                    <p style="color: #10b981; font-weight: 700; font-size: 16px; margin: 0 0 5px;">Printy Glory</p>
                    <p style="color: #9ca3af; font-size: 12px; margin: 0;">Custom designs, crafted with love 💜</p>
                </div>
            </div>
        </div>
    `;

    try {
        console.log(`📧 Sending OTP email to: ${to}`);

        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${RESEND_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
                to: [to],
                subject: '🔐 Your Password Reset Code — Printy Glory',
                html: htmlContent,
                text: `Your OTP for password reset is: ${otp}. It expires in 5 minutes. If you didn't request this, please ignore this email.`,
            }),
        });

        const data: any = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to send OTP email via API');
        }

        console.log(`✅ OTP email sent via Resend API to ${to}:`, data.id);
        return data;
    } catch (error) {
        console.error(`❌ Error sending OTP email to ${to}:`, error);
        throw error;
    }
};


export const sendOrderConfirmationEmail = async (orderData: {
    email: string;
    orderId: string;
    productName: string;
    totalAmount: number;
    currency: string;
    designPreview?: string;
    shippingDetails?: any;
}) => {
    const { email, orderId, productName, totalAmount, currency, designPreview, shippingDetails } = orderData;

    const htmlContent = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #10b981;">Thank You for Your Order!</h1>
                <p style="color: #666;">We're high-fiving our screens because you chose Printy Glory!</p>
            </div>
            
            <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h3 style="margin-top: 0; color: #111827;">Order Summary</h3>
                <p><strong>Order ID:</strong> #${orderId}</p>
                <p><strong>Product:</strong> ${productName}</p>
                <p><strong>Total Paid:</strong> ${currency.toUpperCase()} ${(totalAmount / 100).toFixed(2)}</p>
            </div>

            ${designPreview ? `
            <div style="text-align: center; margin-bottom: 20px;">
                <h4 style="color: #666;">Your Awesome Design</h4>
                <img src="${designPreview}" alt="Design Preview" style="max-width: 200px; border-radius: 10px; border: 1px solid #eee; padding: 5px;" />
            </div>
            ` : ''}

            ${shippingDetails ? `
            <div style="margin-bottom: 20px;">
                <h3 style="color: #111827;">Shipping To:</h3>
                <p style="color: #4b5563; line-height: 1.5;">
                    ${shippingDetails.name}<br/>
                    ${shippingDetails.address.line1}${shippingDetails.address.line2 ? `, ${shippingDetails.address.line2}` : ''}<br/>
                    ${shippingDetails.address.city}, ${shippingDetails.address.state} ${shippingDetails.address.postal_code}<br/>
                    ${shippingDetails.address.country}
                </p>
            </div>
            ` : ''}

            <div style="text-align: center; border-top: 1px solid #eee; padding-top: 20px; margin-top: 20px;">
                <p style="color: #9ca3af; font-size: 14px;">If you have any questions, just reply to this email.</p>
                <p style="color: #10b981; font-weight: bold;">Stay Awesome!</p>
            </div>
        </div>
    `;

    try {
        console.log(`📧 Sending order confirmation API email to: ${email}`);

        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${RESEND_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
                to: [email],
                subject: `Order Confirmed! #${orderId}`,
                html: htmlContent,
            }),
        });

        const data: any = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to send order email via API');
        }

        console.log('✅ Order confirmation email sent via Resend API:', data.id);
        return data;
    } catch (error) {
        console.error('❌ Resend API Error encountered:');
        console.error(error);
        throw error;
    }
};

