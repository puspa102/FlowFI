import express from 'express'
import { getDashboardSummary, getDashboardAnalytics } from '../controller/dashboardController'

const router = express.Router()

router.get('/summary', getDashboardSummary)
router.get('/analytics', getDashboardAnalytics)

export default router

