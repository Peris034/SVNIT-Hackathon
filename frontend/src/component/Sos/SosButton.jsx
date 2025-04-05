import React, { useState, useEffect } from "react";
import Navbar from "../Navbar";
import notificationService from "../../firebase/notification.service";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL;

const SosButton = () => {
    const [isPressed, setIsPressed] = useState(false);
    const [fcmToken, setFcmToken] = useState(localStorage.getItem("fcmToken") || "");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const initializeNotifications = async () => {
            try {
                if (!("Notification" in window) || !("serviceWorker" in navigator)) {
                    console.warn("Browser does not support notifications.");
                    setError("Your browser does not support notifications.");
                    toast.error("Browser not supported for notifications.");
                    return;
                }

                const permission = await Notification.requestPermission();
                if (permission !== "granted") {
                    setError("Notifications permission not granted.");
                    toast.error("Please enable notifications to use the SOS feature.");
                    return;
                }

                const storedToken = localStorage.getItem("fcmToken");
                if (storedToken) {
                    setFcmToken(storedToken);
                } else {
                    const token = await notificationService.requestPermission();
                    if (!token) {
                        throw new Error("Failed to retrieve FCM Token.");
                    }
                    localStorage.setItem("fcmToken", token);
                    setFcmToken(token);
                    await sendTokenToServer(token);
                    toast.success("Notifications enabled!");
                }
            } catch (error) {
                console.error("❌ Notification Error:", error);
                setError(`Notification Error: ${error.message}`);
                toast.error("Error setting up notifications.");
            }
        };

        initializeNotifications();
    }, []);

    const sendTokenToServer = async (token) => {
        try {
            const response = await fetch(`${API_URL}/sos/store-fcm-token`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({ fcmToken: token }),
            });

            if (!response.ok) throw new Error("Failed to store FCM token.");
        } catch (error) {
            console.error("❌ FCM Token Error:", error);
            setError("Failed to store notification token.");
        }
    };

    const getCurrentPosition = () => {
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
            });
        });
    };

    const handleSosPress = async () => {
        if (!navigator.geolocation) {
            toast.error("Geolocation is not supported by this browser.");
            return;
        }

        if (!fcmToken) {
            toast.error("FCM Token is missing. Please allow notifications.");
            return;
        }

        setIsPressed(true);
        setLoading(true);
        setError(null);

        try {
            if ("vibrate" in navigator) {
                navigator.vibrate([200, 100, 200]);
            }

            const position = await getCurrentPosition();
            const { latitude, longitude } = position.coords;

            const response = await fetch(`${API_URL}/sos/trigger`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({
                    fcmToken,
                    location: { latitude, longitude },
                    message: "Emergency SOS Triggered!",
                }),
            });

            if (response.ok) {
                toast.success("🚨 SOS alert sent successfully!");
            } else {
                toast.error("🚨 SOS alert failed.");
            }
        } catch (error) {
            console.error("❌ SOS Error:", error);
            setError("Failed to send SOS alert. Please try again.");
        } finally {
            setTimeout(() => setIsPressed(false), 2000);
            setLoading(false);
        }
    };

    return (
        <>
            <Navbar />
            <div className="sos-container">
                {error && <p className="error-message">{error}</p>}
                <button
                    className={`sos-button ${isPressed ? "pressed" : ""} ${loading ? "loading" : ""}`}
                    onClick={handleSosPress}
                    disabled={loading}
                >
                    {loading ? "Sending..." : "SOS"}
                </button>
            </div>
            <style jsx="true" >{`
                .sos-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 80vh;
                }
                .error-message {
                    color: red;
                    font-size: 14px;
                    margin-bottom: 10px;
                }
                .sos-button {
                    width: 160px;
                    height: 160px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #ff0000, #d40000);
                    color: white;
                    border: none;
                    font-size: 26px;
                    font-weight: bold;
                    cursor: pointer;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.3);
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                }
                .sos-button:hover {
                    transform: scale(1.05);
                    box-shadow: 0 6px 12px rgba(0,0,0,0.4);
                }
                .sos-button.pressed {
                    transform: scale(0.92);
                    background: linear-gradient(135deg, #d40000, #a80000);
                }
                .sos-button.loading {
                    background: gray;
                    cursor: not-allowed;
                }
            `}</style>
        </>
    );
};

export default SosButton;
