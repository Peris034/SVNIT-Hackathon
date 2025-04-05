import mongoose from "mongoose";

const logSchema = new mongoose.Schema({
    fullName: { type: String, required: true },  // ✅ Use String instead of mongoose.Schema.Types.fullName
    email: { type: String, required: true },     // ✅ Use String instead of mongoose.Schema.Types.email
    role: { type: String, required: true },      // ✅ Use String instead of mongoose.Schema.Types.role
    loginTime: { 
        type: String, 
        default: () => new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }) 
    } // ✅ Store time in IST
});

const Log = mongoose.model("Log", logSchema);

export default Log;