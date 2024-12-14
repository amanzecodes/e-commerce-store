import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import { changeSettings } from '../controllers/settings.controllers.js';

const router = express.Router()

router.put('/', protectRoute, changeSettings)

export default router;