import express from 'express'
import { getPricing } from '../controller/pricingController'

const router = express.Router()

router.get('/', getPricing)

export default router
