/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#142D4E',
          50: '#F0F4F9',
          100: '#DDE5F0',
          200: '#BDCCE1',
          300: '#94ACCD',
          400: '#6789B5',
          500: '#466C9E',
          600: '#325281',
          700: '#233E64',
          800: '#1B3150',
          900: '#142D4E',
          950: '#0B1B30',
        },
        navy: {
          DEFAULT: '#142D4E',
          50: '#F0F4F9',
          100: '#DDE5F0',
          800: '#1B3150',
          900: '#142D4E',
          950: '#0B1B30',
        },
        secondary: {
          DEFAULT: '#2563EB',
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
        },
        cyan: {
          DEFAULT: '#06B6D4',
          50: '#ECFEFF',
          100: '#CFFAFE',
          200: '#A5F3FC',
          300: '#67E8F9',
          400: '#22D3EE',
          500: '#06B6D4',
          600: '#0891B2',
          700: '#0E7490',
          800: '#155E75',
          900: '#164E63',
        },
        surface: '#FFFFFF',
        background: '#F4F7FB',
        success: {
          DEFAULT: '#10B981',
          light: '#D1FAE5',
          dark: '#047857',
        },
        warning: {
          DEFAULT: '#F59E0B',
          light: '#FEF3C7',
          dark: '#B45309',
        },
        danger: {
          DEFAULT: '#EF4444',
          light: '#FEE2E2',
          dark: '#B91C1C',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 2px 10px rgba(0, 0, 0, 0.03), 0 1px 3px rgba(0, 0, 0, 0.05)',
        card: '0 4px 20px -2px rgba(20, 45, 78, 0.05), 0 2px 6px -1px rgba(20, 45, 78, 0.03)',
        'card-hover': '0 12px 28px -4px rgba(20, 45, 78, 0.1), 0 4px 10px -2px rgba(20, 45, 78, 0.05)',
      },
      animation: {
        'slide-in': 'slide-in 0.4s ease-out',
      },
      keyframes: {
        'slide-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};