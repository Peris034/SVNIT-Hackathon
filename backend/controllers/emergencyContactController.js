import EmergencyContact from '../models/EmergencyContact.js';

export const addEmergencyContact = async (req, res) => {
    try {
        const { name, mobile, relationship } = req.body;

        if (!name || !mobile) {
            return res.status(400).json({ message: "Name and mobile are required" });
        }

        const contact = await EmergencyContact.create({
            userId: req.user._id,
            name,
            mobile,
            relationship
        });
        res.status(201).json(contact);
    } catch (error) {
        console.error("Error adding emergency contact:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const getUserEmergencyContacts = async (req, res) => {
    try {
        const contacts = await EmergencyContact.find({ userId: req.user._id });
        res.json(contacts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
