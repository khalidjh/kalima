import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Pop Cartoon palette
        primary: '#FFD60A',
        secondary: '#4361EE',
        accent: '#F72585',
        success: '#06D6A0',
        warning: '#FB8500',
        surface: '#FFFBF0',
        ink: '#1A1A2E',
        // Pop Cartoon specific
        sunny: '#FACC15',
        cobalt: '#3B82F6',
        tomato: '#F87171',
        lime: '#84CC16',
        cream: '#FEFCE8',
      },
      boxShadow: {
        card: '0 4px 14px -2px rgba(26, 26, 46, 0.12)',
        pop: '4px 4px 0 0 #1A1A2E',
        'pop-lg': '8px 8px 0 0 #1A1A2E',
      },
      fontFamily: {
        display: ['"Baloo 2"', '"Baloo Bhaijaan 2"', 'system-ui', 'sans-serif'],
        body: ['Nunito', '"Baloo Bhaijaan 2"', 'system-ui', 'sans-serif'],
        arabic: ['"Baloo Bhaijaan 2"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1.25rem',
      },
    },
  },
  plugins: [],
} satisfies Config;
