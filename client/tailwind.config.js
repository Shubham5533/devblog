/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0edff',
          100: '#e4deff',
          500: '#7c6af7',
          600: '#6b5ce7',
          700: '#5a4bd6',
        },
        dark: {
          900: '#0f0f13',
          800: '#16161e',
          700: '#1e1e2a',
          600: '#25253a',
          500: '#2e2e42',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      typography: ({ theme }) => ({
        invert: {
          css: {
            '--tw-prose-body': theme('colors.gray[300]'),
            '--tw-prose-headings': theme('colors.white'),
            '--tw-prose-links': theme('colors.primary[500]'),
            '--tw-prose-code': theme('colors.orange[400]'),
            '--tw-prose-pre-bg': theme('colors.dark[700]'),
          }
        }
      })
    },
  },
  plugins: [],
}
