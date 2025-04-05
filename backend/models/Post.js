import mongoose from "mongoose";

const PostSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    image: { type: String, default: "" }, // Optional image URL
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    comments: [
        {
            user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
            text: { type: String, required: true },
            createdAt: { type: Date, default: Date.now }
        }
    ],
    likes: [
        {
            user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Store user ID with like
            createdAt: { type: Date, default: Date.now }
        }
    ],
    reports: [{ user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, reason: String }],
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" }, // Moderation
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Post", PostSchema);
