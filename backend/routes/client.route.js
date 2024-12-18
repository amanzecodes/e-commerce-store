import express from 'express'
import { clientsInfo } from '../controllers/clients.controllers.js';
import { protectRoute, superAdmin } from '../middleware/auth.middleware.js';

const router = express.Router()
router.get('/', protectRoute, superAdmin, clientsInfo)

export default router;