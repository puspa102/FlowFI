import express from 'express'
import {
  googleCallback,
  googleLogin,
  login,
  passwordStrength,
  privacyPolicy,
  register,
  termsOfService,
} from '../controller/authController'

const router = express.Router()

router.post('/register', register)
router.post('/login', login)
router.get('/auth/google', googleLogin)
router.get('/auth/google/callback', googleCallback)
router.get('/terms-of-service', termsOfService)
router.get('/privacy-policy', privacyPolicy)
router.post('/password-strength', passwordStrength)

export default router
