import express from "express";
import Thread from "../models/Thread.js";
import getGeminiAPIResponse from "../utils/gemini.js";

const router = express.Router();


// ================= TEST =================

router.post("/test", async (req, res) => {
    try {
        const thread = new Thread({
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


// ================= GET ALL THREADS =================

router.get("/thread", async (req, res) => {
    try {

        const threads = await Thread
            .find({})
            .sort({ updatedAt: -1 });

        res.json(threads);

    } catch (err) {

        console.log(err);

        res.status(500).json({
            error: "Failed to fetch threads"
        });
    }
});


// ================= GET SINGLE THREAD =================

router.get("/thread/:threadId", async (req, res) => {

    const { threadId } = req.params;

    try {

        const thread = await Thread.findOne({ threadId });

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


// ================= DELETE THREAD =================

router.delete("/thread/:threadId", async (req, res) => {

    const { threadId } = req.params;

    try {

        const deletedThread =
            await Thread.findOneAndDelete({ threadId });

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


// ================= CHAT =================

router.post("/chat", async (req, res) => {

    const { threadId, message } = req.body;

    // Validate request
    if (!threadId || !message) {
        return res.status(400).json({
            error: "Missing required fields"
        });
    }

    try {

        // Find existing thread
        let thread = await Thread.findOne({ threadId });


        // If thread doesn't exist, create it
        if (!thread) {

            thread = new Thread({
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

            // Existing thread
            thread.messages.push({
                role: "user",
                content: message
            });
        }


        // ================= GEMINI =================

        const assistantReply =
            await getGeminiAPIResponse(message);


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