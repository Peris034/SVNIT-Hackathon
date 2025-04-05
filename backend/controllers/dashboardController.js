import User from "../models/User.js"
// import SosAlert from "../models/SosAlert.js"
import Sos from "../models/Sos.js"
import Log from "../models/Logs.js";
// import EmergencyContact from "../models/EmergencyContact.js"

export const dashboardData = async (req,res) => {
    try {
        // Get basic stats
        const totalUsers = await User.countDocuments({ role: "user" });
        
        const activeUsers = await Log.countDocuments({
            role: "user",
            lastLogin: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
        });
        console.log("Active Users in last 30 days:", activeUsers);
        
        const totalAlerts = await Sos.countDocuments();

        // Get recent emergency alerts (last 5)
        const recentAlerts = await Sos.find()
            .sort({ timestamp: -1 })
            .limit(5)
            .populate('userId', 'name') // Get user's name who created alert
            .select('timestamp location status message');

        // Get recent user registrations (last 5)
        const recentUsers = await User.find({ role: "user" })
            .sort({ createdAt: -1 })
            .limit(5)
            .select('name email createdAt');

        res.status(200).json({
            totalUsers,
            activeUsers,
            totalAlerts,
            recentAlerts,
            recentUsers
        });

    } catch (error) {
        console.error("❌ Error in dashboard data:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}