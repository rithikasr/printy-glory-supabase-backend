require('dotenv').config({ path: '../../printy-glory-nodejs-final/printy-glory-supabase-backend/.env' });

const SMTP_PASS = process.env.SMTP_PASS;
const RESEND_API_KEY = process.env.RESEND_API_KEY;

const shouldUseResend = () => {
    const key = process.env.RESEND_API_KEY || SMTP_PASS;
    return !!key && key.startsWith('re_');
};

console.log('RESEND_API_KEY:', RESEND_API_KEY);
console.log('SMTP_PASS:', SMTP_PASS);
console.log('shouldUseResend():', shouldUseResend());
