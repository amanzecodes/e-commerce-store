import express from 'express'
import { clientsInfo, removeClient } from '../controllers/clients.controllers.js';
import { protectRoute, superAdmin } from '../middleware/auth.middleware.js';

const router = express.Router()
router.get('/', protectRoute, superAdmin, clientsInfo)
router.delete('/removeClient/:id', protectRoute, superAdmin, removeClient)
export default router;