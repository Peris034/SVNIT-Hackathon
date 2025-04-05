import React, { useEffect, useState } from "react";
import Navbar from "../Navbar";
import CreatePost from "./CreatePost";
import PostList from "./PostList";

const Post = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreatePost, setShowCreatePost] = useState(false);
    const token = localStorage.getItem("token");

    useEffect(() => {
        fetchPosts();
        const interval = setInterval(fetchPosts, 5000);
        return () => clearInterval(interval);
    }, [token]);

    const fetchPosts = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/posts`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!res.ok) throw new Error(`Error ${res.status}: Failed to fetch posts`);
            const data = await res.json();
            setPosts(data);
        } catch (error) {
            console.error("Error fetching posts:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Navbar />
            <div className="max-w-3xl mx-auto p-4">
                <button
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition"
                    onClick={() => setShowCreatePost(true)}
                >
                    ➕ Create Post
                </button>
                {showCreatePost && <CreatePost setPosts={setPosts} setShowCreatePost={setShowCreatePost} />}
                {loading ? <p className="text-center text-gray-500">Loading posts...</p> : <PostList posts={posts} setPosts={setPosts} />}
            </div>
        </>
    );
};

export default Post;
