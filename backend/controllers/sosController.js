import Sos from "../models/Sos.js";
import User from "../models/User.js";
import admin, { sendNotification, sendNotificationToMultiple } from "../config/firebaseAdmin.js";

export const triggerSos = async (req, res) => {
    try {
        const { fcmToken, location, message } = req.body;
        const userId = req.user?._id;

        if (!userId) return res.status(400).json({ error: "User ID is required." });
        if (!fcmToken || !location?.latitude || !location?.longitude)
            return res.status(400).json({ error: "Invalid request. FCM token and location are required." });

        // console.log("Creating SOS with data:", { userId, fcmToken, latitude: location.latitude, longitude: location.longitude });

        // Store FCM token for future use
        await User.findByIdAndUpdate(userId, { fcmToken });

        // Save SOS alert to the database
        const newSos = await Sos.create({
            userId,
            fcmToken,
            latitude: location.latitude,
            longitude: location.longitude,
            status: "PENDING",
            message: message || "SOS Triggered!",
        });

        const adminUsers = await User.find({ role: "admin" }).select("fcmToken");
        
        const adminTokens = adminUsers.map((user) => user.fcmToken).filter(Boolean);
        console.log(adminTokens);
        if (adminTokens.length > 0) {
            console.log("Sending notification to admins...");
            await sendNotificationToMultiple(adminTokens, "New SOS Alert firebase!", message || "An SOS has been triggered firebase!");
        }

        res.status(201).json({ message: "✅ SOS triggered successfully!", sos: newSos });
    } catch (error) {
        console.error("❌ Error triggering SOS:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// 🚀 Admin can update SOS status
export const updateSosStatus = async (req, res) => {
    try {
        // Ensure the user making the request is an admin
        if (!req.user || req.user.role !== "admin") {
            return res.status(403).json({ message: "Access denied. Only admins can update SOS status." });
        }

        const { status } = req.body;
        const { id } = req.params;
        const validStatuses = ["PENDING", "RESOLVED", "ACTIVE", "CANCELLED"];

        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid status provided." });
        }

        // Find the SOS alert and update the status
        const updatedSos = await Sos.findByIdAndUpdate(id, { status }, { new: true });

        if (!updatedSos) {
            return res.status(404).json({ message: "SOS alert not found." });
        }

        // Fetch the user associated with the SOS alert
        const user = await User.findById(updatedSos.userId);
        if (user?.fcmToken) {
            await sendNotification(user.fcmToken, "SOS Status Update", `Your SOS status has been updated to: ${status}`);
        }
        console.log(`✅ SOS status updated to ${status} for ID: ${id}`);
        res.status(200).json({ message: "SOS status updated successfully", sos: updatedSos });
    } catch (error) {
        console.error("❌ Error updating SOS status:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const getAllSos = async (req, res) => {
    try {
        const { fcmToken } = req.body;

        // 🛡️ Check if the user is an admin
        if (req.user.role === "admin") {
            // 📝 Update the FCM token for the admin if not present or outdated
            if (fcmToken) {
                const adminUser = await User.findById(req.user._id);
                if (adminUser && (!adminUser.fcmToken || adminUser.fcmToken !== fcmToken)) {
                    adminUser.fcmToken = fcmToken;
                    await adminUser.save();
                    console.log("✅ FCM Token stored/updated for admin:", adminUser.fullName);
                }
            }

            // ✅ Admin can access ALL SOS alerts
            const sosRecords = await Sos.find();
            return res.status(200).json(sosRecords);
        } else {
            // ✅ Normal users can only see their own SOS alerts
            const sosRecords = await Sos.find({ fcmToken: req.user.fcmToken });
            return res.status(200).json(sosRecords);
        }
    } catch (error) {
        console.error("❌ Error fetching SOS records:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

export const storeFcmToken = async (req, res) => {
    const { fcmToken, role } = req.body;
    const userId = req.user._id;

    if (!fcmToken) {
        return res.status(400).json({ success: false, message: "FCM Token is required" });
    }

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        user.fcmToken = fcmToken;
        user.role =role;
        await user.save();

        console.log("🔥 FCM Token stored for user:", user.fullName, user.role);
        res.status(200).json({ success: true, message: "FCM Token stored successfully!" });
    } catch (error) {
        console.error("❌ Error storing FCM Token:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// ✅ Store SOS alerts
export const storeSosAlert = (req, res) => {
    const { location } = req.body;

    if (!location || !location.latitude || !location.longitude) {
        return res.status(400).json({ success: false, message: "Location coordinates are required" });
    }

    const newAlert = {
        location,
        timestamp: new Date(),
    };

    sosAlerts.push(newAlert);
    console.log("🚨 SOS Alert received:", newAlert);

    res.status(200).json({ success: true, message: "SOS alert stored successfully!" });
};

// 🚨 Notify admins when SOS is triggered
export const notifyAdmins = async (message) => {
    const adminUsers = await User.find({ role: "admin" }).select("fcmToken");
    const adminTokens = adminUsers.map((user) => user.fcmToken).filter(Boolean);

    if (adminTokens.length > 0) {
        const payload = {
            notification: {
                title: "New SOS Alert admins",
                body: message,
            },
        };
        try {
            await admin.messaging().sendToDevice(adminTokens, payload);
            console.log("✅ Notification sent to admins.");
        } catch (error) {
            console.error("❌ Failed to send notification:", error);
        }
    }
};

// 🚀 Notify specific user when SOS status is updated
export const notifyUser = async (fcmToken, status) => {
    const payload = {
        notification: {
            title: "SOS Status Update",
            body: `Your SOS status has been updated to: ${status}`,
        },
    };
    try {
        await admin.messaging().sendToDevice(fcmToken, payload);
        console.log("✅ Notification sent to user.");
    } catch (error) {
        console.error("❌ Failed to send notification to user:", error);
    }
};