import express from "express";
import "dotenv/config";
import cors from "cors";
import mongoose from "mongoose";
import chatRoutes from "./routes/chat.js";
import authRoutes from "./routes/Auth.js";
const app = express();
const PORT = process.env.PORT || 8080;


// ================= MIDDLEWARE =================

app.use(express.json());
const allowedOrigins = [
    "http://localhost:5173",
    "https://sigmagpt-three.vercel.app"
];

app.use(
    cors({
        origin: allowedOrigins
    })
);


// ================= ROUTES =================

app.use("/api", chatRoutes);
app.use("/api/auth", authRoutes);
app.get("/", (req, res) => {
    res.send("SigmaGPT Backend is running!");
});

// ================= DATABASE =================

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        console.log("Connected with Database!");

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });

    } catch (err) {
        console.error(
            "Failed to connect with Database:",
            err.message
        );

        process.exit(1);
    }
};

connectDB();