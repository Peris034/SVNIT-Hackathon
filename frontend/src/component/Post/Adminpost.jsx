import React, { useEffect, useState } from "react";
import Navbar from "../Navbar";
import CreatePost from "./CreatePost";
import PostList from "./PostList";
import { FaCheck } from "react-icons/fa"
import { MdCancel } from "react-icons/md";

const Adminpost = () => {
    const [pendingPosts, setPendingPosts] = useState([]);
    const [approvedPosts, setApprovedPosts] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [showCreatePost, setShowCreatePost] = useState(false);
    const [activeTab, setActiveTab] = useState("admin"); // Default to User View

    const token = localStorage.getItem("token");

    useEffect(() => {
        fetchPosts("pending", setPendingPosts);
        fetchPosts("approved", setApprovedPosts);
        const interval = setInterval(() => {
            fetchPosts("approved", setApprovedPosts);
        }, 5000);
        return () => clearInterval(interval);
    }, [token]);

    const fetchPosts = async (status, setPosts) => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/posts?status=${status}`, {
                method: "GET",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error(`Failed to fetch ${status} posts`);
            const data = await res.json();
            setPosts(data);
        } catch (error) {
            console.error(error);
            setError(`❌ Error loading ${status} posts`);
        } finally {
            setLoading(false);
        }
    };

    const handleApproval = async (postId, status) => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/posts/approve/${postId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ status }),
            });
            if (!res.ok) throw new Error(`Failed to ${status} post`);
            setPendingPosts((prev) => prev.filter((post) => post._id !== postId));
            if (status === "approved") fetchPosts("approved", setApprovedPosts);
        } catch (error) {
            console.error(error);
            setError(`❌ Error processing request`);
        }
    };

    return (
        <>
            <Navbar />
            <div className="max-w-4xl mx-auto p-4">
                {/* ✅ Tabs for switching views */}
                <div className="flex justify-center gap-2 mb-4">
                    <button
                        onClick={() => setActiveTab("user")}
                        className={`px-4 py-2 rounded-md ${activeTab === "user" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700 cursor-pointer"}`}
                    >
                        👤 User View
                    </button>
                    <button
                        onClick={() => setActiveTab("admin")}
                        className={`px-4 py-2 rounded-md ${activeTab === "admin" ? "bg-blue-500 text-white" : "bg-gray-200 cursor-pointer text-gray-700"}`}
                    >
                        🛠 Admin View
                    </button>
                </div>

                {error && <p className="text-red-500 text-center">{error}</p>}
                {loading && <p className="text-center">⏳ Loading...</p>}

                {/* ✅ User View (Like /post) */}
                {activeTab === "user" && (
                    <div>
                        <button
                            className="w-full cursor-pointer bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition"
                            onClick={() => setShowCreatePost(true)}
                        >
                            ➕ Create Post
                        </button>
                        {showCreatePost && <CreatePost setPosts={setApprovedPosts} setShowCreatePost={setShowCreatePost} />}
                        <PostList posts={approvedPosts} setPosts={setApprovedPosts} />
                    </div>
                )}

                {/* ✅ Admin View (Pending Posts Moderation) */}
                {activeTab === "admin" && (
                    <div className="flex flex-col gap-10">
                        <h2 className="text-center text-xl font-bold">📢 Pending Posts</h2>
                        <div className="flex justify-center gap-10">{pendingPosts.length === 0 ? (
                            <p className="text-center text-gray-500">✅ No pending posts</p>
                        ) : (
                            pendingPosts.map((post) => (
                                <div key={post._id} className="border max-w-64 flex flex-col  justify-between items-center p-3 rounded-md bg-gray-100 shadow-sm mt-3">
                                    <h3 className="font-semibold">{post.title}</h3>
                                    <p>{post.content}</p>
                                    {post.image && (
                                        <img
                                            src={post.image.replace(/\s+/g, "%20")}
                                            alt="Post"
                                            className="max-w-full h-auto rounded-md mt-2"
                                            onError={(e) => (e.target.style.display = "none")}
                                        />
                                    )}
                                    <div className="mt-3 flex gap-3">
                                        <button
                                            onClick={() => handleApproval(post._id, "approved")}
                                            className="bg-lime-600 cursor-pointer flex text-white px-3 py-1 rounded-md justify-center items-center gap-2"
                                        >
                                            <FaCheck/> Approve
                                        </button>
                                        <button
                                            onClick={() => handleApproval(post._id, "rejected")}
                                            className="cursor-pointer bg-rose-600 text-white px-3 py-1 rounded-md flex justify-center items-center gap-2"
                                        >
                                            <MdCancel/> Reject
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                        </div>
                        
                    </div>
                )}
            </div>
        </>
    );
};

export default Adminpost;
