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
import MarkerClusterGroup from 'react-leaflet-markercluster';
// import 'react-leaflet-markercluster/dist/styles.min.css';

const API_URL = import.meta.env.VITE_API_URL;
const STATUS_OPTIONS = ["PENDING", "RESOLVED", "CANCELLED", "ACTIVE"];

const createCustomIcon = (status) => {
  const colors = {
    ACTIVE: "#FF5733",
    RESOLVED: "#28A745",
    CANCELLED: "#6C757D",
    PENDING: "#007BFF"
  };

  return L.divIcon({
    html: `
      <div class="custom-marker-container ${status.toLowerCase()}">
        <div class="marker-inner">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 0C7.58 0 4 3.58 4 8C4 13.54 12 24 12 24C12 24 20 13.54 20 8C20 3.58 16.42 0 12 0Z" fill="${colors[status]}"/>
            <circle cx="12" cy="8" r="4" fill="white"/>
          </svg>
        </div>
        <div class="ripple"></div>
        <div class="ripple delay-1"></div>
        <div class="ripple delay-2"></div>
      </div>
    `,
    className: `custom-div-icon ${status.toLowerCase()}`,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });
};

const createClusterIcon = (cluster) => {
  const childCount = cluster.getChildCount();
  let size = 'small';
  
  if (childCount > 50) size = 'large';
  else if (childCount > 20) size = 'medium';

  return L.divIcon({
    html: `
      <div class="cluster-marker ${size}">
        <span>${childCount}</span>
      </div>
    `,
    className: 'custom-cluster-icon',
    iconSize: L.point(40, 40),
    iconAnchor: [20, 20]
  });
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
            
            <MarkerClusterGroup
              chunkedLoading
              iconCreateFunction={createClusterIcon}
              spiderfyOnMaxZoom={true}
              showCoverageOnHover={false}
              zoomToBoundsOnClick={true}
              maxClusterRadius={50}
            >
              {sortedAlerts.map(
                (alert) =>
                  alert.latitude &&
                  alert.longitude && (
                    <Marker
                      key={alert._id}
                      position={[alert.latitude, alert.longitude]}
                      icon={createCustomIcon(alert.status || 'PENDING')}
                    >
                      <Popup>
                        <div className="popup-content">
                          <div className={`status-badge ${alert.status.toLowerCase()}`}>
                            {alert.status}
                          </div>
                          <p className="message"><strong>Message:</strong> {alert.message}</p>
                          <p className="timestamp">
                            <strong>Created:</strong> {new Date(alert.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </Popup>
                    </Marker>
                  )
              )}
            </MarkerClusterGroup>
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
                        <option key={status} className="text-gray-700 bg-white hover:bg-blue-100" value={status}>
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

      <style>{`
        .custom-marker-container {
          position: relative;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .marker-inner {
          position: relative;
          z-index: 2;
          animation: bounce 1s infinite;
        }

        .marker-inner svg {
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
        }

        .ripple {
          position: absolute;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          animation: ripple 2s ease-out infinite;
        }

        .ripple.delay-1 {
          animation-delay: 0.5s;
        }

        .ripple.delay-2 {
          animation-delay: 1s;
        }

        .active .ripple {
          background: rgba(255, 87, 51, 0.3);
          animation-duration: 1.5s;
        }

        .pending .ripple {
          background: rgba(0, 123, 255, 0.3);
        }

        .resolved .ripple {
          background: rgba(40, 167, 69, 0.3);
          animation-duration: 2.5s;
        }

        .cancelled .ripple {
          background: rgba(108, 117, 125, 0.3);
          animation-duration: 3s;
        }

        @keyframes ripple {
          0% {
            transform: scale(1);
            opacity: 0.8;
          }
          100% {
            transform: scale(4);
            opacity: 0;
          }
        }

        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-4px);
          }
        }

        .cluster-marker {
          background: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          box-shadow: 0 2px 5px rgba(0,0,0,0.2);
          transition: all 0.3s ease;
          animation: pulse 2s infinite;
        }

        .cluster-marker:hover {
          transform: scale(1.1);
          animation: none;
        }

        .cluster-marker.small {
          width: 35px;
          height: 35px;
          border: 3px solid #28a745;
          color: #28a745;
        }

        .cluster-marker.medium {
          width: 45px;
          height: 45px;
          border: 4px solid #ffc107;
          color: #ffc107;
        }

        .cluster-marker.large {
          width: 55px;
          height: 55px;
          border: 5px solid #dc3545;
          color: #dc3545;
        }

        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(0, 123, 255, 0.4);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(0, 123, 255, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(0, 123, 255, 0);
          }
        }

        .popup-content {
          padding: 12px;
          min-width: 220px;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .leaflet-popup-content-wrapper {
          border-radius: 8px;
          padding: 0;
        }

        .leaflet-popup-tip {
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .status-badge {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 12px;
          margin-bottom: 8px;
          font-weight: bold;
          font-size: 0.9em;
        }

        .status-badge.active {
          background: #ffebe6;
          color: #FF5733;
        }

        .status-badge.pending {
          background: #e6f3ff;
          color: #007BFF;
        }

        .status-badge.resolved {
          background: #e6ffe6;
          color: #28A745;
        }

        .status-badge.cancelled {
          background: #f2f2f2;
          color: #6C757D;
        }

        .message {
          margin: 8px 0;
          line-height: 1.4;
        }

        .timestamp {
          font-size: 0.9em;
          color: #666;
          margin-top: 8px;
        }

        /* MarkerCluster Custom Styles */
        .marker-cluster-small {
            background-color: rgba(40, 167, 69, 0.6);
        }
        .marker-cluster-small div {
            background-color: rgba(40, 167, 69, 0.8);
        }

        .marker-cluster-medium {
            background-color: rgba(255, 193, 7, 0.6);
        }
        .marker-cluster-medium div {
            background-color: rgba(255, 193, 7, 0.8);
        }

        .marker-cluster-large {
            background-color: rgba(220, 53, 69, 0.6);
        }
        .marker-cluster-large div {
            background-color: rgba(220, 53, 69, 0.8);
        }

        .marker-cluster {
            background-clip: padding-box;
            border-radius: 50%;
        }

        .marker-cluster div {
            width: 30px;
            height: 30px;
            margin-left: 5px;
            margin-top: 5px;
            text-align: center;
            border-radius: 50%;
            font-size: 12px;
            color: white;
            font-weight: bold;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .marker-cluster span {
            line-height: 30px;
        }
      `}</style>
    </>
  );
};

export default Map;
