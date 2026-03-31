import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#6B35C8",
        "primary-dark": "#4A1F9C",
        "primary-light": "#9B6FE8",
        correct: "#3DAA7A",
        present: "#D4A017",
        absent: "#6B6475",
        accent: "#E8604C",
        background: "#141218",
        surface: "#1E1B24",
        muted: "#7A7589",
        tile: "#1E1B24",
        border: "#6B6475",
        "border-filled": "#F0EDE8",
      },
      fontFamily: {
        arabic: ["Cairo", "sans-serif"],
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
