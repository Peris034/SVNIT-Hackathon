import express from 'express';
import { dashboardData } from '../controllers/dashboardController.js';
import { authenticateToken, isAdmin } from '../middlewares/authMiddleware.js';
const router = express.Router();

router.get('/', dashboardData);

export default router;