import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
    {
        role: {
            type: String,
            enum: ["user", "assistant"],
            required: true
        },

        content: {
            type: String,
            required: true,
            trim: true
        },

        timestamp: {
            type: Date,
            default: Date.now
        }
    },
    {
        _id: true
    }
);


const ThreadSchema = new mongoose.Schema(
    {
        threadId: {
            type: String,
            required: true,
            unique: true,
            index: true
        },

        title: {
            type: String,
            default: "New Chat",
            trim: true
        },

        messages: {
            type: [MessageSchema],
            default: []
        },

        createdAt: {
            type: Date,
            default: Date.now
        },

        updatedAt: {
            type: Date,
            default: Date.now
        }
    }
);


// Jab thread update ho to updatedAt automatically change ho
ThreadSchema.pre("save", function () {
    this.updatedAt = new Date();
});


const Thread = mongoose.model("Thread", ThreadSchema);

export default Thread;