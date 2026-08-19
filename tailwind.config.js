export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f3e8ff',
          100: '#e9d5ff',
          200: '#d8b4fe',
          300: '#c084fc',
          400: '#a855f7',
          500: '#9333ea',
          600: '#7e22ce',
          700: '#6b21a8',
          800: '#581c87',
          900: '#3f0f5c',
        },
        surface: {
          DEFAULT: '#f8fafc',
          soft: '#ffffff',
          dark: '#0f172a',
        },
      },
      boxShadow: {
        soft: '0 22px 80px rgba(15, 23, 42, 0.08)',
        glow: '0 24px 120px rgba(147, 51, 234, 0.14)',
      },
      backgroundImage: {
        'hero-glow': 'radial-gradient(circle at top right, rgba(147, 51, 234, 0.18), transparent 45%), radial-gradient(circle at bottom left, rgba(15, 23, 42, 0.12), transparent 40%)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
}
