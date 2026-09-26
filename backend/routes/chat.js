import express from "express";
import Thread from "../models/Thread.js";
import getGeminiAPIResponse from "../utils/gemini.js";
import verifyToken from "../middleware/auth.js"; // Auth middleware import kiya

const router = express.Router();
console.log("CHAT ROUTES FILE LOADED");



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


router.post("/explain-selection", verifyToken, async (req, res) => {
    try {
        console.log("===== EXPLAIN SELECTION START =====");

        console.log("Request body:", req.body);
        console.log("User:", req.user);

        const { selectedText, question } = req.body;

        console.log("Selected text:", selectedText);
        console.log("Question:", question);

        if (!selectedText || !question) {
            console.log("Missing selectedText or question");

            return res.status(400).json({
                error: "Selected text and question are required"
            });
        }

        const instruction = `
The user selected this text:

"${selectedText}"

The user wants to know:

"${question}"

Answer the user's question specifically using the selected text as context.
Explain clearly and simply.
`;

        console.log("Instruction created");
        console.log("Calling Gemini...");

        const explanation = await getGeminiAPIResponse(instruction);

        console.log("Gemini response received:", explanation);

        res.json({
            explanation
        });

    } catch (err) {
        console.log("===== EXPLAIN SELECTION ERROR =====");
        console.log(err);
        console.log("Error message:", err.message);
        console.log("Error stack:", err.stack);

        res.status(500).json({
            error: err.message
        });
    }
});


export default router;