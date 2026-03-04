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

