/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#090910',
          secondary: '#111118',
          card: '#16161F',
        },
        'border-color': '#252535',
        accent: {
          primary: '#7C6FFF',
          secondary: '#00E5CC',
          danger: '#FF4455',
          success: '#22D3A0',
        },
        text: {
          primary: '#F0F0FF',
          secondary: '#8888AA',
          muted: '#44445A',
        },
      },
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
