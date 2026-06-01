import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Skeleton from '@/components/ui/Skeleton'
import DashboardLayout from '@/components/layout/DashboardLayout'
import ThemeCustomizer from '@/components/settings/ThemeCustomizer'
import { useGetProfileQuery, useUpdateSettingsMutation } from '@/store/api/profileApi'

type UserSettings = {
  fullName: string
  email: string
  phone?: string
  country?: string
  currency: string
  twoFactorEnabled: boolean
  notifications: {
    email: boolean
    push: boolean
    sms: boolean
  }
}

const defaultSettings: UserSettings = {
  fullName: '',
  email: '',
  phone: '',
  country: '',
  currency: 'USD',
  twoFactorEnabled: false,
  notifications: { email: true, push: true, sms: false },
}

export default function Settings() {
  const { data: profile, isLoading, isError } = useGetProfileQuery(undefined)
  const [updateSettings, { isLoading: isSaving }] = useUpdateSettingsMutation()

  const [settings, setSettings] = useState<UserSettings>(defaultSettings)
  const [hasChanges, setHasChanges] = useState(false)
  
  useEffect(() => {
    // Only set settings if there are no unsaved changes, 
    // this avoids the strict mode double-render overriding in-progress edits
    if (profile && !hasChanges) {
      setSettings({
        fullName: profile.fullName ?? '',
        email: profile.email ?? '',
        phone: profile.phone ?? '',
        country: profile.country ?? '',
        currency: profile.currency ?? 'USD',
        twoFactorEnabled: profile.twoFactorEnabled ?? false,
        notifications: profile.notifications ?? { email: true, push: true, sms: false },
      })
    }
  }, [profile, hasChanges, setSettings])

  const profileInitials = settings.fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || 'U'

  const handleInputChange = (field: keyof UserSettings, value: string | boolean) => {
    setSettings((prev) => ({ ...prev, [field]: value }))
    setHasChanges(true)
  }

  const handleNotificationChange = (type: keyof UserSettings['notifications']) => {
    setSettings((prev) => ({
      ...prev,
      notifications: { ...prev.notifications, [type]: !prev.notifications[type] },
    }))
    setHasChanges(true)
  }

  const handleSaveSettings = async () => {
    await updateSettings({
      fullName: settings.fullName,
      email: settings.email,
      phone: settings.phone,
      country: settings.country,
      currency: settings.currency,
      twoFactorEnabled: settings.twoFactorEnabled,
      notificationEmail: settings.notifications.email,
      notificationPush: settings.notifications.push,
      notificationSms: settings.notifications.sms,
    })
    setHasChanges(false)
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-4 w-72" />
          <Skeleton className="h-64 rounded-lg" />
        </div>
      </DashboardLayout>
    )
  }

  if (isError) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Failed to load profile settings.</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <header className="space-y-2">
        <h1 className="text-[26px] font-semibold" style={{ color: 'var(--foreground)' }}>Settings</h1>
        <p className="max-w-2xl text-sm" style={{ color: 'var(--muted-foreground)' }}>Manage your account preferences, security, and appearance settings.</p>
      </header>

      <div className="space-y-8">
        <ThemeCustomizer />

        <div className="grid gap-8 xl:grid-cols-[1.5fr_0.75fr]">
          <div className="space-y-6">
            <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-[var(--radius-lg)] p-6" style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)' }}>
              <div className="mb-5">
                <h2 className="text-[15px] font-semibold" style={{ color: 'var(--foreground)' }}>Profile Information</h2>
                <p className="mt-1 text-xs" style={{ color: 'var(--muted-foreground)' }}>Update your personal information</p>
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                {[
                  { label: 'Full Name', field: 'fullName' as const, type: 'text', value: settings.fullName },
                  { label: 'Email', field: 'email' as const, type: 'email', value: settings.email },
                  { label: 'Phone', field: 'phone' as const, type: 'tel', value: settings.phone || '' },
                  { label: 'Country', field: 'country' as const, type: 'text', value: settings.country || '' },
                ].map((item) => (
                  <div key={item.field} className="space-y-1.5">
                    <label className="block text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>{item.label}</label>
                    <Input
                      type={item.type}
                      value={item.value}
                      onChange={(event) => handleInputChange(item.field, event.target.value)}
                      className="rounded-md"
                      style={{ background: 'var(--surface-sunken)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                    />
                  </div>
                ))}
              </div>
            </motion.section>

            <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="rounded-[var(--radius-lg)] p-6" style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)' }}>
              <div className="mb-5">
                <h2 className="text-base font-semibold" style={{ color: 'var(--foreground)' }}>Preferences</h2>
              </div>
              <div className="flex items-center justify-between gap-4 rounded-2xl p-4" style={{ border: '1px solid var(--border)', background: 'var(--surface-sunken)' }}>
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>Currency</p>
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Set your preferred currency</p>
                </div>
                <select
                  value={settings.currency}
                  onChange={(event) => handleInputChange('currency', event.target.value)}
                  className="rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2"
                  style={{ background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                >
                  <option value="USD">USD ($)</option><option value="EUR">EUR</option><option value="GBP">GBP</option><option value="JPY">JPY</option><option value="NPR">NPR</option><option value="CAD">CAD</option><option value="AUD">AUD</option>
                </select>
              </div>
            </motion.section>

            <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-[var(--radius-lg)] p-6" style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)' }}>
              <div className="mb-5">
                <h2 className="text-base font-semibold" style={{ color: 'var(--foreground)' }}>Notifications</h2>
              </div>
              <div className="space-y-3">
                {[
                  { key: 'email' as const, label: 'Email Notifications', desc: 'Receive updates via email' },
                  { key: 'push' as const, label: 'Push Notifications', desc: 'Receive push alerts on device' },
                  { key: 'sms' as const, label: 'SMS Notifications', desc: 'Receive text message alerts' },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between rounded-2xl p-4" style={{ border: '1px solid var(--border)', background: 'var(--surface-sunken)' }}>
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>{item.label}</p>
                      <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{item.desc}</p>
                    </div>
                    <button
                      onClick={() => handleNotificationChange(item.key)}
                      className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors"
                      style={{ background: settings.notifications[item.key] ? 'var(--primary)' : 'var(--border)' }}
                    >
                      <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${settings.notifications[item.key] ? 'translate-x-5' : 'translate-x-0.5'} translate-y-0.5`} />
                    </button>
                  </div>
                ))}
              </div>
            </motion.section>

            <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="rounded-[var(--radius-lg)] p-6" style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)' }}>
              <div className="mb-5">
                <h2 className="text-base font-semibold" style={{ color: 'var(--foreground)' }}>Security</h2>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-2xl p-4" style={{ border: '1px solid var(--border)', background: 'var(--surface-sunken)' }}>
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>Two-Factor Authentication</p>
                    <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Extra security layer</p>
                  </div>
                  <button
                    onClick={() => handleInputChange('twoFactorEnabled', !settings.twoFactorEnabled)}
                    className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors"
                    style={{ background: settings.twoFactorEnabled ? 'var(--primary)' : 'var(--border)' }}
                  >
                    <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${settings.twoFactorEnabled ? 'translate-x-5' : 'translate-x-0.5'} translate-y-0.5`} />
                  </button>
                </div>
                <Button variant="outline" className="w-full">Change Password</Button>
              </div>
            </motion.section>
          </div>

          <div className="space-y-5">
            <div className="rounded-[var(--radius-lg)] p-5" style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)' }}>
              <h3 className="mb-4 text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Profile</h3>
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl text-sm font-semibold" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                  {profileInitials}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-base font-semibold" style={{ color: 'var(--foreground)' }}>{settings.fullName || 'User'}</p>
                  <p className="truncate text-sm" style={{ color: 'var(--muted-foreground)' }}>{settings.email}</p>
                </div>
              </div>
            </div>

            <div className="rounded-[var(--radius-lg)] p-5" style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)' }}>
              <h3 className="mb-4 text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Account Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Plan</span>
                  <Badge className="border-0" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>Pro</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Status</span>
                  <Badge className="border-0" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>Active</Badge>
                </div>
              </div>
            </div>

            <div className="rounded-[var(--radius-lg)] p-5" style={{ background: 'var(--card)', border: '1px solid rgba(255,107,107,0.2)', boxShadow: 'var(--shadow-card)' }}>
              <h3 className="mb-3 text-sm font-semibold" style={{ color: 'var(--danger)' }}>Danger Zone</h3>
              <Button variant="destructive" className="w-full text-xs">Delete Account</Button>
            </div>
          </div>
        </div>
      </div>

      {hasChanges && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 gap-3 rounded-full px-6 py-3 shadow-elevated backdrop-blur-xl"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <Button variant="outline" size="sm" onClick={() => { setSettings(profile ?? defaultSettings); setHasChanges(false) }}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSaveSettings} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </motion.div>
      )}
    </DashboardLayout>
  )
}
