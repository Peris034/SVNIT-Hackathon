import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import emergencyContactRoutes from "./routes/emergencyContactRoutes.js";
// import sosAlertRoutes from "./routes/sosAlertRoutes.js";
import sosRoutes from "./routes/sosRoutes.js";
// import postRoutes from "./routes/postRoutes.js"
import incidentRoutes from "./routes/incidentRoutes.js"; // ✅ Added incident routes
import dashboardRoute from "./routes/dashboardRoutes.js";
dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(cors({ origin: "*" }));

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/emergency-contacts", emergencyContactRoutes);
// app.use("/api/sos-alerts", sosAlertRoutes);
app.use("/api/sos", sosRoutes);
app.use("/api/incident", incidentRoutes); // ✅ Incident routes
// app.use("/api/posts", postRoutes); // ✅ Post routes
app.use("/api/dashboard",dashboardRoute)
// Error Handling
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ success: false, message: "Internal Server Error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
