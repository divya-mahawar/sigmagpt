import express from "express";
import Thread from "../models/Thread.js";
import getGeminiAPIResponse from "../utils/gemini.js";
import verifyToken from "../middleware/auth.js"; // Auth middleware import kiya

const router = express.Router();

router.post("/register", async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "Email already registered!" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({ username, email, password: hashedPassword });
        await newUser.save();
        
        res.status(201).json({ message: "User registered successfully!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: "Invalid email or password!" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: "Invalid email or password!" });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || "secret_key_here", { expiresIn: "1d" });

        res.json({
            message: "Logged in successfully!",
            token,
            user: { id: user._id, username: user.username, email: user.email }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ================= TEST =================

router.post("/test", verifyToken, async (req, res) => {
    try {
        const thread = new Thread({
            userId: req.user.id, // User ID attach ki
            threadId: "abc",
            title: "Testing New Thread2"
        });

        const response = await thread.save();
        res.send(response);

    } catch (err) {
        console.log(err);
        res.status(500).json({
            error: "Failed to save in DB"
        });
    }
});


// ================= GET ALL THREADS (Protected) =================

router.get("/thread", verifyToken, async (req, res) => {
    try {
        const threads = await Thread
            .find({ userId: req.user.id }) // Sirf logged-in user ke threads
            .sort({ updatedAt: -1 });

        res.json(threads);

    } catch (err) {
        console.log(err);
        res.status(500).json({
            error: "Failed to fetch threads"
        });
    }
});


// ================= GET SINGLE THREAD (Protected) =================
router.get("/thread/:threadId", verifyToken, async (req, res) => {
    const { threadId } = req.params;

    try {
        const thread = await Thread.findOne({ threadId, userId: req.user.id });

        if (!thread) {
            return res.status(404).json({
                error: "Thread not found"
            });
        }

        res.json(thread.messages);

    } catch (err) {
        console.log(err);
        res.status(500).json({
            error: "Failed to fetch chat"
        });
    }
});


// ================= DELETE THREAD (Protected) =================
router.delete("/thread/:threadId", verifyToken, async (req, res) => {
    const { threadId } = req.params;

    try {
        const deletedThread = await Thread.findOneAndDelete({ threadId, userId: req.user.id });

        if (!deletedThread) {
            return res.status(404).json({
                error: "Thread not found"
            });
        }

        res.status(200).json({
            success: "Thread deleted successfully"
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({
            error: "Failed to delete thread"
        });
    }
});


// ================= CHAT (Protected) =================
router.post("/chat", verifyToken, async (req, res) => {
    const { threadId, message } = req.body;

    // Validate request
    if (!threadId || !message) {
        return res.status(400).json({
            error: "Missing required fields"
        });
    }

    try {
        // Find existing thread for this specific user
        let thread = await Thread.findOne({ threadId, userId: req.user.id });

        // If thread doesn't exist, create it with userId
        if (!thread) {
            thread = new Thread({
                userId: req.user.id, // User ID bind kar di
                threadId,
                title: message,
                messages: [
                    {
                        role: "user",
                        content: message
                    }
                ]
            });
        } else {
            // Existing thread, push user message
            thread.messages.push({
                role: "user",
                content: message
            });
        }

        // ================= GEMINI =================
        const assistantReply = await getGeminiAPIResponse(message);

        // Save Gemini response
        thread.messages.push({
            role: "assistant",
            content: assistantReply
        });

        // Update timestamp
        thread.updatedAt = new Date();

        // Save thread
        await thread.save();

        // Send response to frontend
        res.json({
            reply: assistantReply
        });

    } catch (err) {
        console.log("Chat Error:", err);
        res.status(500).json({
            error: "Something went wrong"
        });
    }
});


export default router;