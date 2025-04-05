import React, { useState, useEffect } from "react";
import Navbar from "../Navbar"; // Adjust path as needed
import { PieChart, BarChart, Filter, MapPin } from "lucide-react"; // Import icons
import "./Incidents.css"; // ✅ Import external CSS

const Incidents = () => {
    const [incidents, setIncidents] = useState([]);
    const [filteredIncidents, setFilteredIncidents] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [previewContent, setPreviewContent] = useState(null);
    const [view, setView] = useState('table'); // 'table' or 'cluster' or 'location'
    const [categoryStats, setCategoryStats] = useState({});
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [locationStats, setLocationStats] = useState({});
    const [isLoadingLocations, setIsLoadingLocations] = useState(false);

    useEffect(() => {
        fetchIncidents();
    }, []);

    useEffect(() => {
        if (incidents.length > 0) {
            calculateCategoryStats();
        }
    }, [incidents]);

    const calculateCategoryStats = () => {
        const stats = incidents.reduce((acc, incident) => {
            const category = incident.category || 'Uncategorized';
            if (!acc[category]) {
                acc[category] = {
                    count: 0,
                    pending: 0,
                    resolved: 0,
                    cancelled:0,
                    recent: []
                };
            }
            acc[category].count++;
            if (incident.status === 'RESOLVED') {
                acc[category].resolved++;
            } else if (incident.status === 'CANCELLED'){
                acc[category].cancelled++
            } else {
                acc[category].pending++;
            }
            acc[category].recent = [...acc[category].recent, incident]
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 5);
            return acc;
        }, {});
        setCategoryStats(stats);
    };

    const handleStatusChange = async (newStatus, incidentId) => {
        try {
            console.log('new status..', newStatus)
            const response = await fetch(`${import.meta.env.VITE_API_URL}/incident/status-change/${incidentId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!response.ok) {
                throw new Error('Failed to update status');
            }

            // Optional: refresh incident list or update state manually
            const updatedIncident = await response.json();
            setFilteredIncidents(prev =>
                prev.map(item => item._id === incidentId ? { ...item, status: updatedIncident.status } : item)
            );
        } catch (err) {
            console.error(err);
            alert('Failed to update status.');
        }
    };


    const getCityFromCoordinates = async (latitude, longitude) => {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
                {
                    headers: {
                        'Accept-Language': 'en'
                    }
                }
            );
            const data = await response.json();
            // Return city or town or village, fallback to county
            return data.address?.city ||
                data.address?.town ||
                data.address?.village ||
                data.address?.county ||
                'Unknown Location';
        } catch (error) {
            console.error('Error getting location:', error);
            return 'Unknown Location';
        }
    };

    const calculateLocationStats = async (incidentsData) => {
        setIsLoadingLocations(true);
        const stats = {};

        try {
            // Process incidents in batches to avoid too many simultaneous requests
            for (const incident of incidentsData) {
                const { latitude, longitude } = incident.location;
                // Add delay to avoid hitting API rate limits
                await new Promise(resolve => setTimeout(resolve, 1000));

                const cityName = await getCityFromCoordinates(latitude, longitude);

                if (!stats[cityName]) {
                    stats[cityName] = {
                        count: 0,
                        incidents: [],
                        categories: {},
                        coordinates: {
                            latitude: parseFloat(latitude),
                            longitude: parseFloat(longitude)
                        }
                    };
                }

                stats[cityName].count++;
                stats[cityName].incidents.push(incident);

                // Track categories within this location
                const category = incident.category || 'Uncategorized';
                stats[cityName].categories[category] = (stats[cityName].categories[category] || 0) + 1;
            }

            setLocationStats(stats);
        } catch (error) {
            console.error('Error calculating location stats:', error);
        } finally {
            setIsLoadingLocations(false);
        }
    };

    const fetchIncidents = async () => {
        const token = localStorage.getItem("token");

        if (!token) {
            console.error("❌ No token found in localStorage!");
            return;
        }

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/incident`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) throw new Error(`❌ HTTP Error: ${response.status}`);

            const data = await response.json();
            console.log("✅ Fetched incidents:", data);

            setIncidents(data.incidents || []);
            setFilteredIncidents(data.incidents || []);
            calculateLocationStats(data.incidents || []);
        } catch (error) {
            console.error("❌ Error fetching incidents:", error);
        }
    };

    const handleStatusFilter = (e) => {
        const value = e.target.value;
        console.log('e..target..value', value.toUpperCase())
        setStatusFilter(value.toUpperCase());
        filterData(searchTerm, value, selectedCategory);
    };

    const filterData = (search, status, category = selectedCategory) => {
        console.log('statusss,,', status)
        let filtered = incidents.filter((incident) => {
            console.log('incidents..', incidents)
            const matchesSearch = (incident?.name?.toLowerCase()?.includes(search) ||
                incident?.title?.toLowerCase()?.includes(search));
            console.log('incedent..status..', incident?.status)
            const matchesStatus = status === "ALL" || incident?.status === status.toUpperCase();
            const matchesCategory = category === "all" || incident?.category === category;
            return matchesSearch && matchesStatus && matchesCategory;
        });
        console.log('filtered...0', filtered)
        setFilteredIncidents(filtered);
    };

    const openPreview = (documentUrl) => {
        setPreviewContent(documentUrl);
    };

    const LocationClusterView = () => (
        <div className="clusters-container">
            {isLoadingLocations ? (
                <div className="loading-overlay">
                    <div className="loader">Loading location data...</div>
                </div>
            ) : (
                <div className="clusters-grid">
                    {console.log('locationStatess..', locationStats)}
                    {Object.entries(locationStats).map(([city, data]) => (
                        <div key={city} className="location-cluster">
                            <h3>{city}</h3>
                            <div className="cluster-stats">
                                <div className="stat-item">
                                    <span className="stat-value">{data.count}</span>
                                    <span className="stat-label">Total Incidents</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-value">
                                        {Object.keys(data.categories).length}
                                    </span>
                                    <span className="stat-label">Categories</span>
                                </div>
                            </div>
                            <div className="category-breakdown">
                                <h4>Category Breakdown</h4>
                                {Object.entries(data.categories).map(([category, count]) => (
                                    <div key={category} className="category-item">
                                        <span>{category}</span>
                                        <span className="category-count">{count}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="location-coordinates">
                                <small>
                                    {data.coordinates.latitude.toFixed(4)},
                                    {data.coordinates.longitude.toFixed(4)}
                                </small>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    return (
        <>
            <Navbar />
            <div className="incidents-container">
                <div className="header-controls">
                    <h1>Incident Management</h1>
                    <div className="view-toggles">
                        <button
                            className={`view-btn ${view === 'table' ? 'active' : ''}`}
                            onClick={() => setView('table')}
                        >
                            <BarChart size={20} />
                            List View
                        </button>
                        <button
                            className={`view-btn ${view === 'cluster' ? 'active' : ''}`}
                            onClick={() => setView('cluster')}
                        >
                            <PieChart size={20} />
                            Category Clusters
                        </button>
                        <button
                            className={`view-btn ${view === 'location' ? 'active' : ''}`}
                            onClick={() => setView('location')}
                        >
                            <MapPin size={20} />
                            Location Clusters
                        </button>
                    </div>
                </div>

                {view === 'location' ? (
                    <LocationClusterView />
                ) : view === 'cluster' ? (
                    <div className="clusters-container">
                        <div className="clusters-grid">
                            {Object.entries(categoryStats).map(([category, stats]) => (
                                <div key={category} className="category-cluster">
                                    <h3>{category}</h3>
                                    <div className="cluster-stats">
                                        <div className="stat-item">
                                            <span className="stat-value">{stats.count}</span>
                                            <span className="stat-label">Total</span>
                                        </div>
                                        <div className="stat-item">
                                            <span className="stat-value pending">{stats.pending}</span>
                                            <span className="stat-label">Pending</span>
                                        </div>
                                        <div className="stat-item">
                                            <span className="stat-value resolved">{stats.resolved}</span>
                                            <span className="stat-label">Resolved</span>
                                        </div>
                                        <div className="stat-item">
                                            <span className="stat-value cancelled">{stats.cancelled}</span>
                                            <span className="stat-label">Cancelled</span>
                                        </div>
                                    </div>
                                    <div className="recent-incidents">
                                        <h4>Recent Incidents</h4>
                                        {stats.recent.map(incident => (
                                            <div key={incident._id} className="recent-item">
                                                <div className="incident-details">
                                                    <span className="incident-title">{incident.title || incident.message}</span>
                                                    <span className="incident-date">
                                                        {new Date(incident.createdAt).toLocaleDateString('en-US', {
                                                            year: 'numeric',
                                                            month: 'short',
                                                            day: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </span>
                                                </div>
                                                <span className={`status ${incident.status || 'pending'}`}>
                                                    {incident.status || 'PENDING'}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="controls">
                            <div className="search-filters">
                                <select value={statusFilter} onChange={handleStatusFilter}>
                                    <option value="ALL">All</option>
                                    <option value="ACTIVE">Active</option>
                                    <option value="CANCELLED">Cancelled</option>
                                    <option value="PENDING">Pending</option>
                                    <option value="RESOLVED">Resolved</option>
                                </select>
                                {/* <select
                                    value={selectedCategory}
                                    onChange={(e) => {
                                        setSelectedCategory(e.target.value);
                                        filterData(searchTerm, statusFilter, e.target.value);
                                    }}
                                >
                                    <option value="all">All Categories</option>
                                    {Object.keys(categoryStats).map(category => (
                                        <option key={category} value={category}>{category}</option>
                                    ))}
                                </select> */}
                            </div>
                        </div>

                        <div className="table-wrapper">
                            <table className="incident-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Phone</th>
                                        <th>Message</th>
                                        <th>Category</th>
                                        <th>Location</th>
                                        <th>Document</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredIncidents.length > 0 ? (
                                        filteredIncidents.map((incident) => (
                                            <tr key={incident._id}>
                                                <td>{incident.name}</td>
                                                <td>{incident.number}</td>
                                                <td>{incident.message}</td>
                                                <td>{incident.category}</td>
                                                <td>
                                                    {incident.location.latitude}, {incident.location.longitude}
                                                </td>
                                                <td>
                                                    <a href="#" onClick={(e) => { e.preventDefault(); openPreview(incident.documentUrl); }}>
                                                        View Document
                                                    </a>
                                                </td>
                                                <td>
                                                    <select
                                                        value={incident.status || "PENDING"}
                                                        onChange={(e) => handleStatusChange(e.target.value, incident._id)}
                                                    >
                                                        <option value="PENDING">PENDING</option>
                                                        <option value="ACTIVE">ACTIVE</option>
                                                        <option value="CANCELLED">CANCELLED</option>
                                                        <option value="RESOLVED">RESOLVED</option>
                                                    </select>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="7" className="no-data">No incidents found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                {previewContent && (
                    <div className="preview-modal" onClick={(e) => {
                        if (e.target.className === 'preview-modal') {
                            setPreviewContent(null);
                        }
                    }}>
                        <div className="preview-content">
                            <button className="close-btn" onClick={() => setPreviewContent(null)}>✖</button>
                            {previewContent.match(/\.(jpg|jpeg|png|gif)$/) ? (
                                <img
                                    src={previewContent}
                                    alt="Document Preview"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = 'path/to/fallback-image.png'; // Add a fallback image
                                    }}
                                />
                            ) : previewContent.match(/\.(mp4|mov|avi)$/) ? (
                                <video controls>
                                    <source src={previewContent} type="video/mp4" />
                                    Your browser does not support the video tag.
                                </video>
                            ) : (
                                <iframe
                                    src={previewContent}
                                    title="Document Preview"
                                    loading="lazy"
                                ></iframe>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                .header-controls {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2rem;
                }

                .view-toggles {
                    display: flex;
                    gap: 1rem;
                }

                .view-btn {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.5rem 1rem;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    background: white;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .view-btn.active {
                    background: #007bff;
                    color: white;
                    border-color: #007bff;
                }

                .clusters-container {
                    padding: 1rem;
                }

                .clusters-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                    gap: 1.5rem;
                }

                .category-cluster {
                    background: white;
                    border-radius: 8px;
                    padding: 1.5rem;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                }

                .cluster-stats {
                    display: flex;
                    justify-content: space-around;
                    margin: 1rem 0;
                    padding: 1rem 0;
                    border-top: 1px solid #eee;
                    border-bottom: 1px solid #eee;
                }

                .stat-item {
                    text-align: center;
                }

                .stat-value {
                    font-size: 1.5rem;
                    font-weight: bold;
                    display: block;
                }

                .stat-value.pending { color: #f59e0b; }
                .stat-value.resolved { color: #10b981; }
                .stat-value.cancelled {color:black}

                .stat-label {
                    font-size: 0.8rem;
                    color: #666;
                }

                .recent-incidents {
                    margin-top: 1rem;
                }

                .recent-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    padding: 0.75rem 0;
                    border-bottom: 1px solid #eee;
                    gap: 1rem;
                }

                .incident-details {
                    display: flex;
                    flex-direction: column;
                    gap: 0.25rem;
                    flex: 1;
                }

                .incident-title {
                    font-weight: 500;
                    color: #374151;
                }

                .incident-date {
                    font-size: 0.75rem;
                    color: #6b7280;
                }

                .status {
                    flex-shrink: 0;
                    margin-top: 0.25rem;
                }

                .search-filters {
                    display: flex;
                    gap: 1rem;
                    margin-bottom: 1rem;
                }

                @media (max-width: 768px) {
                    .clusters-grid {
                        grid-template-columns: 1fr;
                    }

                    .search-filters {
                        flex-direction: column;
                    }
                }

                .location-cluster {
                    background: white;
                    border-radius: 8px;
                    padding: 1.5rem;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                }

                .category-breakdown {
                    margin-top: 1rem;
                    padding-top: 1rem;
                    border-top: 1px solid #eee;
                }

                .category-item {
                    display: flex;
                    justify-content: space-between;
                    padding: 0.5rem 0;
                    font-size: 0.9rem;
                    color: #666;
                }

                .category-count {
                    background: #e5e7eb;
                    padding: 0.2rem 0.5rem;
                    border-radius: 999px;
                    font-size: 0.8rem;
                }

                .location-coordinates {
                    margin-top: 1rem;
                    text-align: right;
                    color: #666;
                    font-size: 0.8rem;
                }

                .loading-overlay {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 200px;
                }

                .loader {
                    color: #666;
                    font-size: 1.1rem;
                }

                .preview-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.75);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 1000;
                    padding: 20px;
                }

                .preview-content {
                    position: relative;
                    background: white;
                    padding: 20px;
                    border-radius: 8px;
                    width: 80%;
                    max-width: 900px;
                    height: auto;
                    max-height: 80vh;
                    overflow: auto;
                    box-shadow: 0 4px 25px rgba(0, 0, 0, 0.2);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }

                .preview-content img {
                    width: auto;
                    height: auto;
                    max-width: 100%;
                    max-height: 70vh;
                    object-fit: contain;
                    display: block;
                    margin: 0 auto;
                }

                .preview-content video {
                    width: auto;
                    height: auto;
                    max-width: 100%;
                    max-height: 70vh;
                    display: block;
                    margin: 0 auto;
                }

                .preview-content iframe {
                    width: 100%;
                    height: 70vh;
                    border: none;
                }

                .close-btn {
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    background: #fff;
                    border: none;
                    width: 30px;
                    height: 30px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    font-size: 18px;
                    color: #333;
                    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
                    transition: all 0.2s;
                    z-index: 1;
                }

                .close-btn:hover {
                    background: #f3f4f6;
                    transform: scale(1.1);
                }

                @keyframes modalFadeIn {
                    from {
                        opacity: 0;
                        transform: scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }

                .preview-content {
                    animation: modalFadeIn 0.3s ease-out;
                }

                @media (max-width: 768px) {
                    .preview-content {
                        width: 95%;
                        padding: 15px;
                        margin: 10px;
                    }

                    .preview-content img,
                    .preview-content video {
                        max-height: 60vh;
                    }

                    .preview-content iframe {
                        height: 60vh;
                    }
                }
            `}</style>
        </>
    );
};

export default Incidents;
