import bcrypt from 'bcrypt'
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

  const jwtSecret = process.env.JWT_SECRET
  if (!jwtSecret) {
    return {
      ok: false,
      status: 500,
      error: 'JWT secret is not configured.',
    }
  }

  const token = jwt.sign({ userId: user.id }, jwtSecret, { expiresIn: '1h' })

  return {
    ok: true,
    status: 200,
    message: 'Login successful.',
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