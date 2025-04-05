import User from "../models/User.js"
// import SosAlert from "../models/SosAlert.js"
import Sos from "../models/Sos.js"
import Log from "../models/Logs.js";
// import EmergencyContact from "../models/EmergencyContact.js"

export const dashboardData = async (req,res) => {
    try {
        // Get basic stats
        const totalUsers = await User.countDocuments({ role: "user" });
        const activeUsers = await Log.countDocuments({ role: "user" });
        const totalAlerts = await Sos.countDocuments();

        // Simple status count aggregation
        const statusCounts = await Sos.aggregate([
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 }
                }
            }
        ]);

        console.log("Status counts:", statusCounts); // Debug log

        res.status(200).json({
            totalUsers,
            activeUsers,
            totalAlerts,
            recentAlerts: await Sos.find().sort({ timestamp: -1 }).limit(5),
            recentUsers: await User.find({ role: "user" }).sort({ createdAt: -1 }).limit(5),
            chartData: statusCounts
        });

    } catch (error) {
        console.error("❌ Error in dashboard data:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}