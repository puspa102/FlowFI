import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User, Mail, Phone, MapPin, DollarSign, Award, Trophy, Target,
  Edit3, Camera, Calendar, Sparkles, Shield, Wallet
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Skeleton from '@/components/ui/Skeleton'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { useGetProfileQuery, useUpdateSettingsMutation } from '@/store/api/profileApi'
import { useGetSavingsGoalsQuery } from '@/store/api/savingsGoalsApi'

const PRESET_AVATARS = [
  { id: 'avatar1', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80', label: 'Tech Leader' },
  { id: 'avatar2', url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80', label: 'Investor' },
  { id: 'avatar3', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80', label: 'Strategist' },
  { id: 'avatar4', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80', label: 'Entrepreneur' },
  { id: 'avatar5', url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=150&q=80', label: 'Creator' },
  { id: 'avatar6', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80', label: 'Executive' },
  { id: 'avatar7', url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80', label: 'Analyst' },
  { id: 'avatar8', url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80', label: 'Adviser' },
]

export default function Profile() {
  const { data: profile, isLoading, isError, refetch } = useGetProfileQuery(undefined)
  const { data: savingsData } = useGetSavingsGoalsQuery(undefined)
  const [updateSettings, { isLoading: isSaving }] = useUpdateSettingsMutation()

  const [isEditing, setIsEditing] = useState(false)
  const [showAvatarPicker, setShowAvatarPicker] = useState(false)
  const [avatar, setAvatar] = useState('https://i.pravatar.cc/150?u=a042581f4e29026704d')

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    country: '',
    currency: 'USD',
  })

  // Load avatar from localStorage on mount
  useEffect(() => {
    const savedAvatar = localStorage.getItem('flofi_user_avatar')
    if (savedAvatar) {
      setAvatar(savedAvatar)
    }
  }, [])

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

  const handleSelectAvatar = (url: string) => {
    setAvatar(url)
    localStorage.setItem('flofi_user_avatar', url)
    setShowAvatarPicker(false)
    // Dispatch custom event to notify topbar immediately
    window.dispatchEvent(new Event('flofi_avatar_updated'))
  }

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
                    {avatar ? (
                      <img src={avatar} alt="Profile Preset" className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300" />
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
                  Pro Wealth Manager
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
                        {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'June 2026'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-left">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[var(--info-light)] text-[var(--info)]">
                      <Wallet size={16} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] uppercase tracking-wider font-bold text-[var(--muted-foreground)]">System Base Currency</p>
                      <p className="text-sm font-semibold text-[var(--foreground)]">{formData.currency} ({formData.currency === 'USD' ? '$' : formData.currency === 'EUR' ? '€' : '₨'})</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Premium Wealth Score Circle */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-3xl border border-[var(--border)] p-6 bg-[var(--card)] shadow-md flex items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <p className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">FloFi Financial Score</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-[var(--foreground)]">795</span>
                  <span className="text-xs font-bold text-[var(--success)]">/ 850</span>
                </div>
                <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                  Excellent score! You have strong savings habits and a highly optimized cashflow system.
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
                    strokeDashoffset={2 * Math.PI * 32 * (1 - 795 / 850)}
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
                          value={`${formData.currency} (${formData.currency === 'USD' ? '$' : formData.currency === 'EUR' ? '€' : '₨'})`}
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

      {/* Preset Avatar Selection Dialog/Modal */}
      <AnimatePresence>
        {showAvatarPicker && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAvatarPicker(false)}
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
                  <Sparkles className="text-[var(--primary)]" size={18} />
                  Choose Profile Preset
                </h3>
                <p className="text-xs text-[var(--muted-foreground)] mt-1">
                  Select one of our stunning Unsplash portrait creations to represent your Wealth Identity.
                </p>
              </div>

              {/* Grid */}
              <div className="grid grid-cols-4 gap-4">
                {PRESET_AVATARS.map((preset) => (
                  <motion.button
                    key={preset.id}
                    onClick={() => handleSelectAvatar(preset.url)}
                    className="flex flex-col items-center gap-1 text-center relative group focus:outline-none"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className={`w-14 h-14 rounded-full overflow-hidden border-2 ${avatar === preset.url ? 'border-[var(--primary)] scale-105 shadow-md' : 'border-transparent group-hover:border-[var(--primary)]/30'}`}>
                      <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                    </div>
                    <span className="text-[10px] text-[var(--muted-foreground)] font-semibold truncate w-full mt-1">{preset.label}</span>
                  </motion.button>
                ))}
              </div>

              <div className="flex justify-end gap-2 border-t border-[var(--border)] pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowAvatarPicker(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold"
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </DashboardLayout>
  )
}
