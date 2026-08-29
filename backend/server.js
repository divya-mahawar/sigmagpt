import express from "express";
import "dotenv/config";
import cors from "cors";
import mongoose from "mongoose";
import chatRoutes from "./routes/chat.js";
import authRoutes from "./routes/Auth.js";
const app = express();
const PORT = 8080;


// ================= MIDDLEWARE =================

app.use(express.json());
app.use(cors());


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

    } catch (err) {

        console.log("Failed to connect with Db:", err);

    }
};


// ================= SERVER =================

app.listen(PORT, () => {

    console.log(`server running on ${PORT}`);

    connectDB();

});