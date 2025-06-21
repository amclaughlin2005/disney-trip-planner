/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        disney: {
          blue: '#0063E5',
          purple: '#8B5CF6',
          pink: '#EC4899',
          yellow: '#F59E0B',
          green: '#10B981',
          red: '#EF4444',
          orange: '#F97316',
          gray: '#6B7280',
          lightblue: '#3B82F6',
          darkblue: '#1E40AF',
        }
      },
      fontFamily: {
        'disney': ['Arial', 'sans-serif'],
      }
    },
  },
  plugins: [],
} 