import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: '#00D4AA',
          foreground: '#0A0F1E',
          50: '#e6fff9',
          100: '#b3ffed',
          500: '#00D4AA',
          600: '#00b894',
          700: '#009e7f',
          900: '#005c49',
        },
        accent: {
          DEFAULT: '#00D4AA',
          foreground: '#0A0F1E',
          400: '#33dfb8',
          500: '#00D4AA',
          600: '#00b894',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        destructive: {
          DEFAULT: '#FF6B6B',
          foreground: '#ffffff',
        },
        success: '#00D4AA',
        warning: '#f59e0b',
        info: '#3b82f6',
        card: {
          DEFAULT: '#111827',
          foreground: '#FFFFFF',
        },
        surface: {
          base: '#111827',
          raised: '#1F2937',
          overlay: '#0A0F1E',
          sidebar: '#0A0F1E',
        },
        navy: {
          950: '#0A0F1E',
          900: '#0d1424',
          800: '#111827',
          700: '#1F2937',
          600: '#374151',
        },
        platinum: '#8892A4',
        coral: '#FF6B6B',
      },
      fontFamily: {
        display: ['Instrument Serif', 'Georgia', 'serif'],
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
      },
      boxShadow: {
        card: '0 0 0 1px rgba(255,255,255,0.05), 0 4px 24px rgba(0,0,0,0.4)',
        elevated: '0 0 0 1px rgba(255,255,255,0.08), 0 8px 40px rgba(0,0,0,0.5)',
        glow: '0 0 40px rgba(0, 212, 170, 0.15)',
        'glow-intense': '0 0 60px rgba(0, 212, 170, 0.25)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-dot': {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.4' },
          '50%': { transform: 'scale(1.2)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        float: 'float 8s ease-in-out infinite',
        'pulse-dot': 'pulse-dot 1.4s ease-in-out infinite',
        shimmer: 'shimmer 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
} satisfies Config
