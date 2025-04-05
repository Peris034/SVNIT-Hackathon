import express from "express";
import {
    createPost,
    getPosts,
    deletePost,
    likePost,
    unlikePost,
    addComment,
    reportPost,
    approvePost,
    deletePostAdmin,
    getLikedStatus
} from "../controllers/postController.js";
import { authenticateToken, isAdmin, postToken, sosToken } from "../middlewares/authMiddleware.js"; // Auth middleware
import { uploadPost, generatePublicUrl}  from "../middlewares/multer.js"; // Import upload middleware

const router = express.Router();

// User Actions
router.post("/", postToken, uploadPost.single("image"), generatePublicUrl, createPost); // Create post
router.get("/", postToken, getPosts); // Fetch all posts
router.get('/:id/liked-status', sosToken, getLikedStatus);
router.put("/:id/like", sosToken, likePost); // Like a post
router.put("/:id/unlike", sosToken, unlikePost); // Unlike a post
router.post("/comment/:postId", sosToken, addComment); // Add comment
router.post("/report/:postId", authenticateToken, reportPost); // Report post

// Admin Actions
router.put("/approve/:postId", authenticateToken, isAdmin, approvePost); // Admin approves/rejects post
router.delete("/admin/:postId", authenticateToken, isAdmin, deletePostAdmin); // Admin deletes post

// Author or Admin Deletion
router.delete("/:postId", authenticateToken, deletePost); // Delete post (only author/admin)

export default router;
