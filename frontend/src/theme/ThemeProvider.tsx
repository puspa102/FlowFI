import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { getTheme, themeToCssVariables, type ThemeMode } from './themes'

type ThemeContextValue = {
  mode: ThemeMode
  setMode: (mode: ThemeMode) => void
}

const THEME_STORAGE_KEY = 'flofi_theme_mode'
const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

function readStoredMode(): ThemeMode {
  if (typeof window === 'undefined') {
    return 'dark'
  }

  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY)
    return stored === 'light' ? 'light' : 'dark'
  } catch {
    return 'dark'
  }
}

function applyTheme(mode: ThemeMode) {
  if (typeof document === 'undefined') {
    return
  }

  const theme = getTheme(mode)
  const cssVariables = themeToCssVariables(theme)
  const root = document.documentElement

  ;(Object.entries(cssVariables) as Array<[string, string]>).forEach(([name, value]) => {
    root.style.setProperty(name, value)
  })

  root.dataset.themeMode = mode
  root.style.colorScheme = mode
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(readStoredMode)

  useEffect(() => {
    applyTheme(mode)
  }, [mode])

  useEffect(() => {
    window.localStorage.setItem(THEME_STORAGE_KEY, mode)
  }, [mode])

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode)
  }

  return (
    <ThemeContext.Provider value={{ mode, setMode }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)

  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }

  return context
}
