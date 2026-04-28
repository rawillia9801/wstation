import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        panel: '#08111f',
        glow: '#00d9ff',
        accent: '#0066ff'
      },
      boxShadow: {
        neon: '0 0 25px rgba(0,217,255,0.35)'
      }
    }
  },
  plugins: []
}

export default config