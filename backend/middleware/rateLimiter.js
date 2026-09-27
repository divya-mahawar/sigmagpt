import rateLimit from "express-rate-limit";


// ================= CHAT RATE LIMITER =================

export const chatLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute

    max: 20, // Maximum 20 requests per minute

    standardHeaders: true,
    legacyHeaders: false,

    message: {
        error: "Too many requests. Please try again later."
    }
});


// ================= AUTH RATE LIMITER =================

export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes

    max: 10, // Maximum 10 login/register attempts

    standardHeaders: true,
    legacyHeaders: false,

    message: {
        error: "Too many authentication attempts. Please try again later."
    }
});