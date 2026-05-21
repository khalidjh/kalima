import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#FFD60A',
        secondary: '#4361EE',
        accent: '#F72585',
        success: '#06D6A0',
        warning: '#FB8500',
        surface: '#FFFBF0',
        ink: '#1A1A2E',
      },
      fontFamily: {
        display: ['"Baloo 2"', '"Baloo Bhaijaan 2"', 'system-ui', 'sans-serif'],
        body: ['Nunito', '"Baloo Bhaijaan 2"', 'system-ui', 'sans-serif'],
        arabic: ['"Baloo Bhaijaan 2"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1.25rem',
      },
      boxShadow: {
        card: '0 4px 14px -2px rgba(26, 26, 46, 0.12)',
      },
    },
  },
  plugins: [],
} satisfies Config;
