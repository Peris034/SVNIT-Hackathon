import React, { useState } from "react";

const CreatePost = ({ setPosts, setShowCreatePost }) => {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [image, setImage] = useState(null);
    const [message, setMessage] = useState("");
    const [uploading, setUploading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");

        const token = localStorage.getItem("token");
        if (!token) {
            setMessage("❌ Authentication required!");
            return;
        }

        const formData = new FormData();
        formData.append("title", title);
        formData.append("content", content);
        if (image) formData.append("image", image); // Send image file to backend

        setUploading(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/posts`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`, // No need for Content-Type, FormData handles it
                },
                body: formData,
            });

            const data = await res.json();
            setUploading(false);

            if (res.ok) {
                setMessage("✅ Post submitted successfully!");
                setTitle("");
                setContent("");
                setImage(null);
                setPosts((prevPosts) => [data, ...prevPosts]);
                setTimeout(() => setShowCreatePost(false), 1000);
            } else {
                setMessage(`❌ ${data.message}`);
            }
        } catch (error) {
            console.error("Error creating post:", error);
            setMessage("❌ Server error. Try again later.");
            setUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-md w-full max-w-lg">
                <h2 className="text-lg font-semibold mb-4">Create a New Post</h2>
                {message && <p className="text-sm text-green-600">{message}</p>}
                <form onSubmit={handleSubmit} className="flex flex-col space-y-3">
                    <input 
                        type="text" 
                        placeholder="Title" 
                        value={title} 
                        onChange={(e) => setTitle(e.target.value)} 
                        required 
                        className="border p-2 rounded-md"
                    />
                    <textarea 
                        placeholder="Content" 
                        value={content} 
                        onChange={(e) => setContent(e.target.value)} 
                        required 
                        className="border p-2 rounded-md"
                    />
                    <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => setImage(e.target.files[0])} 
                        className="border p-2 rounded-md"
                    />
                    {image && <p className="text-sm text-gray-600">{image.name}</p>}
                    
                    <div className="flex justify-between">
                        <button 
                            type="submit" 
                            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
                            disabled={uploading}
                        >
                            {uploading ? "Uploading..." : "Submit"}
                        </button>
                        <button 
                            onClick={() => setShowCreatePost(false)} 
                            className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreatePost;
