/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#10201d',
        canvas: '#f4f7f5',
        surface: '#ffffff',
        line: '#dce5e0',
        teal: {
          50: '#eefbf7',
          100: '#d6f5eb',
          200: '#aeead9',
          300: '#79d8c1',
          400: '#43bea4',
          500: '#1e9f88',
          600: '#0f7f70',
          700: '#0d665b',
          800: '#0e5149',
          900: '#0f443e',
          950: '#052925'
        },
        amber: {
          400: '#f5b942',
          500: '#e89a1b',
          600: '#c4770f'
        }
      },
      fontFamily: {
        sans: ['Manrope', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Newsreader', 'Georgia', 'serif']
      },
      boxShadow: {
        soft: '0 12px 36px -18px rgba(16, 32, 29, 0.28)',
        lift: '0 22px 60px -28px rgba(16, 32, 29, 0.35)'
      },
      borderRadius: {
        '4xl': '2rem'
      },
      keyframes: {
        rise: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.55' }
        }
      },
      animation: {
        rise: 'rise 0.45s ease-out both',
        pulseSoft: 'pulseSoft 2s ease-in-out infinite'
      }
    }
  },
  plugins: []
};
