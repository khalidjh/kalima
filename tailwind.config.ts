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
        primary: "#CCFF00",
        "primary-dark": "#99CC00",
        "primary-light": "#FFFF33",
        "primary-text": "#0F0C00",
        correct: "#22A65A",
        present: "#F5820A",
        absent: "#2A2400",
        accent: "#CCFF00",
        background: "#0F0C00",
        surface: "#1A1A1A",
        muted: "#999999",
        tile: "#1A1A1A",
        border: "#2A2A2A",
        "border-filled": "#3A3A3A",
      },
      fontFamily: {
        arabic: ["var(--font-cairo)", "Cairo", "sans-serif"],
        sans: ["var(--font-cairo)", "Cairo", "sans-serif"],
      },
      boxShadow: {
        brutal: "4px 4px 0 rgba(0, 0, 0, 1)",
        "brutal-lg": "8px 8px 0 rgba(0, 0, 0, 1)",
        "brutal-sm": "2px 2px 0 rgba(0, 0, 0, 1)",
      },
      borderWidth: {
        brutal: "3px",
      },
      fontWeight: {
        brutal: "900",
      },
    },
  },
  plugins: [],
};

export default config;
