import React, { useState, useEffect } from "react";
import Navbar from "../Navbar"; // Adjust path as needed
import "./Incidents.css"; // ✅ Import external CSS

const Incidents = () => {
    const [incidents, setIncidents] = useState([]);
    const [filteredIncidents, setFilteredIncidents] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [previewContent, setPreviewContent] = useState(null);

    useEffect(() => {
        fetchIncidents();
    }, []);

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
        } catch (error) {
            console.error("❌ Error fetching incidents:", error);
        }
    };

    const handleSearch = (e) => {
        const value = e.target.value.toLowerCase();
        setSearchTerm(value);
        filterData(value, statusFilter);
    };

    const handleStatusFilter = (e) => {
        const value = e.target.value;
        setStatusFilter(value);
        filterData(searchTerm, value);
    };

    const filterData = (search, status) => {
        let filtered = incidents.filter((incident) =>
            (incident?.name?.toLowerCase()?.includes(search) || incident?.title?.toLowerCase()?.includes(search)) &&
            (status === "all" || incident?.status === status)
        );
        setFilteredIncidents(filtered);
    };

    const openPreview = (documentUrl) => {
        setPreviewContent(documentUrl);
    };

    return (
        <>
            <Navbar />
            <div className="incidents-container">
                <h1>Incident Management</h1>

                <div className="controls">
                    <input type="text" placeholder="Search by name or title..." value={searchTerm} onChange={handleSearch} />
                    <select value={statusFilter} onChange={handleStatusFilter}>
                        <option value="all">All</option>
                        <option value="pending">Pending</option>
                        <option value="resolved">Resolved</option>
                    </select>
                </div>

                <div className="table-wrapper">
                    <table className="incident-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Phone</th>
                                <th>Title</th>
                                <th>Message</th>
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
                                        <td>{incident.title}</td>
                                        <td>{incident.message}</td>
                                        <td>
                                            {incident.location.latitude}, {incident.location.longitude}
                                        </td>
                                        <td>
                                            <a href="#" onClick={(e) => { e.preventDefault(); openPreview(incident.documentUrl); }}>
                                                View Document
                                            </a>
                                        </td>
                                        <td>{incident.status || "Pending"}</td>
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

                {previewContent && (
                    <div className="preview-modal">
                        <div className="preview-content">
                            <button className="close-btn" onClick={() => setPreviewContent(null)}>✖</button>
                            {previewContent.match(/\.(jpg|jpeg|png|gif)$/) ? (
                                <img src={previewContent} alt="Document Preview" />
                            ) : previewContent.match(/\.(mp4|mov|avi)$/) ? (
                                <video controls><source src={previewContent} type="video/mp4" /></video>
                            ) : (
                                <iframe src={previewContent} title="Document Preview"></iframe>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default Incidents;
