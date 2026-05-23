import express from 'express'
import { createTransaction, listTransactions, editTransaction, removeTransaction } from '../controller/transactionController'

const router = express.Router()

router.get('/', listTransactions)
router.post('/', createTransaction)
router.put('/:id', editTransaction)
router.delete('/:id', removeTransaction)

export default router

