require('dotenv').config({ path: '../../printy-glory-nodejs-final/printy-glory-supabase-backend/.env' });
const { sendOrderConfirmationEmail } = require('./src/utils/emailService');

async function main() {
    try {
        console.log('Sending test order confirmation email...');
        const result = await sendOrderConfirmationEmail({
            email: 'iamriyashyder@gmail.com',
            orderId: 'TEST1234',
            productName: 'Custom Phone Case (Test)',
            totalAmount: 120000, // 1200.00
            currency: 'inr',
            designPreview: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9',
            shippingDetails: {
                name: 'John Doe',
                address: {
                    line1: '123 Test St',
                    city: 'Test City',
                    state: 'TS',
                    postal_code: '12345',
                    country: 'India'
                }
            }
        });
        console.log('Success! Email result:', result);
    } catch (err) {
        console.error('Failed to send order email:', err);
    }
}

main();
