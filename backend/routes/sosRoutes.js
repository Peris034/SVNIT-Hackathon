import express from "express";
import { storeFcmToken, triggerSos, storeSosAlert, getAllSos, updateSosStatus } from "../controllers/sosController.js";
import { authenticateToken, sosToken, isAdmin, contactToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post("/store-fcm-token", contactToken, storeFcmToken);
router.post("/trigger", contactToken, triggerSos);
router.post("/sos-alert", authenticateToken, storeSosAlert);
router.get("/sos-alerts", sosToken, getAllSos);
router.put("/update-sos-status/:id", contactToken, isAdmin, updateSosStatus); 

export default router;
