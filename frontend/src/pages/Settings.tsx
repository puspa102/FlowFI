import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { clearAuthToken, getAuthToken, apiGet, apiPost } from '../api/client'

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
  notifications: {
    email: true,
    push: true,
    sms: false,
  },
}

export default function Settings() {
  const navigate = useNavigate()
  const [settings, setSettings] = useState<UserSettings>(defaultSettings)
  const [hasChanges, setHasChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = getAuthToken()
    if (!token) {
      navigate('/login')
      return
    }

    // Fetch user profile
    const fetchProfile = async () => {
      try {
        const response = await apiGet<UserSettings>('/api/accounts/profile')
        if (response.ok && response.data) {
          setSettings(response.data)
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [navigate])

  const handleInputChange = (field: keyof UserSettings, value: string | boolean) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }))
    setHasChanges(true)
  }

  const handleNotificationChange = (type: keyof UserSettings['notifications']) => {
    setSettings((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [type]: !prev.notifications[type],
      },
    }))
    setHasChanges(true)
  }

  const handleSaveSettings = async () => {
    setIsSaving(true)
    try {
      const response = await apiPost('/api/accounts/settings', {
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

      if (response.ok) {
        setHasChanges(false)
        console.log('Settings saved successfully')
      } else {
        console.error('Failed to save settings:', response.data)
      }
    } catch (error) {
      console.error('Error saving settings:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleLogout = () => {
    clearAuthToken()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-slate-900">
      <div className="grid min-h-screen lg:grid-cols-[260px_1fr]">
        {/* Sidebar */}
        <aside className="flex flex-col gap-6 bg-slate-950 px-6 py-8 text-white">
          <div>
            <div className="text-lg font-semibold">FloFi Pro</div>
            <span className="text-xs uppercase tracking-[0.25em] text-slate-400">AI Wealth Management</span>
          </div>
          <nav className="space-y-2 text-sm text-slate-300">
            <Link className="block rounded-full px-4 py-2 transition hover:bg-white/10" to="/dashboard">
              Dashboard
            </Link>
            <Link className="block rounded-full px-4 py-2 transition hover:bg-white/10" to="/transactions">
              Transactions
            </Link>
            <Link className="block rounded-full px-4 py-2 transition hover:bg-white/10" to="/ai-assistant">
              AI Assistant
            </Link>
            <Link className="block rounded-full px-4 py-2 transition hover:bg-white/10" to="/budgets">
              Portfolio
            </Link>
            <Link className="block rounded-full bg-white/10 px-4 py-2 text-white" to="/settings">
              Settings
            </Link>
          </nav>
          <Button variant="secondary" className="mt-auto w-full rounded-full bg-white/10 text-white hover:bg-white/20">
            Upgrade to Plus
          </Button>
          <div className="text-xs text-slate-400">
            <a className="block" href="#support">
              Support
            </a>
            <button onClick={handleLogout} className="block text-left hover:text-white transition">
              Logout
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="space-y-8 px-6 py-10 lg:px-10">
          <header className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Account</p>
            <h1 className="text-3xl font-semibold md:text-4xl">Settings</h1>
            <p className="max-w-2xl text-sm text-slate-600 md:text-base">
              Manage your account preferences, security settings, and notification preferences.
            </p>
          </header>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-primary"></div>
                <p className="mt-4 text-sm text-slate-600">Loading your settings...</p>
              </div>
            </div>
          ) : (
            <>
              <div className="grid gap-8 lg:grid-cols-3">
                {/* Settings Sections */}
                <div className="space-y-8 lg:col-span-2">
                {/* Profile Section */}
                <Card className="border-slate-200/70 bg-white">
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>Update your personal information</CardDescription>
                  </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700">Full Name</label>
                      <Input
                        type="text"
                        value={settings.fullName}
                        onChange={(e) => handleInputChange('fullName', e.target.value)}
                        placeholder="Enter your full name"
                        className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700">Email</label>
                      <Input
                        type="email"
                        value={settings.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="Enter your email"
                        className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700">Phone</label>
                      <Input
                        type="tel"
                        value={settings.phone || ''}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="Enter your phone number"
                        className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700">Country</label>
                      <Input
                        type="text"
                        value={settings.country || ''}
                        onChange={(e) => handleInputChange('country', e.target.value)}
                        placeholder="Enter your country"
                        className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Preferences Section */}
              <Card className="border-slate-200/70 bg-white">
                <CardHeader>
                  <CardTitle>Preferences</CardTitle>
                  <CardDescription>Customize your platform experience</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-slate-900">Currency</p>
                        <p className="text-sm text-slate-600">Set your preferred currency for transactions</p>
                      </div>
                      <select
                        value={settings.currency}
                        onChange={(e) => handleInputChange('currency', e.target.value)}
                        className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                        <option value="JPY">JPY (¥)</option>
                        <option value="NPR">NPR (रु)</option>
                        <option value="CAD">CAD (C$)</option>
                        <option value="AUD">AUD (A$)</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Notifications Section */}
              <Card className="border-slate-200/70 bg-white">
                <CardHeader>
                  <CardTitle>Notifications</CardTitle>
                  <CardDescription>Manage how you receive updates from FloFi</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between rounded-lg border border-slate-200/50 bg-slate-50/50 p-4">
                      <div>
                        <p className="font-medium text-slate-900">Email Notifications</p>
                        <p className="text-sm text-slate-600">Receive updates via email</p>
                      </div>
                      <button
                        onClick={() => handleNotificationChange('email')}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors ${
                          settings.notifications.email ? 'bg-primary' : 'bg-slate-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                            settings.notifications.email ? 'translate-x-5' : 'translate-x-1'
                          } translate-y-0.5`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between rounded-lg border border-slate-200/50 bg-slate-50/50 p-4">
                      <div>
                        <p className="font-medium text-slate-900">Push Notifications</p>
                        <p className="text-sm text-slate-600">Receive push alerts on your device</p>
                      </div>
                      <button
                        onClick={() => handleNotificationChange('push')}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors ${
                          settings.notifications.push ? 'bg-primary' : 'bg-slate-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                            settings.notifications.push ? 'translate-x-5' : 'translate-x-1'
                          } translate-y-0.5`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between rounded-lg border border-slate-200/50 bg-slate-50/50 p-4">
                      <div>
                        <p className="font-medium text-slate-900">SMS Notifications</p>
                        <p className="text-sm text-slate-600">Receive text message alerts</p>
                      </div>
                      <button
                        onClick={() => handleNotificationChange('sms')}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors ${
                          settings.notifications.sms ? 'bg-primary' : 'bg-slate-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                            settings.notifications.sms ? 'translate-x-5' : 'translate-x-1'
                          } translate-y-0.5`}
                        />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Security Section */}
              <Card className="border-slate-200/70 bg-white">
                <CardHeader>
                  <CardTitle>Security</CardTitle>
                  <CardDescription>Manage your account security</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between rounded-lg border border-slate-200/50 bg-slate-50/50 p-4">
                      <div>
                        <p className="font-medium text-slate-900">Two-Factor Authentication</p>
                        <p className="text-sm text-slate-600">Add extra security to your account</p>
                      </div>
                      <button
                        onClick={() => handleInputChange('twoFactorEnabled', !settings.twoFactorEnabled)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors ${
                          settings.twoFactorEnabled ? 'bg-primary' : 'bg-slate-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                            settings.twoFactorEnabled ? 'translate-x-5' : 'translate-x-1'
                          } translate-y-0.5`}
                        />
                      </button>
                    </div>

                    <Button
                      variant="outline"
                      className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-slate-900 transition hover:bg-slate-50"
                    >
                      Change Password
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar Stats */}
            <div className="space-y-6 lg:col-span-1">
              <Card className="border-slate-200/70 bg-white">
                <CardHeader>
                  <CardTitle className="text-base">Account Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-600">Plan</p>
                    <Badge variant="default">Pro</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-600">Status</p>
                    <Badge variant="default">Active</Badge>
                  </div>
                  <Separator />
                  <p className="text-xs text-slate-500">Member since November 2024</p>
                </CardContent>
              </Card>

              <Card className="border-slate-200/70 bg-white">
                <CardHeader>
                  <CardTitle className="text-base">API Keys</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="outline"
                    className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-slate-900 transition hover:bg-slate-50"
                  >
                    Generate New Key
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-red-200/50 bg-red-50">
                <CardHeader>
                  <CardTitle className="text-base text-red-900">Danger Zone</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="destructive"
                    className="w-full rounded-lg bg-red-600 px-4 py-2 text-white transition hover:bg-red-700"
                  >
                    Delete Account
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Action Buttons */}
              <div className="sticky bottom-0 flex gap-3 border-t border-slate-200/70 bg-white/80 px-6 py-4 backdrop-blur lg:px-10">
                <Button
                  variant="outline"
                  className="rounded-lg border border-slate-200 bg-white px-6 py-2 text-slate-900 transition hover:bg-slate-50"
                  onClick={() => {
                    setSettings(defaultSettings)
                    setHasChanges(false)
                  }}
                  disabled={!hasChanges}
                >
                  Cancel
                </Button>
                <Button
                  className="rounded-lg bg-primary px-6 py-2 text-white transition hover:bg-primary/90"
                  onClick={handleSaveSettings}
                  disabled={!hasChanges || isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  )
}
