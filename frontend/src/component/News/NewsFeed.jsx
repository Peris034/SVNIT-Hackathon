import React, { useEffect, useState } from "react";
import Navbar from "../Navbar";
import "./newsfeed.css";

const API_KEY = import.meta.env.VITE_NEWS_API_KEY;

const NewsFeed = () => {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [query, setQuery] = useState("India");
    const [search, setSearch] = useState("");

    // Detect local environment
    const isLocal = window.location.hostname === "localhost";
    const apiUrl = (query) => isLocal
        ? `https://newsapi.org/v2/everything?q=${query}&apiKey=${API_KEY}`
        : `/api/news?q=${query}`;

    useEffect(() => {
        const fetchNews = async () => {
            try {
                console.log(`Fetching news from: /api/news?q=${query}`); // Debugging
                const response = await fetch(apiUrl(query)); // ✅ Correct usage

                if (!response.ok) throw new Error("Failed to fetch news");

                const data = await response.json();
                console.log("📰 News data received:", data); // Debugging

                setArticles(data.articles || []);
            } catch (err) {
                console.error("❌ Error fetching news:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchNews();
    }, [query]);

    const handleSearch = () => {
        if (search.trim()) {
            setQuery(search);
        }
    };

    return (
        <>
            <Navbar />
            <div className="news-container">
                <h2 className="news-title">Latest News</h2>

                <div className="news-title">
                    <input
                        type="text"
                        placeholder="Search for news..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="search-input"
                    />
                    <button onClick={handleSearch} className="search-button">Search</button>
                </div>

                {loading && <p className="loading-text">Loading news...</p>}
                {error && <p className="error-text">{error}</p>}

                <div className="news-grid">
                    <div className="news-grid">
                        {articles
                            .filter((article) => article.urlToImage) // 🔥 Filter out articles without images
                            .map((article, index) => (
                                <a
                                    key={index}
                                    href={article.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="news-card"
                                >
                                    <img
                                        src={article.urlToImage}
                                        alt={article.title}
                                        className="news-image"
                                    />
                                    <div className="news-content">
                                        <h3>{article.title}</h3>
                                        <p className="news-description">{article.description}</p>
                                        <p className="news-meta">Source: {article.source.name}</p>
                                    </div>
                                </a>
                            ))}
                    </div>
                </div>
            </div>
        </>
    );
};

export default NewsFeed;