import express from "express";
import { upload, generatePublicUrl } from "../middlewares/multer.js";
import Incident from "../models/Incident.js";
import { incidentToken, authenticateToken, isAdmin } from "../middlewares/authMiddleware.js";
import { incidentMailSender } from "../controllers/mailSender.js";
import User from "../models/User.js";

const router = express.Router();

// 📌 POST: Submit an incident
router.post("/", incidentToken, upload.single("document"), generatePublicUrl, async (req, res) => {
  try {
    // console.log("Request Body:", req.body);
    // console.log("User ID from token:", req.userId);
    // console.log("File Uploaded:", req.file);
    // console.log("Public File URL:", req.fileUrl);  // The public URL from Cloudinary
  
    const { name, number, address, message, latitude, longitude, category , otherCategory} = req.body;
  
    if (!latitude || !longitude) {
      return res.status(400).json({ success: false, message: "Location data is required" });
    }
  
    if (!req.userId) {
      return res.status(400).json({ success: false, message: "User authentication failed" });
    }
  
    const newIncident = new Incident({
      name,
      number,
      address,
      message,
      documentUrl: req.fileUrl,  // Save the public URL
      userId: req.userId,
      category,
      status:'Pending',
      otherCategoryMsg: otherCategory ? otherCategory : null,
      location: { latitude, longitude },
    });
    const user = await User.findById(req.userId);
    
    await newIncident.save();
    const mail = await incidentMailSender({data:user})
    
    res.status(201).json({ success: true, message: "Incident reported successfully!" });
  } catch (error) {
    console.error("Error saving incident:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.put('/status-change/:id' ,async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    console.log('status..',status)
    const updated = await Incident.findByIdAndUpdate(id, { status }, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update incident status' });
  }
});


// 📌 GET: Fetch all incidents
router.get("/", authenticateToken, async (req, res) => {
  try {
    let incidents;

    if (req.user.role === "admin") {
      // Admin gets all incidents
      incidents = await Incident.find().exec();
    } else {
      // User gets only their own incidents
      incidents = await Incident.find({ user: req.user._id }).exec();
    }

    if (!incidents || incidents.length === 0) {
      return res.status(404).json({ success: false, message: "No incidents found" });
    }

    res.status(200).json({ success: true, incidents });
  } catch (error) {
    console.error("Error fetching incidents:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
});

export default router;
