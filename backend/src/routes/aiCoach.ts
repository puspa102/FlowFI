import express from 'express'
import * as aiCoachController from '../controller/aiCoachController'

const router = express.Router()

router.get('/anomalies', aiCoachController.getAnomalies)
router.post('/anomalies', aiCoachController.createAnomaly)
router.get('/predictions', aiCoachController.getExpensePrediction)
router.get('/insights', aiCoachController.getAIInsights)
router.get('/savings-velocity', aiCoachController.getSavingsVelocity)
router.get('/habit-analytics', aiCoachController.getHabitAnalytics)

export default router
