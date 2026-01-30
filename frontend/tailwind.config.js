/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // GeoMind 3.0 Color Scheme
        // Primary: 深海蓝 (Deep Ocean Blue)
        'geo-primary': {
          DEFAULT: '#1e3a5f',
          50: '#f0f5fa',
          100: '#d9e5f2',
          200: '#b3cce6',
          300: '#8cb2d9',
          400: '#6699cc',
          500: '#4080bf',
          600: '#336699',
          700: '#264d73',
          800: '#1e3a5f',
          900: '#162d4d',
        },
        // Accent: 地学绿 (Earth Science Green)
        'geo-accent': {
          DEFAULT: '#2d9d78',
          50: '#f0faf7',
          100: '#d1f2e8',
          200: '#a3e5d1',
          300: '#75d8ba',
          400: '#47cba3',
          500: '#2d9d78',
          600: '#248060',
          700: '#1b6048',
          800: '#124030',
          900: '#092018',
        },
        // Secondary: 天蓝 (Sky Blue)
        'geo-secondary': {
          DEFAULT: '#4a90d9',
          50: '#f0f7fd',
          100: '#d9ebfa',
          200: '#b3d7f5',
          300: '#8cc3f0',
          400: '#66afeb',
          500: '#4a90d9',
          600: '#3b73ae',
          700: '#2c5682',
          800: '#1e3a57',
          900: '#0f1d2b',
        },
        // Background colors
        'geo-bg': {
          DEFAULT: '#f5f7fa',
          light: '#ffffff',
          dark: '#e8ecf1',
        },
        // Text colors
        'geo-text': {
          DEFAULT: '#1f2937',
          light: '#6b7280',
          muted: '#9ca3af',
        },
        // Status colors
        'geo-success': '#10b981',
        'geo-warning': '#f59e0b',
        'geo-error': '#ef4444',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
