import express from 'express'
import * as investmentController from '../controller/investmentController'

const router = express.Router()

router.get('/top-assets', investmentController.getTopPerformingAssets)
router.get('/stats', investmentController.getPortfolioStats)
router.get('/', investmentController.getInvestmentPortfolio)
router.post('/', investmentController.addInvestment)
router.put('/:id', investmentController.updateInvestment)
router.delete('/:id', investmentController.deleteInvestment)

export default router
