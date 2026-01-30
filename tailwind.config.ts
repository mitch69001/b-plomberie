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
        primary: {
          50: '#fef7ee',
          100: '#fdecd3',
          200: '#fad5a5',
          300: '#f6b96d',
          400: '#f29133',
          500: '#ef730c',
          600: '#e05807',
          700: '#b94309',
          800: '#93360e',
          900: '#772e0f',
          950: '#411605',
        },
      },
    },
  },
  plugins: [],
}

export default config
