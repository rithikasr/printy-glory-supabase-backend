import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.resend.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // Port 587 uses STARTTLS
    auth: {
        user: process.env.SMTP_USER || 'resend',
        pass: process.env.SMTP_PASS,
    },
    connectionTimeout: 20000,
});

/**
 * Generic function to send simple text/html emails
 */
export const sendEmail = async (to: string, subject: string, message: string) => {
    try {
        const mailOptions = {
            from: `"${process.env.FROM_NAME || 'Printy Glory'}" <${process.env.FROM_EMAIL}>`,
            to,
            subject,
            text: message,
            html: message.replace(/\n/g, '<br/>'), // Basic conversion
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Email sent to ${to}:`, info.messageId);
        return info;
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

    const mailOptions = {
        from: `"${process.env.FROM_NAME || 'Printy Glory'}" <${process.env.FROM_EMAIL}>`,
        to: email,
        subject: `Order Confirmed! #${orderId}`,
        html: `
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
        `,
    };

    try {
        console.log(`📧 Attempting to send email via SMTP: ${process.env.SMTP_HOST}:${process.env.SMTP_PORT}`);
        console.log(`📧 From: ${process.env.FROM_EMAIL}, To: ${email}`);
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Order confirmation email sent:', info.messageId);
        return info;
    } catch (error) {
        console.error('❌ SMTP Error encountered:');
        console.error(error);
        throw error;
    }
};
