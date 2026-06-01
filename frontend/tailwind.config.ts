import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        border: 'rgb(var(--border-rgb) / <alpha-value>)',
        input: 'rgb(var(--input-rgb) / <alpha-value>)',
        ring: 'rgb(var(--ring-rgb) / <alpha-value>)',
        background: 'rgb(var(--background-rgb) / <alpha-value>)',
        foreground: 'rgb(var(--foreground-rgb) / <alpha-value>)',
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'rgb(var(--primary-foreground-rgb) / <alpha-value>)',
          light: 'var(--primary-light)',
          hover: 'var(--primary-hover)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'rgb(var(--accent-foreground-rgb) / <alpha-value>)',
          light: 'var(--accent-light)',
        },
        secondary: {
          DEFAULT: 'rgb(var(--secondary-rgb) / <alpha-value>)',
          foreground: 'rgb(var(--secondary-foreground-rgb) / <alpha-value>)',
        },
        muted: {
          DEFAULT: 'rgb(var(--muted-rgb) / <alpha-value>)',
          foreground: 'rgb(var(--muted-foreground-rgb) / <alpha-value>)',
        },
        destructive: {
          DEFAULT: 'rgb(var(--danger-rgb) / <alpha-value>)',
          foreground: 'rgb(var(--destructive-foreground-rgb) / <alpha-value>)',
        },
        success: {
          DEFAULT: 'var(--success)',
          light: 'var(--success-light)',
        },
        danger: {
          DEFAULT: 'var(--danger)',
          light: 'var(--danger-light)',
        },
        warning: {
          DEFAULT: 'var(--warning)',
          light: 'var(--warning-light)',
        },
        info: {
          DEFAULT: 'var(--info)',
          light: 'var(--info-light)',
        },
        card: {
          DEFAULT: 'rgb(var(--card-rgb) / <alpha-value>)',
          foreground: 'rgb(var(--card-foreground-rgb) / <alpha-value>)',
        },
        popover: {
          DEFAULT: 'rgb(var(--card-rgb) / <alpha-value>)',
          foreground: 'rgb(var(--card-foreground-rgb) / <alpha-value>)',
        },
        surface: {
          base: 'rgb(var(--background-rgb) / <alpha-value>)',
          raised: 'rgb(var(--card-rgb) / <alpha-value>)',
          overlay: 'rgb(var(--navy-950-rgb) / <alpha-value>)',
          sidebar: 'rgb(var(--sidebar-rgb) / <alpha-value>)',
        },
        navy: {
          950: 'rgb(var(--navy-950-rgb) / <alpha-value>)',
          900: 'rgb(var(--navy-900-rgb) / <alpha-value>)',
          800: 'rgb(var(--navy-800-rgb) / <alpha-value>)',
          700: 'rgb(var(--navy-700-rgb) / <alpha-value>)',
        },
        sidebar: '#1A2B3C',
        platinum: 'rgb(var(--platinum-rgb) / <alpha-value>)',
        coral: 'rgb(var(--coral-rgb) / <alpha-value>)',
      },
      fontFamily: {
        display: ['Geist', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '18px',
        xl: '24px',
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        elevated: 'var(--shadow-elevated)',
        glow: '0 0 40px rgba(0, 201, 167, 0.15)',
        'glow-intense': '0 0 60px rgba(0, 201, 167, 0.25)',
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
