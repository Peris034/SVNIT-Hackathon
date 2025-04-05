import express from 'express';
import { addEmergencyContact, getUserEmergencyContacts } from '../controllers/emergencyContactController.js';
import { contactToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', contactToken, addEmergencyContact);
router.get('/', contactToken, getUserEmergencyContacts);

export default router;
