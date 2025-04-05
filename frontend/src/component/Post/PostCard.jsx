import React, { useState, useEffect } from "react";

const PostCard = ({ post, userId, onDelete }) => {
    const [likes, setLikes] = useState(post.likes.length);
    const [liked, setLiked] = useState(false);
    const [comments, setComments] = useState(post.comments || []);
    const [commentText, setCommentText] = useState("");
    const [isAuthor, setIsAuthor] = useState(false);
    const [showComments, setShowComments] = useState(false);

    useEffect(() => {
        const fetchLikedStatus = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/posts/${post._id}/liked-status`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });

                if (!res.ok) throw new Error("Failed to fetch liked status");

                const data = await res.json();
                setLiked(data.liked);
            } catch (err) {
                console.error("Error fetching liked status:", err);
            }
        };

        fetchLikedStatus();
        setIsAuthor(post.author?._id === userId);
    }, [post._id, userId, post.author]);

    const toggleComments = () => setShowComments(!showComments);

    const handleLike = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/posts/${post._id}/like`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            if (!res.ok) throw new Error("Failed to update like status");

            const updatedPost = await res.json();
            setLikes(updatedPost.likes.length);
            setLiked(true);
        } catch (err) {
            console.error("Error updating like:", err);
            alert("Something went wrong. Please try again.");
        }
    };

    const handleDislike = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/posts/${post._id}/unlike`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            if (!res.ok) throw new Error("Failed to update dislike status");

            const updatedPost = await res.json();
            setLikes(updatedPost.likes.length);
            setLiked(false);
        } catch (err) {
            console.error("Error updating dislike:", err);
            alert("Something went wrong. Please try again.");
        }
    };

    const handleComment = async () => {
        if (!commentText.trim()) return;

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/posts/comment/${post._id}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({ text: commentText }),
            });

            if (!res.ok) throw new Error("Failed to add comment");

            const data = await res.json();
            setComments([...comments, data.comment]);
            setCommentText("");
        } catch (err) {
            console.error("Error adding comment:", err);
            alert("Something went wrong. Please try again.");
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this post?")) return;

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/posts/${post._id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            if (!res.ok) throw new Error("Failed to delete post");

            onDelete(post._id);
        } catch (err) {
            console.error("Error deleting post:", err);
            alert("Something went wrong. Please try again.");
        }
    };

    return (
        <div className="bg-white shadow-md rounded-lg p-4 mb-4 w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl">

            {/* ✅ Display the post image with controlled size */}
            {post.image && (
                <div className="w-full h-[10px] overflow-hidden rounded-md mb-2 flex justify-center items-center bg-gray-100">
                    <img
                        src={post.image.replace(/\s+/g, "%20")} // Handle spaces in URL
                        alt="Post"
                        className="max-h-full max-w-full object-contain"
                        onError={(e) => {
                            e.target.style.display = "none"; // Hide image if it fails to load
                        }}
                    />
                </div>
            )}

            <h3 className="text-lg font-semibold text-gray-800">{post.title}</h3>
            <p className="text-gray-600 mt-1"><strong>@{post.author?.fullName || "Unknown"}</strong> : {post.content}</p>

            <div className="mt-3 flex justify-between items-center">
                {!liked ? (
                    <>
                        <button onClick={handleLike} className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition">
                            🤍 ({likes})
                        </button>
                        <button onClick={toggleComments} className="text-blue-500">💬 Comments</button>
                    </>
                ) : (
                    <>
                        <button onClick={handleDislike} className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition">
                            ❤️ ({likes})
                        </button>
                        <button onClick={toggleComments} className="text-blue-500">💬 Comments</button>
                    </>
                )}
                {isAuthor && (
                    <button onClick={handleDelete} className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition">
                        🗑 Delete
                    </button>
                )}
            </div>
            {showComments && (
                <div className="mt-2">
                    {comments.map((comment, idx) => (
                        <p key={idx} className="text-gray-600">
                            <strong>@{comment.user?.fullName || "Unknown"}:</strong> {comment.text}
                        </p>
                    ))}
                    <input
                        type="text"
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Add a comment..."
                        className="border p-1 w-full rounded-md mt-2"
                    />
                    <button onClick={handleComment} className="bg-blue-500 text-white py-1 px-3 rounded-md mt-2">
                        Comment
                    </button>
                </div>
            )}
        </div>
    );
};

export default PostCard;
