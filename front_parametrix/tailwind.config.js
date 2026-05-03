/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Syne"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        void: '#050508',
        surface: '#0d0d14',
        panel: '#12121c',
        border: '#1e1e2e',
        muted: '#2a2a3e',
        accent: '#7c6aff',
        'accent-bright': '#a394ff',
        neon: '#00e5a0',
        amber: '#f5a623',
        rose: '#ff4d6d',
        sky: '#38bdf8',
        text: {
          primary: '#f0eeff',
          secondary: '#8b8aa8',
          muted: '#4d4d6b',
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      }
    }
  },
  plugins: []
}
