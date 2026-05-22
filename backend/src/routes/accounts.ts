import express from 'express'
import { listAccounts, getProfile, updateSettings } from '../controller/accountController'

const router = express.Router()

router.get('/', listAccounts)
router.get('/profile', getProfile)
router.post('/settings', updateSettings)
router.put('/settings', updateSettings)

export default router
