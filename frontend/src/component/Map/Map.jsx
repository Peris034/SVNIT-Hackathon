import React, { useEffect, useRef, useState } from "react";
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

const createCustomIcon = (color) =>
  L.divIcon({
    html: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 0C7.58 0 4 3.58 4 8C4 13.54 12 24 12 24C12 24 20 13.54 20 8C20 3.58 16.42 0 12 0Z" fill="${color}"/>
            <circle cx="12" cy="8" r="4" fill="white"/>
        </svg>`,
    className: "custom-div-icon",
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    popupAnchor: [0, -24],
  });

const icons = {
  ACTIVE: createCustomIcon("#FF5733"),
  RESOLVED: createCustomIcon("#28A745"),
  CANCELLED: createCustomIcon("#6C757D"),
  PENDING: createCustomIcon("#007BFF"),
};

const Map = () => {
  const [sosAlerts, setSosAlerts] = useState([]);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [cityFilter, setCityFilter] = useState("ALL");
  const [sortAscending, setSortAscending] = useState(true);
  const [editingStatus, setEditingStatus] = useState(null);
  const [cityCounts, setCityCounts] = useState({});
  const geocodeCache = useRef({});

  const getCityFromCoords = async (lat, lon) => {
    const key = `${lat},${lon}`;
    if (geocodeCache.current[key]) return geocodeCache.current[key];
    try {
      const response = await fetch(
        `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lon}&key=7fbe61397f1343579a768e1800ff125c&no_annotations=1&language=en`
      );
  
      if (!response.ok) {
        throw new Error(`Geocoding error: ${response.status}`);
      }
  
      const data = await response.json();
      const components = data.results[0]?.components || {};
  
      // Prioritize known city fields
      const city =
        components.city ||
        components.town ||
        components.village ||
        components.state_district || // Sometimes OpenCage puts cities here (especially in India)
        components.state || // As a last resort
        "Unknown";
  
      geocodeCache.current[key] = city;
      return city;
    } catch (error) {
      console.error("Reverse geocoding failed:", error.message);
      return "Unknown";
    }
  };
      
  const fetchSosAlerts = async () => {
    try {
      const res = await fetch(`${API_URL}/sos/sos-alerts`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!res.ok) throw new Error("Failed to fetch SOS alerts");

      const data = await res.json();
      const enriched = await Promise.all(
        data.map(async (alert) => {
          const city = await getCityFromCoords(alert.latitude, alert.longitude);
          return { ...alert, city };
        })
      );
      setSosAlerts(enriched);

      const counts = {};
      enriched.forEach((alert) => {
        const city = alert.city || "Unknown";
        counts[city] = (counts[city] || 0) + 1;
      });
      setCityCounts(counts);
    } catch (err) {
      console.error("Error fetching SOS alerts:", err);
    }
  };

  useEffect(() => {
    fetchSosAlerts();
    const interval = setInterval(fetchSosAlerts, 5000);
    return () => clearInterval(interval);
  }, []);

  const updateStatus = async (id, newStatus) => {
    try {
      await fetch(`${API_URL}/sos/update-sos-status/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      await fetchSosAlerts();
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setEditingStatus(null);
    }
  };

  const fullyFilteredAlerts = sosAlerts.filter(
    (alert) =>
      (statusFilter === "ALL" || alert.status === statusFilter) &&
      (cityFilter === "ALL" || alert.city === cityFilter)
  );

  const sortedAlerts = [...fullyFilteredAlerts].sort((a, b) =>
    sortAscending
      ? new Date(a.timestamp) - new Date(b.timestamp)
      : new Date(b.timestamp) - new Date(a.timestamp)
  );

  return (
    <>
      <Navbar />
      <div className="map-page">
        <h1 className="text-center text-2xl font-bold my-4">SOS Alerts Map</h1>
        <div className="map-container">
          <MapContainer
            center={[21.2537, 72.6029]}
            zoom={6}
            className="map-box"
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {sortedAlerts.map(
              (alert) =>
                alert.latitude &&
                alert.longitude && (
                  <Marker
                    key={alert._id}
                    position={[alert.latitude, alert.longitude]}
                    icon={icons[alert.status] || icons.PENDING}
                  >
                    <Popup>
                      <div>
                        <strong>Status:</strong> {alert.status}
                        <br />
                        <strong>Message:</strong> {alert.message}
                        <br />
                        <strong>Created At:</strong>{" "}
                        {new Date(alert.timestamp).toLocaleString()}
                      </div>
                    </Popup>
                  </Marker>
                )
            )}
          </MapContainer>
        </div>
      </div>

      <div className="p-4 my-4 bg-white shadow-md rounded-lg border border-gray-300 max-w-4xl mx-auto">
        <h2 className="text-lg font-semibold text-center mb-4">
          City-wise SOS Summary
        </h2>
        <div className="flex flex-wrap justify-center gap-3">
          <button
            className={`px-4 py-2 rounded-full border ${
              cityFilter === "ALL"
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-700"
            }`}
            onClick={() => setCityFilter("ALL")}
          >
            All ({sosAlerts.length})
          </button>
          {Object.entries(cityCounts).map(([city, count]) => (
            <button
              key={city}
              className={`px-4 py-2 rounded-full border ${
                cityFilter === city
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
              onClick={() => setCityFilter(city)}
            >
              {city} ({count})
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl p-4 shadow-md border border-gray-200 my-4 bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300">
        <table className="min-w-full table-auto text-sm text-left text-gray-700 bg-white rounded-lg overflow-hidden">
          <thead className="bg-gray-100 text-gray-800 uppercase text-xs tracking-wider">
            <tr>
              <th className="px-4 py-3">Username</th>
              <th className="px-4 py-3">Email</th>
              <th
                onClick={() => setSortAscending(!sortAscending)}
                className="px-4 py-3 cursor-pointer hover:text-blue-600"
              >
                Time {sortAscending ? "▲" : "▼"}
              </th>
              <th className="px-4 py-3">
                Status
                <select
                  onChange={(e) => setStatusFilter(e.target.value)}
                  value={statusFilter}
                  className="ml-2 p-1 rounded-md border border-gray-300 text-gray-700"
                >
                  <option value="ALL">All</option>
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </th>
              <th className="px-4 py-3">Latitude</th>
              <th className="px-4 py-3">Longitude</th>
              <th className="px-4 py-3">City</th>
              <th className="px-4 py-3">Message</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sortedAlerts.map((alert) => (
              <tr
                key={alert._id}
                className="hover:bg-gray-50 transition-colors duration-200"
              >
                <td className="px-4 py-2">{alert.userId?.fullName || "N/A"}</td>
                <td className="px-4 py-2">{alert.userId?.email || "N/A"}</td>
                <td className="px-4 py-2">
                  {new Date(alert.timestamp).toLocaleString()}
                </td>
                <td
                  onClick={() => setEditingStatus(alert._id)}
                  className="px-4 py-2 cursor-pointer"
                >
                  {editingStatus === alert._id ? (
                    <select
                      onChange={(e) =>
                        updateStatus(alert._id, e.target.value)
                      }
                      autoFocus
                      onBlur={() => setEditingStatus(null)}
                      className="p-1 rounded-md border border-gray-300 text-gray-700"
                    >
                      {STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  ) : (
                    alert.status
                  )}
                </td>
                <td className="px-4 py-2">{alert.latitude}</td>
                <td className="px-4 py-2">{alert.longitude}</td>
                <td className="px-4 py-2">{alert.city}</td>
                <td className="px-4 py-2">{alert.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default Map;
