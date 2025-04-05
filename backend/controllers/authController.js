import User from '../models/User.js';
import Log from "../models/Logs.js";
import jwt from 'jsonwebtoken';

// Generate JWT Token
const generateToken = (user) => {
    return jwt.sign(
        { id: user._id, role: user.role, email: user.email, fullName: user.fullName },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );
};

// Register User
export const registerUser = async (req, res) => {
    const { fullName, email, password, mobile, fcmToken } = req.body;
    try {
        
        const userExists = await User.findOne({
        $or: [{ email: email }, { fullName: fullName }]
        });
        
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            fullName,
            email,
            password,
            mobile,
            role: 'user',
            fcmToken: fcmToken || null,  // Store FCM token if available
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                mobile: user.mobile,
                role: user.role,
                fcmToken: user.fcmToken,
                token: generateToken(user),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Login User
export const loginUser = async (req, res) => {
    const { email, password, fcmToken } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Update FCM token if it is not present or needs updating
        if (fcmToken && (!user.fcmToken || user.fcmToken !== fcmToken)) {
            user.fcmToken = fcmToken;
            await user.save();
            console.log("✅ FCM Token updated during login for user:", user.fullName);
        }

        await Log.create({
            fullName: user.fullName,
            email: user.email,
            role: user.role,
        });

        res.json({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            mobile: user.mobile,
            role: user.role,
            fcmToken: user.fcmToken,
            token: generateToken(user),
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
