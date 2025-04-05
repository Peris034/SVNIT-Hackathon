import React, { useEffect, useState } from "react";
import PostCard from "./PostCard";

const PostList = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");

    useEffect(() => {
        if (!token) {
            setError("User not authenticated");
            setLoading(false);
            return;
        }

        const fetchPosts = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/posts`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!res.ok) {
                    throw new Error(`Error ${res.status}: ${res.statusText}`);
                }

                const data = await res.json();
                setPosts(data);
            } catch (err) {
                console.error("Error fetching posts:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, [token]);

    if (loading) return <p>Loading posts...</p>;
    if (error) return <p className="error">{error}</p>;

    return (
        <div>
            <h2>Community Posts</h2>
            {posts.length > 0 ? (
                posts.map((post) => <PostCard key={post._id} post={post} userId={userId} />)
            ) : (
                <p>No posts available.</p>
            )}
        </div>
    );
};

export default PostList;
