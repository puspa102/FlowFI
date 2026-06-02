import express from 'express'
import { listAccounts, getProfile, updateSettings, uploadAvatarImage } from '../controller/accountController'
import { uploadAvatar } from '../middleware/upload'

const router = express.Router()

router.get('/', listAccounts)
router.get('/profile', getProfile)
router.post('/settings', updateSettings)
router.put('/settings', updateSettings)
router.post('/profile/avatar', uploadAvatar.single('avatar'), uploadAvatarImage as any)

export default router
