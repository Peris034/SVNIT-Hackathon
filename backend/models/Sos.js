import mongoose from "mongoose";

const sosSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    fcmToken: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    message: { type: String, default: "SOS Triggered!" },
    status: {
        type: String,
        enum: ['PENDING', 'ACTIVE', 'RESOLVED', 'CANCELLED'],
        default: 'PENDING'
    },
    timestamp: {
        type: String,
        default: () => new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
    }
});

const Sos = mongoose.model("Sos", sosSchema);
export default Sos;
