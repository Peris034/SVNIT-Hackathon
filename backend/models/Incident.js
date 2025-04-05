import mongoose from "mongoose";

const incidentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  number: { type: String, required: true },
  address: { type: String, required: true },
  message: { type: String, required: true },
  category: { type: String, required: true },
  otherCategoryMsg : {type:String, required:false},
  documentUrl: { type: String }, // Cloudinary URL for uploaded file
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  location: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
  },
  createdAt: {
    type: String,
    default: () => new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
  },
});

const Incident = mongoose.model("Incident", incidentSchema);
export default Incident;
