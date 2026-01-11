import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Swiss minimalist palette - Private bank aesthetic
        primary: {
          50: '#f7f7f7',
          100: '#e3e3e3',
          200: '#c8c8c8',
          300: '#a4a4a4',
          400: '#818181',
          500: '#666666',
          600: '#515151',
          700: '#434343',
          800: '#383838',
          900: '#121212',
          950: '#0a0a0a',
        },
        accent: {
          gold: '#B8860B',
          copper: '#B87333',
          emerald: '#2E8B57',
        },
        risk: {
          A: '#22c55e', // Green - Low risk
          B: '#84cc16', // Lime
          C: '#eab308', // Yellow
          D: '#f97316', // Orange
          E: '#ef4444', // Red
          F: '#991b1b', // Dark red - High risk
        },
        forensic: {
          verified: '#10b981',
          pending: '#f59e0b',
          flagged: '#ef4444',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        'elegant': '0 4px 20px rgba(0, 0, 0, 0.08)',
        'card': '0 2px 12px rgba(0, 0, 0, 0.04)',
        'hover': '0 8px 30px rgba(0, 0, 0, 0.12)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
