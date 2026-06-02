import prisma from '../config/prisma'
import fs from 'fs'
import path from 'path'

export async function getAccounts(userId: number) {
  const accounts = await prisma.account.findMany({ where: { userId }, orderBy: { createdAt: 'asc' } })

  return accounts.map((account) => ({
    id: account.id,
    name: account.name,
    type: account.type,
    balance: Number(account.balance),
    currency: account.currency,
    last4: account.last4,
  }))
}

export async function getUserProfile(userId: number) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { accounts: true },
  })

  if (!user) {
    throw new Error('User not found')
  }

  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName ?? '',
    phone: user.phone ?? '',
    country: user.country ?? '',
    currency: user.currency ?? 'USD',
    profileImage: user.profileImage ?? null,
    twoFactorEnabled: user.twoFactorEnabled ?? false,
    notifications: {
      email: user.notificationEmail ?? true,
      push: user.notificationPush ?? true,
      sms: user.notificationSms ?? false,
    },
    accountCount: user.accounts.length,
    createdAt: user.createdAt,
  }
}

export async function updateUserSettings(userId: number, settings: {
  fullName?: string
  phone?: string
  country?: string
  currency?: string
  twoFactorEnabled?: boolean
  notificationEmail?: boolean
  notificationPush?: boolean
  notificationSms?: boolean
}) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      fullName: settings.fullName,
      phone: settings.phone,
      country: settings.country,
      currency: settings.currency,
      twoFactorEnabled: settings.twoFactorEnabled,
      notificationEmail: settings.notificationEmail,
      notificationPush: settings.notificationPush,
      notificationSms: settings.notificationSms,
    },
  })

  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName ?? '',
    phone: user.phone ?? '',
    country: user.country ?? '',
    currency: user.currency ?? 'USD',
    twoFactorEnabled: user.twoFactorEnabled ?? false,
    notifications: {
      email: user.notificationEmail ?? true,
      push: user.notificationPush ?? true,
      sms: user.notificationSms ?? false,
    },
  }
}

export async function uploadProfileImage(userId: number, filePath: string) {
  // Get the current user to check if they have an existing profile image
  const currentUser = await prisma.user.findUnique({ where: { id: userId } })

  // Delete old profile image file if it exists
  if (currentUser?.profileImage) {
    const oldFilePath = path.join(__dirname, '../../uploads/avatars', path.basename(currentUser.profileImage))
    if (fs.existsSync(oldFilePath)) {
      fs.unlinkSync(oldFilePath)
    }
  }

  // Store relative URL path for serving
  const imageUrl = `/uploads/avatars/${path.basename(filePath)}`

  const user = await prisma.user.update({
    where: { id: userId },
    data: { profileImage: imageUrl },
  })

  return {
    profileImage: user.profileImage,
  }
}
