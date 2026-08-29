import jwt from "jsonwebtoken";

const verifyToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // "Bearer TOKEN" format

    if (!token) {
        return res.status(401).json({ error: "Access denied! No token provided." });
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET || "secret_key_here");
        req.user = verified; // user id request me save ho jayegi
        next();
    } catch (err) {
        res.status(403).json({ error: "Invalid or expired token!" });
    }
};

export default verifyToken;