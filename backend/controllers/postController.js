import Post from "../models/Post.js";

export const createPost = async (req, res) => {
    try {
        // console.log("🔹 Received Post Data:", req.body);
        // console.log("🔹 Authenticated User:", req.user);
        // console.log("🔹 Uploaded File:", req.file);

        const { title, content } = req.body;

        if (!title || !content) {
            return res.status(400).json({ message: "❌ Title and content are required" });
        }

        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: "❌ Unauthorized: User not found" });
        }

        // ✅ Use uploaded image URL if available, otherwise fallback to an empty string
        const imageUrl = req.fileUrl || "";

        const newPost = new Post({
            title,
            content,
            image: imageUrl, // ✅ Save the Cloudinary URL
            author: req.user.id,
            status: "pending",
        });

        await newPost.save();
        // console.log("✅ Post Created:", newPost);

        res.status(201).json({ message: "✅ Post submitted for approval", post: newPost });
    } catch (error) {
        console.error("❌ Error creating post:", error);
        res.status(500).json({ message: "❌ Server error. Check logs for details." });
    }
};


// ✅ Get all posts (Admins can fetch pending posts)
export const getPosts = async (req, res) => {
    try {
        const statusFilter = req.query.status || "approved";

        if (statusFilter === "pending" && !req.user.role === "admin") {
            return res.status(403).json({ message: "❌ Not authorized to view pending posts" });
        }

        const posts = await Post.find({ status: statusFilter })
            .populate("author", "fullName")
            .populate("comments.user", "fullName");

        res.json(posts);
    } catch (error) {
        console.error("Error fetching posts:", error);
        res.status(500).json({ message: "Error fetching posts" });
    }
};

// ✅ Delete a post (only author or admin)
export const deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);
        if (!post) return res.status(404).json({ message: "Post not found" });

        if (post.author.toString() !== req.user._id && !req.user.isAdmin) {
            return res.status(403).json({ message: "Not authorized" });
        }

        await post.deleteOne();
        res.json({ message: "Post deleted" });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

export const getLikedStatus = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: "Post not found" });

        const liked = post.likes.some((like) => like.user.toString() === req.user.id);
        res.json({ liked });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

// ✅ Like a Post
export const likePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: "Post not found" });

        if (post.likes.some((like) => like.user.toString() === req.user.id)) {
            return res.status(400).json({ message: "Already liked this post" });
        }

        post.likes.push({ user: req.user.id });
        await post.save();

        res.json(post);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

export const unlikePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: "Post not found" });

        post.likes = post.likes.filter((like) => like.user.toString() !== req.user.id);
        await post.save();

        res.json(post);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

export const addComment = async (req, res) => {
    try {
        const { text } = req.body;
        if (!text.trim()) return res.status(400).json({ message: "Comment cannot be empty" });

        const post = await Post.findById(req.params.postId);
        if (!post) return res.status(404).json({ message: "Post not found" });

        const newComment = {
            user: req.user.id, // ✅ Ensure user ID is being stored
            text,
            createdAt: new Date(),
        };

        post.comments.push(newComment);
        await post.save();

        // Re-fetch with population
        const updatedPost = await Post.findById(req.params.postId)
            .populate("comments.user", "fullName"); // ✅ Populate fullName from User model

        res.status(201).json({ message: "Comment added", comment: updatedPost.comments.at(-1) });
    } catch (error) {
        console.error("Error adding comment:", error);
        res.status(500).json({ message: "Error adding comment" });
    }
};

// ✅ Report a post
export const reportPost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);
        if (!post) return res.status(404).json({ message: "Post not found" });

        post.reports.push({ user: req.user._id, reason: req.body.reason });
        await post.save();
        res.json({ message: "Post reported" });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

// ✅ Approve or Reject a Post (Admin)
export const approvePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);
        if (!post) return res.status(404).json({ message: "Post not found" });

        post.status = req.body.status; // "approved" or "rejected"
        await post.save();

        res.json({ message: `Post ${post.status}` });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

// ✅ Admin Delete Post
export const deletePostAdmin = async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);
        if (!post) return res.status(404).json({ message: "Post not found" });

        await post.deleteOne();
        res.json({ message: "Post deleted by admin" });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};