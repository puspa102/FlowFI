export type ThemeMode = 'light' | 'dark'

export type ThemeDefinition = {
  mode: ThemeMode
  primary: string
  accent: string
  background: string
  sidebar: string
  card: string
  text: string
  muted: string
  border: string
  success: string
  danger: string
  chart: string[]
}

export type ThemeCssVariables = Record<`--${string}`, string>

export const themeDefinitions: Record<ThemeMode, ThemeDefinition> = {
  light: {
    mode: 'light',
    primary: '#00C9A7',
    accent: '#7C6FE0',
    background: '#F4F6F8',
    sidebar: '#1A2B3C',
    card: '#FFFFFF',
    text: '#1A2B3C',
    muted: '#6B7C93',
    border: '#E2E8F0',
    success: '#00C9A7',
    danger: '#FF6B6B',
    chart: ['#00C9A7', '#7C6FE0', '#4A90D9', '#FFB020'],
  },
  dark: {
    mode: 'dark',
    primary: '#00C9A7',
    accent: '#7C6FE0',
    background: '#0D1B2A',
    sidebar: '#1A2B3C',
    card: '#1A2B3C',
    text: '#F0F4F8',
    muted: '#8FA3B8',
    border: '#243B50',
    success: '#00C9A7',
    danger: '#FF6B6B',
    chart: ['#00C9A7', '#7C6FE0', '#4A90D9', '#FFB020'],
  },
}

export function getTheme(mode: ThemeMode) {
  return themeDefinitions[mode]
}


function hexToRgbTriplet(hex: string): string {
  const normalized = hex.replace('#', '').trim()
  if (normalized.length !== 6) return '26 43 60'
  const value = Number.parseInt(normalized, 16)
  const red = (value >> 16) & 255
  const green = (value >> 8) & 255
  const blue = value & 255
  return `${red} ${green} ${blue}`
}

export function themeToCssVariables(theme: ThemeDefinition): ThemeCssVariables {
  const isDark = theme.mode === 'dark'

  return {
    '--primary': theme.primary,
    '--primary-rgb': hexToRgbTriplet(theme.primary),
    '--accent': theme.accent,
    '--accent-rgb': hexToRgbTriplet(theme.accent),
    '--background': theme.background,
    '--background-rgb': hexToRgbTriplet(theme.background),
    '--foreground': theme.text,
    '--foreground-rgb': hexToRgbTriplet(theme.text),
    '--card': theme.card,
    '--card-rgb': hexToRgbTriplet(theme.card),
    '--card-foreground': theme.text,
    '--card-foreground-rgb': hexToRgbTriplet(theme.text),
    '--secondary': isDark ? '#243B50' : '#E2E8F0',
    '--secondary-rgb': isDark ? '36 59 80' : '226 232 240',
    '--secondary-foreground': theme.text,
    '--secondary-foreground-rgb': hexToRgbTriplet(theme.text),
    '--muted': isDark ? '#243B50' : '#E2E8F0',
    '--muted-rgb': isDark ? '36 59 80' : '226 232 240',
    '--muted-foreground': theme.muted,
    '--muted-foreground-rgb': hexToRgbTriplet(theme.muted),
    '--border': theme.border,
    '--border-rgb': hexToRgbTriplet(theme.border),
    '--input': theme.border,
    '--input-rgb': hexToRgbTriplet(theme.border),
    '--ring': theme.primary,
    '--ring-rgb': hexToRgbTriplet(theme.primary),
    '--success': theme.success,
    '--success-rgb': hexToRgbTriplet(theme.success),
    '--danger': theme.danger,
    '--danger-rgb': hexToRgbTriplet(theme.danger),
    '--destructive': theme.danger,
    '--destructive-rgb': hexToRgbTriplet(theme.danger),
    '--destructive-foreground': '#FFFFFF',
    '--destructive-foreground-rgb': '255 255 255',
    '--warning': '#FFB020',
    '--warning-rgb': '255 176 32',
    '--info': '#4A90D9',
    '--info-rgb': '74 144 217',
    '--sidebar': theme.sidebar,
    '--sidebar-rgb': hexToRgbTriplet(theme.sidebar),
    '--platinum': theme.muted,
    '--platinum-rgb': hexToRgbTriplet(theme.muted),
    '--coral': theme.danger,
    '--coral-rgb': hexToRgbTriplet(theme.danger),
    '--navy-950': isDark ? '#0D1B2A' : '#0D1B2A',
    '--navy-950-rgb': '13 27 42',
    '--navy-900': '#1A2B3C',
    '--navy-900-rgb': '26 43 60',
    '--navy-800': isDark ? '#243B50' : '#243B50',
    '--navy-800-rgb': '36 59 80',
    '--navy-700': isDark ? '#2E4A63' : '#2E4A63',
    '--navy-700-rgb': '46 74 99',
    '--surface-base': theme.background,
    '--surface-base-rgb': hexToRgbTriplet(theme.background),
    '--surface-raised': theme.card,
    '--surface-raised-rgb': hexToRgbTriplet(theme.card),
    '--surface-sunken': isDark ? '#102235' : '#F8FAFC',
    '--surface-sunken-rgb': isDark ? '16 34 53' : '248 250 252',
    '--surface-overlay': theme.sidebar,
    '--surface-overlay-rgb': hexToRgbTriplet(theme.sidebar),
    '--surface-sidebar': theme.sidebar,
    '--surface-sidebar-rgb': hexToRgbTriplet(theme.sidebar),
    '--sidebar-bg': theme.sidebar,
    '--sidebar-bg-rgb': hexToRgbTriplet(theme.sidebar),
    '--primary-light': isDark ? 'rgba(0,201,167,0.14)' : 'rgba(0,201,167,0.12)',
    '--success-light': isDark ? 'rgba(0,201,167,0.14)' : 'rgba(0,201,167,0.12)',
    '--danger-light': isDark ? 'rgba(255,107,107,0.14)' : 'rgba(255,107,107,0.12)',
    '--primary-hover': isDark ? '#12DDBD' : '#00B897',
    '--border-strong': isDark ? '#2E4A63' : '#CBD5E1',
    '--subtle-foreground': theme.muted,
    '--shadow-card': isDark ? '0 16px 40px rgba(0,0,0,0.24)' : '0 8px 28px rgba(26,43,60,0.08)',
    '--shadow-elevated': isDark ? '0 24px 70px rgba(0,0,0,0.36)' : '0 24px 70px rgba(26,43,60,0.16)',
    '--text-primary': theme.text,
    '--text-primary-rgb': hexToRgbTriplet(theme.text),
    '--text-secondary': theme.muted,
    '--text-secondary-rgb': hexToRgbTriplet(theme.muted),
    '--text-muted': theme.muted,
    '--text-muted-rgb': hexToRgbTriplet(theme.muted),
    '--text-inverse': '#FFFFFF',
    '--text-inverse-rgb': '255 255 255',
  }
}
