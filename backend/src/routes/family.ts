import express from 'express'
import * as familyController from '../controller/familyController'

const router = express.Router()

router.get('/groups', familyController.getFamilyGroups)
router.post('/groups', familyController.createFamilyGroup)
router.get('/members', familyController.getFamilyMembers)
router.post('/members', familyController.addFamilyMember)
router.post('/invite', familyController.addFamilyMember)
router.get('/budgets', familyController.getFamilyBudgetsDefault)
router.post('/budgets', familyController.createFamilyBudgetDefault)
router.get('/stats', familyController.getFamilyStatsDefault)
router.put('/budgets/:budgetId/spending', familyController.updateFamilyBudgetSpending)
router.get('/:familyId/budgets', familyController.getFamilyBudgets)
router.post('/:familyId/budgets', familyController.createFamilyBudget)
router.get('/:familyId/stats', familyController.getFamilyStats)

export default router
