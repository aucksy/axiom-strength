/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        gym: {
          950: '#090b0e',
          900: '#11141a',
          850: '#161b22',
          800: '#1e242e',
          700: '#2b3340',
          600: '#3d4757',
        },
        accent: {
          emerald: '#10b981',
          lime: '#84cc16',
          cyan: '#06b6d4',
          amber: '#f59e0b',
          rose: '#f43f5e',
          violet: '#8b5cf6',
        }
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      }
    },
  },
  plugins: [],
}
