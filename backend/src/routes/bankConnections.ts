import express from 'express'
import * as bankController from '../controller/bankConnectionController'

const router = express.Router()

router.get('/liquidity', bankController.getNetLiquidity)
router.post('/sync', bankController.syncBankAccounts)
router.get('/', bankController.getBankConnections)
router.post('/', bankController.addBankConnection)
router.put('/:id', bankController.updateBankConnection)
router.delete('/:id', bankController.removeBankConnection)

export default router
