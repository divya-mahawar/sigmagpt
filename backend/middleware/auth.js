import jwt from "jsonwebtoken";

const verifyToken = (req, res, next) => {

    const authHeader = req.headers.authorization;

    // Check whether Authorization header exists
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            error: "Authentication required."
        });
    }

    // Extract token
    const token = authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            error: "Authentication required."
        });
    }

    // JWT secret must be configured
    if (!process.env.JWT_SECRET) {
        console.error("JWT_SECRET is not configured.");

        return res.status(500).json({
            error: "Server authentication is not configured."
        });
    }

    try {

        // Verify JWT using our secret
        const verified = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // Store decoded user information
        req.user = verified;

        next();

    } catch (err) {

        console.error("JWT verification failed:", err.name);

        return res.status(401).json({
            error: "Invalid or expired token."
        });
    }
};

export default verifyToken;