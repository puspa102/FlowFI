import express from 'express'
import * as bankAccountController from '../controller/bankAccountController'

const router = express.Router()

router.get('/', bankAccountController.getAll)
router.get('/summary', bankAccountController.getSummary)
router.get('/transfers', bankAccountController.getTransfers)
router.get('/:id', bankAccountController.getById)
router.post('/', bankAccountController.create)
router.post('/transfer', bankAccountController.transfer)
router.put('/:id', bankAccountController.update)
router.delete('/:id', bankAccountController.remove)

export default router
