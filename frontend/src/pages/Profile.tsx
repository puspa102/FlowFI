import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User, Mail, Phone, MapPin, DollarSign, Award, Trophy, Target,
  Edit3, Camera, Calendar, Sparkles, Shield, Wallet, Upload, ImagePlus, X, CheckCircle2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Skeleton from '@/components/ui/Skeleton'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { useGetProfileQuery, useUpdateSettingsMutation, useUploadAvatarMutation } from '@/store/api/profileApi'
import { useGetSavingsGoalsQuery } from '@/store/api/savingsGoalsApi'

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001'

export default function Profile() {
  const { data: profile, isLoading, isError, refetch } = useGetProfileQuery(undefined)
  const { data: savingsData } = useGetSavingsGoalsQuery(undefined)
  const [updateSettings, { isLoading: isSaving }] = useUpdateSettingsMutation()
  const [uploadAvatar, { isLoading: isUploading }] = useUploadAvatarMutation()

  const [isEditing, setIsEditing] = useState(false)
  const [showAvatarPicker, setShowAvatarPicker] = useState(false)
  const [uploadPreview, setUploadPreview] = useState<string | null>(null)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    country: '',
    currency: 'USD',
  })

  // Sync profile details when loaded
  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.fullName || '',
        phone: profile.phone || '',
        country: profile.country || '',
        currency: profile.currency || 'USD',
      })
    }
  }, [profile])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSaveProfile = async () => {
    try {
      await updateSettings({
        fullName: formData.fullName,
        phone: formData.phone,
        country: formData.country,
        currency: formData.currency,
        notificationEmail: profile?.notifications?.email ?? true,
        notificationPush: profile?.notifications?.push ?? true,
        notificationSms: profile?.notifications?.sms ?? false,
        twoFactorEnabled: profile?.twoFactorEnabled ?? false,
      }).unwrap()
      setIsEditing(false)
      refetch()
    } catch (err) {
      console.error('Failed to save profile settings:', err)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      alert('Please select a JPEG, PNG, WebP, or GIF image.')
      return
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be under 5MB.')
      return
    }

    setUploadFile(file)
    const reader = new FileReader()
    reader.onloadend = () => {
      setUploadPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleUploadAvatar = async () => {
    if (!uploadFile) return
    try {
      const formData = new FormData()
      formData.append('avatar', uploadFile)
      await uploadAvatar(formData).unwrap()
      setUploadPreview(null)
      setUploadFile(null)
      setShowAvatarPicker(false)
      setUploadSuccess(true)
      refetch()
      // Notify topbar to refresh avatar
      window.dispatchEvent(new Event('flofi_avatar_updated'))
      setTimeout(() => setUploadSuccess(false), 3000)
    } catch (err) {
      console.error('Failed to upload avatar:', err)
    }
  }

  const handleClearPreview = () => {
    setUploadPreview(null)
    setUploadFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // Resolve avatar URL
  const avatarUrl = profile?.profileImage
    ? `${API_BASE}${profile.profileImage}`
    : null

  const initials = formData.fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || 'U'

  // Dynamic calculations for achievements/gamification
  const totalSavingsGoalPercent = savingsData && savingsData.length > 0
    ? Math.round(savingsData.reduce((acc: number, curr: any) => acc + (curr.progressPercent || 0), 0) / savingsData.length)
    : 0

  const hasHighSavingsProgress = totalSavingsGoalPercent > 50
  const hasMultipleAccounts = (profile?.accountCount || 0) >= 3

  // Compute a simple financial health score from real data
  const computedScore = (() => {
    let score = 400 // base
    if (profile?.accountCount) score += Math.min(profile.accountCount * 50, 150)
    if (totalSavingsGoalPercent > 0) score += Math.round(totalSavingsGoalPercent * 2)
    if (hasMultipleAccounts) score += 50
    return Math.min(score, 850)
  })()

  const scoreLabel = computedScore >= 750 ? 'Excellent' : computedScore >= 600 ? 'Good' : computedScore >= 450 ? 'Fair' : 'Building'
  const scoreDescription = computedScore >= 750
    ? 'Outstanding financial habits! Your savings and accounts show strong diversification.'
    : computedScore >= 600
      ? 'Solid progress! Keep growing your savings goals and connecting accounts.'
      : computedScore >= 450
        ? 'You\'re on the right track. Set more goals and track your spending to improve.'
        : 'Getting started! Connect accounts and create savings goals to build your score.'

  // Determine membership tier from real data
  const memberTier = profile?.accountCount >= 3 && totalSavingsGoalPercent > 50
    ? 'Pro Wealth Manager'
    : profile?.accountCount >= 1
      ? 'Active Member'
      : 'New Member'

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6 max-w-6xl mx-auto">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-4 w-72" />
          <div className="grid gap-8 md:grid-cols-3">
            <Skeleton className="h-96 md:col-span-1 rounded-xl" />
            <Skeleton className="h-96 md:col-span-2 rounded-xl" />
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (isError) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-sm text-[var(--danger)] font-medium">Failed to load profile. Please refresh or try again.</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8 pb-10">

        {/* Upload Success Toast */}
        <AnimatePresence>
          {uploadSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-6 right-6 z-[100] flex items-center gap-3 bg-[var(--success)] text-white px-5 py-3 rounded-2xl shadow-xl"
            >
              <CheckCircle2 size={18} />
              <span className="text-sm font-semibold">Profile photo updated successfully!</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight font-display text-[var(--foreground)]">User Profile</h1>
            <p className="text-sm text-[var(--muted-foreground)]">
              View your stats, update your primary preferences, and manage your wealth achievements.
            </p>
          </div>

          <div className="flex gap-3">
            {!isEditing ? (
              <Button
                onClick={() => setIsEditing(true)}
                className="rounded-xl flex items-center gap-2 px-5 py-2.5 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white transition-all shadow-md font-semibold text-xs"
              >
                <Edit3 size={15} />
                Edit Profile
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false)
                    if (profile) {
                      setFormData({
                        fullName: profile.fullName || '',
                        phone: profile.phone || '',
                        country: profile.country || '',
                        currency: profile.currency || 'USD',
                      })
                    }
                  }}
                  className="rounded-xl px-5 text-xs font-semibold"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="rounded-xl px-5 text-xs font-semibold bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white flex items-center gap-2"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3 items-start">

          {/* Left Column: Portrait and High-Level Card */}
          <div className="space-y-6 lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl border border-[var(--border)] overflow-hidden relative shadow-lg text-center p-8 bg-[var(--card)]"
            >
              {/* Background gradient design */}
              <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-tr from-[rgba(0,181,175,0.15)] to-[rgba(49,127,123,0.05)] border-b border-[var(--border)]"></div>

              <div className="relative mt-8 flex flex-col items-center">
                {/* Avatar Circle */}
                <div className="relative group cursor-pointer mb-5" onClick={() => setShowAvatarPicker(true)}>
                  <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-md relative bg-[var(--primary-light)] flex items-center justify-center">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300" />
                    ) : (
                      <span className="text-3xl font-extrabold text-[var(--primary)]">{initials}</span>
                    )}
                  </div>
                  <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Camera size={24} className="text-white" />
                  </div>
                  <motion.div
                    className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[var(--primary)] text-white flex items-center justify-center shadow-lg border-2 border-white"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Edit3 size={12} />
                  </motion.div>
                </div>

                <h2 className="text-xl font-bold font-display text-[var(--foreground)] mt-2">{formData.fullName || 'User'}</h2>
                <Badge className="mt-1.5 px-3 py-1 font-semibold rounded-full border-0 text-xs bg-[var(--success-light)] text-[var(--success)]">
                  {memberTier}
                </Badge>

                <div className="w-full border-t border-[var(--border)] my-6"></div>

                <div className="w-full space-y-4">
                  <div className="flex items-center gap-3 text-left">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[var(--info-light)] text-[var(--info)]">
                      <Mail size={16} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] uppercase tracking-wider font-bold text-[var(--muted-foreground)]">Email Address</p>
                      <p className="text-sm font-semibold truncate text-[var(--foreground)]">{profile?.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-left">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[var(--info-light)] text-[var(--info)]">
                      <Calendar size={16} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] uppercase tracking-wider font-bold text-[var(--muted-foreground)]">Joined FloFi</p>
                      <p className="text-sm font-semibold text-[var(--foreground)]">
                        {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '—'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-left">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[var(--info-light)] text-[var(--info)]">
                      <Wallet size={16} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] uppercase tracking-wider font-bold text-[var(--muted-foreground)]">System Base Currency</p>
                      <p className="text-sm font-semibold text-[var(--foreground)]">{formData.currency} ({formData.currency === 'USD' ? '$' : formData.currency === 'EUR' ? '€' : formData.currency === 'GBP' ? '£' : formData.currency === 'JPY' ? '¥' : formData.currency === 'NPR' ? '₨' : '$'})</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Financial Health Score — computed from real data */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-3xl border border-[var(--border)] p-6 bg-[var(--card)] shadow-md flex items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <p className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">FloFi Financial Score</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-[var(--foreground)]">{computedScore}</span>
                  <span className="text-xs font-bold text-[var(--success)]">/ 850</span>
                </div>
                <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                  {scoreLabel} — {scoreDescription}
                </p>
              </div>
              <div className="relative shrink-0 w-20 h-20 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="40" cy="40" r="32" stroke="var(--border)" strokeWidth="6" fill="transparent" />
                  <circle
                    cx="40"
                    cy="40"
                    r="32"
                    stroke="var(--primary)"
                    strokeWidth="6"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 32}
                    strokeDashoffset={2 * Math.PI * 32 * (1 - computedScore / 850)}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles size={18} className="text-[var(--primary)]" />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Editable Forms & Detailed Achievements */}
          <div className="space-y-6 lg:col-span-2">

            {/* Profile Forms Card */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
            >
              <Card className="rounded-3xl border border-[var(--border)] shadow-md overflow-hidden bg-[var(--card)]">
                <CardHeader className="border-b border-[var(--border)] pb-5 px-6">
                  <CardTitle className="text-lg font-bold font-display">Personal Details</CardTitle>
                  <CardDescription>
                    {isEditing ? 'Make edits to your primary credentials and personal contact preferences below.' : 'View your current contact coordinates and preferences.'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-[var(--muted-foreground)] flex items-center gap-1.5">
                        <User size={13} className="text-[var(--primary)]" />
                        Full Name
                      </label>
                      <Input
                        type="text"
                        disabled={!isEditing}
                        value={formData.fullName}
                        onChange={(e) => handleInputChange('fullName', e.target.value)}
                        className={`rounded-xl border border-[rgba(26,43,60,0.12)] ${isEditing ? 'bg-[var(--background)] shadow-inner' : 'bg-transparent border-transparent disabled:opacity-100 disabled:cursor-default px-4'}`}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-[var(--muted-foreground)] flex items-center gap-1.5">
                        <Phone size={13} className="text-[var(--primary)]" />
                        Phone Number
                      </label>
                      <Input
                        type="tel"
                        disabled={!isEditing}
                        value={formData.phone}
                        placeholder={isEditing ? 'Enter phone number' : 'Not Provided'}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className={`rounded-xl border border-[rgba(26,43,60,0.12)] ${isEditing ? 'bg-[var(--background)] shadow-inner' : 'bg-transparent border-transparent disabled:opacity-100 disabled:cursor-default px-4'}`}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-[var(--muted-foreground)] flex items-center gap-1.5">
                        <MapPin size={13} className="text-[var(--primary)]" />
                        Country
                      </label>
                      <Input
                        type="text"
                        disabled={!isEditing}
                        value={formData.country}
                        placeholder={isEditing ? 'Enter country' : 'Not Provided'}
                        onChange={(e) => handleInputChange('country', e.target.value)}
                        className={`rounded-xl border border-[rgba(26,43,60,0.12)] ${isEditing ? 'bg-[var(--background)] shadow-inner' : 'bg-transparent border-transparent disabled:opacity-100 disabled:cursor-default px-4'}`}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-[var(--muted-foreground)] flex items-center gap-1.5">
                        <DollarSign size={13} className="text-[var(--primary)]" />
                        Base Currency
                      </label>
                      {isEditing ? (
                        <select
                          value={formData.currency}
                          onChange={(e) => handleInputChange('currency', e.target.value)}
                          className="w-full h-11 px-4 text-sm bg-[var(--background)] rounded-xl border border-[rgba(26,43,60,0.12)] focus:outline-none focus:border-[var(--primary)] focus:shadow-[0_0_0_3px_rgba(0,201,167,0.12)] text-[var(--foreground)]"
                        >
                          <option value="USD">USD ($)</option>
                          <option value="EUR">EUR (€)</option>
                          <option value="GBP">GBP (£)</option>
                          <option value="JPY">JPY (¥)</option>
                          <option value="NPR">NPR (₨)</option>
                          <option value="CAD">CAD ($)</option>
                          <option value="AUD">AUD ($)</option>
                        </select>
                      ) : (
                        <Input
                          type="text"
                          disabled={true}
                          value={`${formData.currency} (${formData.currency === 'USD' ? '$' : formData.currency === 'EUR' ? '€' : formData.currency === 'GBP' ? '£' : '₨'})`}
                          className="rounded-xl bg-transparent border-transparent disabled:opacity-100 disabled:cursor-default px-4"
                        />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Gamification: Wealth Badges Card */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="rounded-3xl border border-[var(--border)] shadow-md overflow-hidden bg-[var(--card)]">
                <CardHeader className="border-b border-[var(--border)] pb-5 px-6">
                  <div className="flex items-center gap-2">
                    <Award className="text-[var(--primary)]" size={20} />
                    <CardTitle className="text-lg font-bold font-display">Wealth Achievements & Badges</CardTitle>
                  </div>
                  <CardDescription>
                    Earn status badges based on your connected financial accounts, goal progress, and family savings patterns.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid gap-6 md:grid-cols-3">

                    {/* Badge 1: Wealth Builder */}
                    <div className="flex flex-col items-center text-center p-5 rounded-2xl border border-[var(--border)] bg-[rgba(0,181,175,0.02)] relative group overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-b from-[rgba(0,181,175,0.05)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3 bg-[var(--primary-light)] text-[var(--primary)] shadow-sm">
                        <Trophy size={20} />
                      </div>
                      <span className="text-xs font-bold text-[var(--foreground)]">Wealth Explorer</span>
                      <p className="text-[10.5px] mt-1 text-[var(--muted-foreground)] leading-snug">
                        Connected accounts or assets. Active wealth tracking enabled.
                      </p>
                      <Badge className="mt-3.5 border-0 font-bold bg-[var(--success-light)] text-[var(--success)] text-[10px] rounded-full px-2 py-0.5">
                        UNLOCKED
                      </Badge>
                    </div>

                    {/* Badge 2: Diligent Saver */}
                    <div className={`flex flex-col items-center text-center p-5 rounded-2xl border relative group overflow-hidden ${hasHighSavingsProgress ? 'border-[var(--primary)] bg-[rgba(0,181,175,0.03)]' : 'border-[var(--border)] bg-transparent opacity-75'}`}>
                      <div className="absolute inset-0 bg-gradient-to-b from-[rgba(49,127,123,0.05)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 shadow-sm ${hasHighSavingsProgress ? 'bg-[var(--primary)] text-white' : 'bg-[var(--border)] text-[var(--muted-foreground)]'}`}>
                        <Target size={20} />
                      </div>
                      <span className="text-xs font-bold text-[var(--foreground)]">Super Saver</span>
                      <p className="text-[10.5px] mt-1 text-[var(--muted-foreground)] leading-snug">
                        Achieved overall average progress exceeding 50% across savings goals.
                      </p>
                      {hasHighSavingsProgress ? (
                        <Badge className="mt-3.5 border-0 font-bold bg-[var(--success-light)] text-[var(--success)] text-[10px] rounded-full px-2 py-0.5">
                          UNLOCKED
                        </Badge>
                      ) : (
                        <span className="text-[10px] font-bold text-[var(--muted-foreground)] mt-3.5 flex items-center gap-1">
                          Locked ({totalSavingsGoalPercent}%)
                        </span>
                      )}
                    </div>

                    {/* Badge 3: Pro Investor */}
                    <div className={`flex flex-col items-center text-center p-5 rounded-2xl border relative group overflow-hidden ${hasMultipleAccounts ? 'border-[var(--primary)] bg-[rgba(0,181,175,0.03)]' : 'border-[var(--border)] bg-transparent opacity-75'}`}>
                      <div className="absolute inset-0 bg-gradient-to-b from-[rgba(49,127,123,0.05)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 shadow-sm ${hasMultipleAccounts ? 'bg-[var(--primary)] text-white' : 'bg-[var(--border)] text-[var(--muted-foreground)]'}`}>
                        <Shield size={20} />
                      </div>
                      <span className="text-xs font-bold text-[var(--foreground)]">Diversified Pro</span>
                      <p className="text-[10.5px] mt-1 text-[var(--muted-foreground)] leading-snug">
                        Connected 3 or more asset channels or checking/savings accounts.
                      </p>
                      {hasMultipleAccounts ? (
                        <Badge className="mt-3.5 border-0 font-bold bg-[var(--success-light)] text-[var(--success)] text-[10px] rounded-full px-2 py-0.5">
                          UNLOCKED
                        </Badge>
                      ) : (
                        <span className="text-[10px] font-bold text-[var(--muted-foreground)] mt-3.5 flex items-center gap-1">
                          Locked ({profile?.accountCount || 0}/3)
                        </span>
                      )}
                    </div>

                  </div>
                </CardContent>
              </Card>
            </motion.div>

          </div>

        </div>

      </div>

      {/* Avatar Upload Modal */}
      <AnimatePresence>
        {showAvatarPicker && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => { setShowAvatarPicker(false); handleClearPreview() }}
              className="fixed inset-0 bg-black z-50 backdrop-blur-sm"
            ></motion.div>

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-x-4 max-w-lg md:mx-auto top-24 bg-[var(--card)] rounded-3xl border border-[var(--border)] p-6 z-50 shadow-2xl flex flex-col gap-5"
            >
              <div>
                <h3 className="text-lg font-bold font-display text-[var(--foreground)] flex items-center gap-2">
                  <ImagePlus className="text-[var(--primary)]" size={20} />
                  Upload Profile Photo
                </h3>
                <p className="text-xs text-[var(--muted-foreground)] mt-1">
                  Choose a photo from your device. Supported formats: JPEG, PNG, WebP, GIF (max 5MB).
                </p>
              </div>

              {/* Upload Area */}
              <div className="flex flex-col items-center gap-4">
                {uploadPreview ? (
                  <div className="relative">
                    <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-[var(--primary)] shadow-lg">
                      <img src={uploadPreview} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                    <button
                      onClick={handleClearPreview}
                      className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-[var(--danger)] text-white flex items-center justify-center shadow-md hover:scale-110 transition-transform"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <label className="w-full cursor-pointer">
                    <div className="border-2 border-dashed border-[var(--border)] rounded-2xl p-8 flex flex-col items-center gap-3 hover:border-[var(--primary)] hover:bg-[rgba(0,181,175,0.02)] transition-all duration-200">
                      <div className="w-16 h-16 rounded-full bg-[var(--primary-light)] text-[var(--primary)] flex items-center justify-center">
                        <Upload size={24} />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-semibold text-[var(--foreground)]">Click to browse files</p>
                        <p className="text-xs text-[var(--muted-foreground)] mt-1">or drag and drop your image here</p>
                      </div>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                  </label>
                )}

                {/* Current avatar preview */}
                {!uploadPreview && avatarUrl && (
                  <div className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl bg-[var(--background)] border border-[var(--border)]">
                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[var(--primary-light)] shrink-0">
                      <img src={avatarUrl} alt="Current" className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-[var(--foreground)]">Current Photo</p>
                      <p className="text-[10px] text-[var(--muted-foreground)]">Upload a new image to replace it</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 border-t border-[var(--border)] pt-4">
                <Button
                  variant="outline"
                  onClick={() => { setShowAvatarPicker(false); handleClearPreview() }}
                  className="rounded-xl px-4 py-2 text-xs font-semibold"
                >
                  Cancel
                </Button>
                {uploadPreview && (
                  <Button
                    onClick={handleUploadAvatar}
                    disabled={isUploading}
                    className="rounded-xl px-5 py-2 text-xs font-semibold bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white flex items-center gap-2"
                  >
                    {isUploading ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload size={14} />
                        Upload Photo
                      </>
                    )}
                  </Button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </DashboardLayout>
  )
}
