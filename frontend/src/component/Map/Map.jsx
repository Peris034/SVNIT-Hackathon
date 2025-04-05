import React, { useEffect, useState } from "react";
import notificationService from "../../firebase/notification.service";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import Navbar from "../Navbar";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "leaflet.markercluster";
import "./Map.css";

const API_URL = import.meta.env.VITE_API_URL;
const STATUS_OPTIONS = ["PENDING", "RESOLVED", "CANCELLED", "ACTIVE"];

const createCustomIcon = (color) => {
    return L.divIcon({
        html: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 0C7.58 0 4 3.58 4 8C4 13.54 12 24 12 24C12 24 20 13.54 20 8C20 3.58 16.42 0 12 0Z" fill="${color}"/>
            <circle cx="12" cy="8" r="4" fill="white"/>
        </svg>`,
        className: 'custom-div-icon',
        iconSize: [24, 24],
        iconAnchor: [12, 24],
        popupAnchor: [0, -24],
    });
};

const icons = {
    ACTIVE: createCustomIcon('#FF5733'),
    RESOLVED: createCustomIcon('#28A745'),
    CANCELLED: createCustomIcon('#6C757D'),
    PENDING: createCustomIcon('#007BFF')
};

const Map = () => {
    const [sosAlerts, setSosAlerts] = useState([]);
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [sortAscending, setSortAscending] = useState(true);
    const [editingStatus, setEditingStatus] = useState(null);

    useEffect(() => {
        fetchSosAlerts();
        const interval = setInterval(fetchSosAlerts, 5000);
        return () => clearInterval(interval);
    }, []);

    const fetchSosAlerts = async () => {
        try {
            const response = await fetch(`${API_URL}/sos/sos-alerts`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            if (!response.ok) throw new Error("Failed to fetch SOS alerts");
            const data = await response.json();
            setSosAlerts(data);
        } catch (error) {
            console.error("Error fetching SOS alerts:", error);
        }
    };

    const updateStatus = async (id, newStatus) => {
        try {
            await fetch(`${API_URL}/sos/update-sos-status/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify({ status: newStatus })
            });
            await fetchSosAlerts();
        } catch (error) {
            console.error("Error updating status:", error);
        } finally {
            setEditingStatus(null);
        }
    };

    const filteredAlerts = sosAlerts.filter(alert => 
        statusFilter === "ALL" || alert.status === statusFilter
    );
    
    const sortedAlerts = filteredAlerts.sort((a, b) =>
        sortAscending ? a._id.localeCompare(b._id) : b._id.localeCompare(a._id)
    );
    
    return (
        <>
            <Navbar />
            <div className="map-page">
                <h1 className="text-center">SOS Alerts Map</h1>
                <div className="map-container">
                    <MapContainer center={[21.2537, 72.6029]} zoom={6} className="map-box">
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        {sortedAlerts.filter(alert => statusFilter === "ALL" || alert.status === statusFilter).map(alert => (
                            alert.latitude && alert.longitude && (
                                <Marker key={alert._id} position={[alert.latitude, alert.longitude]} icon={icons[alert.status] || icons.PENDING}>
                                    <Popup>
                                        <div>
                                            <strong>Status:</strong> {alert.status}<br />
                                            <strong>Message:</strong> {alert.message}<br />
                                            <strong>Created At:</strong> {alert.timestamp}<br />
                                        </div>
                                    </Popup>
                                </Marker>
                            )
                        ))}
                    </MapContainer>
                </div>
            </div>
            <div className="table-container">
                <table className="table">
                    <thead>
                        <tr>
                            <th onClick={() => setSortAscending(!sortAscending)} style={{ cursor: "pointer" }}>
                                ID {sortAscending ? "▲" : "▼"}
                            </th>
                            <th>
                                Status
                                <select onChange={(e) => setStatusFilter(e.target.value)} value={statusFilter} className="status-filter">
                                    <option value="ALL">All</option>
                                    {STATUS_OPTIONS.map(status => (
                                        <option key={status} value={status}>{status}</option>
                                    ))}
                                </select>
                            </th>
                            <th>Latitude</th>
                            <th>Longitude</th>
                            <th>Created At</th>
                            <th>Message</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedAlerts.map(alert => (
                            <tr key={alert._id}>
                                <td>{alert._id}</td>
                                <td onClick={() => setEditingStatus(alert._id)} style={{ cursor: "pointer" }}>
                                    {editingStatus === alert._id ? (
                                        <select onChange={(e) => updateStatus(alert._id, e.target.value)} autoFocus onBlur={() => setEditingStatus(null)} className="status-select">
                                            {STATUS_OPTIONS.map(status => (
                                                <option key={status} value={status}>{status}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        alert.status
                                    )}
                                </td>
                                <td>{alert.latitude}</td>
                                <td>{alert.longitude}</td>
                                <td>{alert.timestamp}</td>
                                <td>{alert.message}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
};

export default Map;
