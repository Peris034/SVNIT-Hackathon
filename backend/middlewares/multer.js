import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// ✅ Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ✅ Storage for Incidents (No changes, keeping it as is)
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "incidents", // Cloudinary folder
    public_id: (req, file) => file.originalname.split(".")[0].trim(), // Set unique public ID
  },
});

// ✅ Set up Cloudinary Storage for "posts"
const storagePost = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "posts", // Make sure this matches your Cloudinary folder
    public_id: (req, file) => 
      file.originalname.replace(/\s+/g, "_").trim().split(".")[0], // ✅ Remove spaces
  },
});

// 🛠️ File filter (Accept all files)
const fileFilter = (req, file, cb) => {
  cb(null, true);
};

// ✅ Set up multer for incidents (No changes)
const upload = multer({ storage, fileFilter });

// ✅ Set up multer for posts
const uploadPost = multer({ storage: storagePost, fileFilter });

// ✅ Middleware to attach public URL for all types of files
const generatePublicUrl = (req, res, next) => {
  if (req.file) {
    try {
      // Get the correct resource type
      const resourceType = req.file.mimetype.startsWith("image") ? "image" : "raw";
      const publicUrl = cloudinary.url(req.file.filename, {
        resource_type: resourceType,
        type: "upload",
      }).split("?")[0];

      req.fileUrl = publicUrl; // Attach public URL
    } catch (error) {
      console.error("Error generating public URL:", error.message);
      return res.status(500).json({ success: false, message: "Error generating URL" });
    }
  } else {
    console.error("No file found in the request.");
    return res.status(400).json({ success: false, message: "No file uploaded" });
  }
  next();
};

// ✅ Export both upload handlers
export { upload, uploadPost, generatePublicUrl };
