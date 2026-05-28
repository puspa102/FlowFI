import express from 'express'
import * as subscriptionController from '../controller/subscriptionController'

const router = express.Router()

router.get('/stats', subscriptionController.getSubscriptionStats)
router.get('/ai-recommendations', subscriptionController.getAIRecommendations)
router.get('/', subscriptionController.getSubscriptions)
router.post('/', subscriptionController.addSubscription)
router.put('/:id', subscriptionController.updateSubscription)
router.delete('/:id', subscriptionController.deleteSubscription)

export default router
