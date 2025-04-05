import express from "express";
import jwt from 'jsonwebtoken';
import { authenticateToken, isAdmin } from "../middlewares/authMiddleware.js";
import User from "../models/User.js";  // ✅ Import the model

const router = express.Router();

// 📌 Get User Details
router.get("/logindetail", authenticateToken, async (req, res) => {
    res.json({ fullName: req.user.fullName, email: req.user.email, role: req.user.role });
});

// 📌 Update Email
router.put("/update-email", authenticateToken, async (req, res) => {
    try {
    const { newEmail } = req.body;
    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
        return res.status(400).json({ message: "Invalid email format" });
    }
    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized - No user found" });
    }
    const user = await User.findById(req.user.id);
    
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }
    if (newEmail == user.email) {
        return res.status(404).json({ message: "Enter new email" });
    }
    const existingEmail = await User.findOne({ email: newEmail });
    if (existingEmail) {
            return res.status(400).json({ message: "This is email belongs other user" });
    }

        // Find user in the database
        user.email = newEmail;
        await user.save();
        const generateToken = (user) => {
            return jwt.sign({ id: user._id, role: user.role, email: user.email, fullName: user.fullName }, process.env.JWT_SECRET, { expiresIn: '1h' });
        };
        res.json({ message: "Email updated successfully", email: user.email, token: generateToken(user), });
    } catch (error) {
        console.error("Error updating email:", error);
        res.status(500).json({ message: "Server error" });
    }
});


// 📌 Change Password
router.put("/update-password", authenticateToken, async (req, res) => {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
        return res.status(400).json({ message: "All fields are required" });
    }
    if (newPassword == currentPassword) {
        return res.status(400).json({ message: "Password must be different from previous one." });

    }
    if (newPassword !== confirmPassword) {
        return res.status(400).json({ message: "Confirm password does not match new password." });
    }

    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Now we can check the password correctly
        if (!(await user.matchPassword(currentPassword))) {
            return res.status(401).json({ message: "Current password is incorrect" });
        }

        console.log(newPassword);
        user.password = newPassword;
        await user.save();

        const generateToken = (user) => {
            return jwt.sign({ id: user._id, role: user.role, email: user.email, fullName: user.fullName }, process.env.JWT_SECRET, { expiresIn: '1h' });
        };
        res.json({ message: "Password updated successfully", token: generateToken(user), });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

router.post("/checkUsername", async (req, res) => {
    try {
        const { name } = req.body;

        // Await the asynchronous find operation
        const existingUsername = await User.findOne({ fullName: name });

        // Check if the username already exists
        if (existingUsername) {
            // Return the response immediately if the username exists
            return res.status(200).json({ message: "Username is already taken" });
        }

        // If the username is available
        return res.status(200).json({ message: "Username is available" });
    } catch (error) {
        // Handle errors and send response
        res.status(500).json({ message: "Error while checking username" });
    }
});

// 📌 GET All Users (Only for Admins)
router.get("/", authenticateToken, isAdmin, async (req, res) => {
    try {
        const users = await User.find({}, "-password"); // Exclude password field
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: "Server error: Unable to fetch users" });
    }
});

router.delete("/:id", authenticateToken, isAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.role === "admin") {
            return res.status(403).json({ message: "Admins cannot be deleted!" }); // ❌ Block admin deletion
        }

        await user.deleteOne();
        res.json({ message: "User deleted successfully" });
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ message: "Server error: Unable to delete user" });
    }
});

export default router;

