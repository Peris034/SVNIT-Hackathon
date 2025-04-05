import React, { useState, useEffect } from "react";
import { sendSosAlert, fetchUserSosAlerts } from "../../services/api";

const SosAlertButton = ({ token }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [alerts, setAlerts] = useState([]);

    useEffect(() => {
        const loadAlerts = async () => {
            try {
                const data = await fetchUserSosAlerts(token);
                setAlerts(data);
            } catch (err) {
                console.error("Error fetching SOS alerts:", err);
            }
        };
        loadAlerts();
    }, [token]);

    const handleSendAlert = () => {
        if (!token) {
            console.error("Token missing! Redirecting to login...");
            return (window.location.href = "/");
        }

        setLoading(true);
        setError(null);

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    const response = await sendSosAlert([longitude, latitude], token);
                    alert("🚨 SOS Alert Sent!");
                    setAlerts(prev => [response, ...prev]);
                } catch (error) {
                    console.error("Error sending SOS Alert:", error);
                    setError("Failed to send SOS Alert. Try again.");
                } finally {
                    setLoading(false);
                }
            },
            (error) => {
                console.error("Location error:", error);
                setError("Failed to get location. Enable location services.");
                setLoading(false);
            }
        );
    };

    return (
        <div className="max-w-2xl mx-auto p-6 shadow-lg rounded-2xl bg-white">
            <h2 className="text-2xl font-bold text-center mb-4">SOS Alerts</h2>
            {error && <p className="text-red-500 text-center">{error}</p>}
            <button
                onClick={handleSendAlert}
                className={`w-full py-3 text-white font-semibold rounded-lg transition-all ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"
                    }`}
                disabled={loading}
            >
                {loading ? "Sending SOS..." : "Send SOS Alert"}
            </button>

            {/* Display SOS Alerts */}
            <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Previous Alerts</h3>
                {alerts.length > 0 ? (
                    <ul className="border border-gray-200 rounded-lg p-4 space-y-2">
                        {alerts.map(alert => (
                            <li key={alert._id} className="flex justify-between items-center border-b last:border-0 pb-2">
                                <span className="font-medium">{new Date(alert.createdAt).toLocaleString()}</span>
                                <span
                                    className={`px-2 py-1 rounded-md text-sm ${alert.status === "SENT" ? "bg-green-500 text-white" :
                                            alert.status === "FAILED" ? "bg-red-500 text-white" :
                                                "bg-yellow-500 text-black"
                                        }`}
                                >
                                    {alert.status}
                                </span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-500 text-center">No SOS alerts sent yet.</p>
                )}
            </div>
        </div>
    );
};

export default SosAlertButton;
