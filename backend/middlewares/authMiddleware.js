import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const isAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized, user not found' });
    }

    if (req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Access denied, not an admin' });
    }
};

export const authenticateToken = async (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];
    // console.log('Received Token:', token);

    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select('-password');

        if (!req.user) {
            return res.status(401).json({ message: 'User not found' });
        }
        req.user = decoded;
        // console.log("Authenticated User:", req.user); // Debugging
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
};

export const postToken = async (req, res, next) => {
    const authHeader = req.header("Authorization");
    const token = authHeader?.split(" ")[1];

    if (!token) {
        console.log("❌ No token provided");
        return res.status(401).json({ message: "No token provided" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // console.log("🔹 Decoded Token User:", decoded);
        
        req.user = { ...decoded, _id: decoded.id }; // ✅ Assign `_id` from `id`

        next(); // Move to next middleware
    } catch (error) {
        console.log("❌ Invalid Token:", error.message);
        return res.status(403).json({ message: "Invalid token" });
    }
};

export const sosToken = async (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');  // ✅ Fetch user from DB

        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        req.user = user;  // ✅ Attach user data, including `role`
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
};

export const contactToken = async (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];
    // console.log('Received Token:', token);

    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select('-password');

        if (!req.user) {
            return res.status(401).json({ message: 'User not found' });
        }
        // req.user = decoded;
        // console.log("Authenticated User:", req.user); // Debugging
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
};

export const incidentToken = async (req, res, next) => {
    try {
        const token = req.header("Authorization")?.split(" ")[1];
        if (!token) return res.status(401).json({ success: false, message: "No token, authorization denied" });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.id;

        const user = await User.findById(req.userId);
        if (!user) return res.status(401).json({ success: false, message: "User not found" });

        next();
    } catch (error) {
        console.error("Auth Middleware Error:", error);
        res.status(401).json({ success: false, message: "Invalid token" });
    }
};