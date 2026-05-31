import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { getAuthToken, apiGet, apiPost } from '../api/client'

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
  fullName: 'Test User',
  email: 'test@example.com',
  phone: '+1 (555) 123-4567',
  country: 'United States',
  currency: 'USD',
  twoFactorEnabled: false,
  notifications: { email: true, push: true, sms: false },
}

export default function Settings() {
  const navigate = useNavigate()
  const [settings, setSettings] = useState<UserSettings>(defaultSettings)
  const [hasChanges, setHasChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = getAuthToken()
    if (!token) { navigate('/login'); return }
    const fetchProfile = async () => {
      try {
        const response = await apiGet<UserSettings>('/api/accounts/profile')
        if (response.ok && response.data) setSettings(response.data)
      } catch (error) { console.error('Failed to fetch profile:', error) }
      finally { setIsLoading(false) }
    }
    fetchProfile()
  }, [navigate])

  const handleInputChange = (field: keyof UserSettings, value: string | boolean) => {
    setSettings(prev => ({ ...prev, [field]: value }))
    setHasChanges(true)
  }

  const handleNotificationChange = (type: keyof UserSettings['notifications']) => {
    setSettings(prev => ({ ...prev, notifications: { ...prev.notifications, [type]: !prev.notifications[type] } }))
    setHasChanges(true)
  }

  const handleSaveSettings = async () => {
    setIsSaving(true)
    try {
      const response = await apiPost('/api/accounts/settings', {
        fullName: settings.fullName, email: settings.email, phone: settings.phone, country: settings.country,
        currency: settings.currency, twoFactorEnabled: settings.twoFactorEnabled,
        notificationEmail: settings.notifications.email, notificationPush: settings.notifications.push, notificationSms: settings.notifications.sms,
      })
      if (response.ok) setHasChanges(false)
    } catch (error) { console.error('Error saving settings:', error) }
    finally { setIsSaving(false) }
  }

  return (
    <DashboardLayout>
      <header>
        <h1 className="font-display text-4xl italic text-white">Settings</h1>
        <p className="text-sm text-platinum mt-1">Manage your account preferences and security.</p>
      </header>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {/* Profile */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-lg p-6">
              <h2 className="text-base font-semibold text-white mb-1">Profile Information</h2>
              <p className="text-xs text-platinum mb-5">Update your personal information</p>
              <div className="grid gap-5 md:grid-cols-2">
                {[
                  { label: 'Full Name', field: 'fullName' as const, type: 'text', value: settings.fullName },
                  { label: 'Email', field: 'email' as const, type: 'email', value: settings.email },
                  { label: 'Phone', field: 'phone' as const, type: 'tel', value: settings.phone || '' },
                  { label: 'Country', field: 'country' as const, type: 'text', value: settings.country || '' },
                ].map(item => (
                  <div key={item.field} className="space-y-1.5">
                    <label className="block text-xs font-medium text-platinum">{item.label}</label>
                    <Input
                      type={item.type}
                      value={item.value}
                      onChange={(e) => handleInputChange(item.field, e.target.value)}
                      className="bg-white/[0.04] border-white/[0.08] text-white rounded-md focus:border-primary/40 focus:ring-primary/20"
                    />
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Preferences */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass-card rounded-lg p-6">
              <h2 className="text-base font-semibold text-white mb-1">Preferences</h2>
              <p className="text-xs text-platinum mb-5">Customize your platform experience</p>
              <div className="flex items-center justify-between">
                <div><p className="text-sm font-medium text-white">Currency</p><p className="text-xs text-platinum">Set your preferred currency</p></div>
                <select value={settings.currency} onChange={(e) => handleInputChange('currency', e.target.value)} className="rounded-md border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/40">
                  <option value="USD">USD ($)</option><option value="EUR">EUR</option><option value="GBP">GBP</option><option value="JPY">JPY</option><option value="NPR">NPR</option><option value="CAD">CAD</option><option value="AUD">AUD</option>
                </select>
              </div>
            </motion.div>

            {/* Notifications */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card rounded-lg p-6">
              <h2 className="text-base font-semibold text-white mb-1">Notifications</h2>
              <p className="text-xs text-platinum mb-5">Manage how you receive updates</p>
              <div className="space-y-3">
                {[
                  { key: 'email' as const, label: 'Email Notifications', desc: 'Receive updates via email' },
                  { key: 'push' as const, label: 'Push Notifications', desc: 'Receive push alerts on device' },
                  { key: 'sms' as const, label: 'SMS Notifications', desc: 'Receive text message alerts' },
                ].map(item => (
                  <div key={item.key} className="flex items-center justify-between rounded-md border border-white/[0.04] bg-white/[0.02] p-4">
                    <div><p className="text-sm font-medium text-white">{item.label}</p><p className="text-xs text-platinum">{item.desc}</p></div>
                    <button
                      onClick={() => handleNotificationChange(item.key)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors ${settings.notifications[item.key] ? 'bg-primary' : 'bg-white/[0.12]'}`}
                    >
                      <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${settings.notifications[item.key] ? 'translate-x-5' : 'translate-x-0.5'} translate-y-0.5`} />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Security */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card rounded-lg p-6">
              <h2 className="text-base font-semibold text-white mb-1">Security</h2>
              <p className="text-xs text-platinum mb-5">Manage your account security</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-md border border-white/[0.04] bg-white/[0.02] p-4">
                  <div><p className="text-sm font-medium text-white">Two-Factor Authentication</p><p className="text-xs text-platinum">Extra security layer</p></div>
                  <button
                    onClick={() => handleInputChange('twoFactorEnabled', !settings.twoFactorEnabled)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors ${settings.twoFactorEnabled ? 'bg-primary' : 'bg-white/[0.12]'}`}
                  >
                    <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${settings.twoFactorEnabled ? 'translate-x-5' : 'translate-x-0.5'} translate-y-0.5`} />
                  </button>
                </div>
                <Button variant="outline" className="w-full">Change Password</Button>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5 lg:col-span-1">
            <div className="glass-card rounded-lg p-5">
              <h3 className="text-sm font-semibold text-white mb-4">Account Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between"><span className="text-xs text-platinum">Plan</span><Badge className="bg-primary/10 text-primary border-0">Pro</Badge></div>
                <div className="flex items-center justify-between"><span className="text-xs text-platinum">Status</span><Badge className="bg-primary/10 text-primary border-0">Active</Badge></div>
                <div className="border-t border-white/[0.06] pt-3"><p className="text-xs text-platinum">Member since November 2024</p></div>
              </div>
            </div>

            <div className="glass-card rounded-lg p-5">
              <h3 className="text-sm font-semibold text-white mb-3">API Keys</h3>
              <Button variant="outline" className="w-full text-xs">Generate New Key</Button>
            </div>

            <div className="glass-card rounded-lg p-5 border-coral/20">
              <h3 className="text-sm font-semibold text-coral mb-3">Danger Zone</h3>
              <Button variant="destructive" className="w-full text-xs">Delete Account</Button>
            </div>
          </div>
        </div>
      )}

      {/* Save Bar */}
      {hasChanges && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 flex gap-3 bg-navy-800 border border-white/[0.08] rounded-lg px-6 py-3 shadow-elevated z-50"
        >
          <Button variant="outline" size="sm" onClick={() => { setSettings(defaultSettings); setHasChanges(false) }}>Cancel</Button>
          <Button size="sm" onClick={handleSaveSettings} disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Changes'}</Button>
        </motion.div>
      )}
    </DashboardLayout>
  )
}
