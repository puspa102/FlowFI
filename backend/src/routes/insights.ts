import express from 'express'
import { listInsights, chatWithAI, getAiPredictionsHandler, smartCategorizeHandler } from '../controller/insightController'

const router = express.Router()

router.get('/', listInsights)
router.post('/chat', chatWithAI)
router.get('/ai-predictions', getAiPredictionsHandler)
router.get('/smart-categorize', smartCategorizeHandler)

export default router

