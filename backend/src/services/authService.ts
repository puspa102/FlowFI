import bcrypt from 'bcrypt'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import prisma from '../config/prisma'
import { checkPasswordStrength } from '../utils/passwordStrength'

type RegisterInput = {
  fullName?: string
  firstName?: string
  lastName?: string
  email?: string
  password?: string
  confirmPassword?: string
  termsAccepted?: boolean
}

type LoginInput = {
  email?: string
  password?: string
}

type GoogleTokenResponse = {
  access_token?: string
  id_token?: string
  error?: string
  error_description?: string
}

type GoogleUserInfo = {
  sub?: string
  email?: string
  email_verified?: boolean
  name?: string
}

function getJwtSecret() {
  return process.env.JWT_SECRET
}

function createToken(userId: number) {
  const jwtSecret = getJwtSecret()

  if (!jwtSecret) {
    return null
  }

  return jwt.sign({ userId }, jwtSecret, { expiresIn: '1h' })
}

function getGoogleRedirectUri() {
  const backendUrl = process.env.BACKEND_PUBLIC_URL ?? `http://localhost:${process.env.PORT ?? 3001}`
  return `${backendUrl.replace(/\/$/, '')}/auth/google/callback`
}

export function getGoogleAuthorizationUrl(state?: string) {
  const clientId = process.env.GOOGLE_CLIENT_ID

  if (!clientId) {
    return null
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: getGoogleRedirectUri(),
    response_type: 'code',
    scope: 'email profile openid',
    access_type: 'offline',
    prompt: 'select_account',
  })

  if (state) {
    params.set('state', state)
  }

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
}

export async function registerUser(input: RegisterInput) {
  const resolvedFullName =
    (typeof input.fullName === 'string' && input.fullName.trim()) ||
    [input.firstName, input.lastName].filter((value) => typeof value === 'string' && value.trim()).join(' ')
  const normalizedEmail = typeof input.email === 'string' ? input.email.trim().toLowerCase() : ''
  const password = input.password ?? ''
  const confirmPassword = input.confirmPassword ?? ''

  if (!resolvedFullName || !normalizedEmail || !password || !confirmPassword || !input.termsAccepted) {
    return {
      ok: false,
      status: 400,
      error: 'All fields are required and terms must be accepted.',
    }
  }

  if (password !== confirmPassword) {
    return {
      ok: false,
      status: 400,
      error: 'Passwords do not match.',
    }
  }

  const strength = checkPasswordStrength(password)
  if (strength === 'weak') {
    return {
      ok: false,
      status: 400,
      error: 'Password is too weak. Use a stronger password.',
    }
  }

  const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } })
  if (existingUser) {
    return {
      ok: false,
      status: 400,
      error: 'User already exists.',
    }
  }

  const hashedPassword = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({
    data: {
      fullName: resolvedFullName,
      email: normalizedEmail,
      password: hashedPassword,
      termsAccepted: Boolean(input.termsAccepted),
    },
  })

  const { password: _password, ...safeUser } = user

  return {
    ok: true,
    status: 201,
    message: 'User registered successfully.',
    user: safeUser,
  }
}

export async function loginUser(input: LoginInput) {
  const normalizedEmail = typeof input.email === 'string' ? input.email.trim().toLowerCase() : ''
  const password = input.password ?? ''

  if (!normalizedEmail || !password) {
    return {
      ok: false,
      status: 400,
      error: 'Email and password are required.',
    }
  }

  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } })
  if (!user) {
    return {
      ok: false,
      status: 400,
      error: 'Invalid email or password.',
    }
  }

  const isPasswordValid = await bcrypt.compare(password, user.password)
  if (!isPasswordValid) {
    return {
      ok: false,
      status: 400,
      error: 'Invalid email or password.',
    }
  }

  const token = createToken(user.id)
  if (!token) {
    return {
      ok: false,
      status: 500,
      error: 'JWT secret is not configured.',
    }
  }

  return {
    ok: true,
    status: 200,
    message: 'Login successful.',
    token,
  }
}

export async function loginWithGoogle(code?: string) {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const redirectUri = getGoogleRedirectUri()

  console.log('OAuth callback code', code)
  console.log('Starting Google token exchange')
  console.log('Redirect URI:', redirectUri)
  console.log('OAuth code exists:', !!code)

  if (!clientId || !clientSecret) {
    return {
      ok: false,
      status: 501,
      error: 'Google OAuth credentials are missing. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to backend/.env.',
    }
  }

  if (!code) {
    return {
      ok: false,
      status: 400,
      error: 'Invalid OAuth callback',
    }
  }

  let accessToken = ''

  try {
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    })
    console.log('Google token response status:', tokenResponse.status)
    const tokenData = (await tokenResponse.json()) as GoogleTokenResponse
    console.log('Google token response has access_token:', !!tokenData.access_token)
    console.log('Google token response has id_token:', !!tokenData.id_token)

    if (!tokenResponse.ok) {
      const googleError = tokenData.error_description ?? tokenData.error
      console.error('Google token exchange failed', {
        status: tokenResponse.status,
        error: tokenData.error,
        errorDescription: tokenData.error_description,
      })
      console.error(tokenData)

      return {
        ok: false,
        status: 400,
        error: googleError ? `Google token exchange failed: ${googleError}` : 'Google token exchange failed',
      }
    }

    if (!tokenData.access_token && !tokenData.id_token) {
      console.error('Google token exchange failed', {
        status: tokenResponse.status,
        tokenData,
      })

      return {
        ok: false,
        status: 400,
        error: 'Google token exchange failed.',
      }
    }

    accessToken = tokenData.access_token ?? ''
  } catch (error) {
    console.error('Google token exchange failed', error)
    if (error instanceof Error) {
      console.error('Google token exchange error message:', error.message)
      console.error('Google token exchange error stack:', error.stack)
    }
    if (typeof error === 'object' && error !== null && 'response' in error) {
      const response = (error as { response?: { data?: unknown } }).response
      console.error(response?.data)
    }

    return {
      ok: false,
      status: 500,
      error: error instanceof Error ? `Google token exchange failed: ${error.message}` : 'Google token exchange failed',
    }
  }

  if (!accessToken) {
    return {
      ok: false,
      status: 400,
      error: 'Google token exchange failed.',
    }
  }

  let profile: GoogleUserInfo

  try {
    const profileResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    console.log('Google profile response status:', profileResponse.status)
    profile = (await profileResponse.json()) as GoogleUserInfo
    console.log('Google profile has email:', !!profile.email)
    console.log('Google profile has sub:', !!profile.sub)
    console.log('Google profile has name:', !!profile.name)

    if (!profileResponse.ok) {
      console.error('Missing Google profile', {
        status: profileResponse.status,
        profile,
      })

      return {
        ok: false,
        status: 400,
        error: 'Missing Google profile',
      }
    }
  } catch (error) {
    console.error('Missing Google profile', error)

    return {
      ok: false,
      status: 500,
      error: 'Missing Google profile',
    }
  }

  if (!profile.email || !profile.sub || !profile.name || profile.email_verified === false) {
    console.error('Missing Google profile', {
      hasEmail: !!profile.email,
      hasSub: !!profile.sub,
      hasName: !!profile.name,
      emailVerified: profile.email_verified,
    })

    return {
      ok: false,
      status: 400,
      error: 'Missing Google profile',
    }
  }

  const normalizedEmail = profile.email.trim().toLowerCase()
  const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } })
  let user = existingUser
  console.log('Google user exists:', !!existingUser)

  if (!user) {
    try {
      user = await prisma.user.create({
        data: {
          fullName: profile.name.trim(),
          email: normalizedEmail,
          password: await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 10),
          termsAccepted: true,
        },
      })
      console.log('Google user created:', user.id)
    } catch (error) {
      console.error('User creation failed', error)

      return {
        ok: false,
        status: 500,
        error: 'User creation failed',
      }
    }
  }

  const token = createToken(user.id)
  if (!token) {
    console.error('Google login JWT creation failed: JWT secret is not configured.')

    return {
      ok: false,
      status: 500,
      error: 'JWT secret is not configured.',
    }
  }

  return {
    ok: true,
    status: 200,
    message: 'Google login successful.',
    token,
  }
}

export function getPasswordStrength(password: string) {
  if (!password) {
    return {
      ok: false,
      status: 400,
      error: 'Password is required.',
    }
  }

  return {
    ok: true,
    status: 200,
    strength: checkPasswordStrength(password),
  }
}
