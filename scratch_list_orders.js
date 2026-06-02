const mongoose = require('mongoose');
require('dotenv').config({ path: '../../printy-glory-nodejs-final/printy-glory-supabase-backend/.env' });

const MONGODB_URI = process.env.MONGODB_URI;

const OrderSchema = new mongoose.Schema({
    customer_email: String,
    total_amount: Number,
    currency: String,
    payment_status: String,
    created_at: { type: Date, default: Date.now }
}, { collection: 'orders' });

const Order = mongoose.model('Order', OrderSchema);

async function main() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('Connected!');

        console.log('Fetching latest 5 orders...');
        const orders = await Order.find().sort({ created_at: -1 }).limit(5);
        console.log('Orders found:', orders.length);
        orders.forEach(o => {
            console.log(`- ID: ${o._id}, Email: ${o.customer_email}, Amount: ${o.total_amount} ${o.currency}, Status: ${o.payment_status}, Created: ${o.created_at}`);
        });

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
    }
}

main();
