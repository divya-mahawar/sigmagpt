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

        userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },

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


ThreadSchema.pre("save", function () {
    this.updatedAt = new Date();
});
ThreadSchema.index({
    userId: 1,
    updatedAt: -1
});


const Thread = mongoose.model("Thread", ThreadSchema);

export default Thread;