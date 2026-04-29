import Iyzipay from 'iyzipay';
import dotenv from 'dotenv';
dotenv.config();

console.log("Iyzico Debug:");
console.log("API_KEY present:", !!process.env.IYZICO_API_KEY);
console.log("SECRET_KEY present:", !!process.env.IYZICO_SECRET_KEY);
console.log("BASE_URL:", process.env.IYZICO_BASE_URL);

let iyzico;

if (process.env.IYZICO_API_KEY && process.env.IYZICO_SECRET_KEY) {
    try {
        iyzico = new Iyzipay({
            apiKey: process.env.IYZICO_API_KEY,
            secretKey: process.env.IYZICO_SECRET_KEY,
            uri: process.env.IYZICO_BASE_URL || 'https://sandbox-api.iyzipay.com'
        });
    } catch (e) {
        console.warn("⚠️ Iyzico Initialization Failed:", e.message);
    }
} else {
    console.warn("⚠️ Iyzico API Keys missing. Payments will be disabled.");
    // Mock object to prevent crashes on access
    iyzico = {
        checkoutFormInitialize: { create: (req, cb) => cb("Iyzico not configured", null) },
        checkoutForm: { retrieve: (req, cb) => cb("Iyzico not configured", null) }
    };
}

export default iyzico;
