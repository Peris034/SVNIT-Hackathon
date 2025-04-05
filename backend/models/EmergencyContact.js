import mongoose from 'mongoose';

const emergencyContactSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    name: { type: String, required: true },
    // fcmToken: { type: String, required: true },
    mobile: { type: String, required: true },  // Ensure this field is present
    relationship: String,
    createdAt: { type: Date, default: Date.now }
});

const EmergencyContact = mongoose.model('EmergencyContact', emergencyContactSchema);
export default EmergencyContact;
