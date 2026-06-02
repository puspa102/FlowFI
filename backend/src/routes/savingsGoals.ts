import express from 'express'
import * as goalsController from '../controller/savingsGoalsController'

const router = express.Router()

router.get('/timeline', goalsController.getGoalTimeline)
router.get('/', goalsController.getSavingsGoals)
router.post('/', goalsController.createGoal)
router.put('/:id', goalsController.updateGoal)
router.post('/:id/contribute', goalsController.contributeGoal)
router.delete('/:id', goalsController.deleteGoal)

export default router
