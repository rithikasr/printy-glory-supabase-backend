const nodemailer = require('nodemailer');
require('dotenv').config({ path: '../../printy-glory-nodejs-final/printy-glory-supabase-backend/.env' });

const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587');
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;

console.log('Config loaded:');
console.log('Host:', SMTP_HOST);
console.log('Port:', SMTP_PORT);
console.log('User:', SMTP_USER);
console.log('Pass:', SMTP_PASS ? '********' : 'undefined');

const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
    },
    connectionTimeout: 10000,
});

async function main() {
    try {
        console.log('Testing SMTP connection...');
        await transporter.verify();
        console.log('SMTP transporter verified successfully!');
        
        console.log('Sending test email...');
        const info = await transporter.sendMail({
            from: `"Test PG" <${SMTP_USER}>`,
            to: SMTP_USER,
            subject: 'Test Email From Printy Glory',
            text: 'If you see this, SMTP email sending is working!',
        });
        console.log('Email sent successfully. MessageId:', info.messageId);
    } catch (error) {
        console.error('SMTP test failed:', error);
    }
}

main();
