/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: '#080C14',
          card: '#0F172A',
          cardHover: '#162238',
          border: '#1E293B',
          borderHighlight: '#334155',
          text: '#F8FAFC',
          muted: '#94A3B8',
          accent: '#06B6D4',
          safe: '#10B981',
          warning: '#F59E0B',
          danger: '#EF4444',
          broken: '#DC2626',
        }
      }
    },
  },
  plugins: [],
}
