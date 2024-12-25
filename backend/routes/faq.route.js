import express from 'express'
import { addFaq, getFaq, editFaq } from '../controllers/faq.contollers.js';
const router = express.Router()

router.post('/', addFaq);

router.get('/faq', getFaq);

router.put('/faq/:id', editFaq);

export default router;