import express from 'express'
import { listInsights, chatWithAI, getAiPredictionsHandler, smartCategorizeHandler, getBudgetSuggestionsHandler, getAnomaliesHandler, getSpendingPatternsHandler } from '../controller/insightController'

const router = express.Router()

router.get('/', listInsights)
router.post('/chat', chatWithAI)
router.get('/ai-predictions', getAiPredictionsHandler)
router.get('/budget-suggestions', getBudgetSuggestionsHandler)
router.get('/anomalies', getAnomaliesHandler)
router.get('/spending-patterns', getSpendingPatternsHandler)
router.get('/smart-categorize', smartCategorizeHandler)
router.post('/smart-categorize', smartCategorizeHandler)

export default router

