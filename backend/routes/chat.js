import express from "express";
import Thread from "../models/Thread.js";
import getGeminiAPIResponse from "../utils/gemini.js";
import verifyToken from "../middleware/auth.js"; 
import { chatLimiter } from "../middleware/rateLimiter.js";

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
router.post("/chat", verifyToken,  chatLimiter, async (req, res) => {

    const { threadId, message } = req.body;

    // Validate request
    if (
        typeof threadId !== "string" ||
        !threadId.trim() ||
        typeof message !== "string" ||
        !message.trim()
    ) {
        return res.status(400).json({
            error: "Valid threadId and message are required."
        });
    }

    const cleanMessage = message.trim();

    if (cleanMessage.length > 4000) {
        return res.status(400).json({
            error: "Message is too long. Maximum 4000 characters allowed."
        });
    }

    try {

        let thread = await Thread.findOne({
            threadId,
            userId: req.user.id
        });

        if (!thread) {

            thread = new Thread({
                userId: req.user.id,
                threadId,
                title: cleanMessage,
                messages: [
                    {
                        role: "user",
                        content: cleanMessage
                    }
                ]
            });

        } else {

            thread.messages.push({
                role: "user",
                content: cleanMessage
            });
        }

        // Gemini
        const assistantReply =
            await getGeminiAPIResponse(cleanMessage);

        thread.messages.push({
            role: "assistant",
            content: assistantReply
        });

        thread.updatedAt = new Date();

        await thread.save();

        res.json({
            reply: assistantReply
        });

    }  catch (err) {
    console.error("Chat Error:", err.message);

    if (err.status === 429) {
        return res.status(429).json({
            error: "AI service is temporarily rate-limited. Please try again later."
        });
    }

    res.status(500).json({
        error: "Something went wrong while generating the response."
    });
}
});


router.post("/explain-selection", verifyToken, async (req, res) => {
    try {

        const { selectedText, question } = req.body;

        const cleanSelectedText =
            typeof selectedText === "string"
                ? selectedText.trim()
                : "";

        const cleanQuestion =
            typeof question === "string"
                ? question.trim()
                : "";

        // Validation
        if (!cleanSelectedText || !cleanQuestion) {
            return res.status(400).json({
                error: "Selected text and question are required."
            });
        }

        // Prevent extremely large input
        if (cleanSelectedText.length > 6000) {
            return res.status(400).json({
                error: "Selected text is too long."
            });
        }

        if (cleanQuestion.length > 500) {
            return res.status(400).json({
                error: "Question is too long."
            });
        }

        const instruction = `
The user selected this text:

"${cleanSelectedText}"

The user wants to know:

"${cleanQuestion}"

Answer the user's question specifically using the selected text as context.
Explain clearly and simply.
`;

        const explanation =
            await getGeminiAPIResponse(instruction);

        res.json({
            explanation
        });

    } catch (err) {

    console.error(
        "Explain selection error:",
        err.message
    );

    if (err.status === 429) {
        return res.status(429).json({
            error: "AI service is temporarily rate-limited. Please try again later."
        });
    }

    res.status(500).json({
        error: "Failed to generate explanation."
    });
}
});

export default router;