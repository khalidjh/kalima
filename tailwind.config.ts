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
        correct: "#538d4e",
        present: "#b59f3b",
        absent: "#3a3a3c",
        tile: "#121213",
        background: "#121213",
        surface: "#1a1a1b",
        border: "#3a3a3c",
        "border-filled": "#565758",
      },
      fontFamily: {
        arabic: ["Noto Sans Arabic", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
