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
        primary: "#F5C200",
        "primary-dark": "#C99A00",
        "primary-light": "#FFD740",
        "primary-text": "#0F0C00",
        correct: "#22A65A",
        present: "#F5820A",
        absent: "#2A2400",
        accent: "#F5C200",
        background: "#0F0C00",
        surface: "#1E1900",
        muted: "#8A7A3A",
        tile: "#1E1900",
        border: "#3D3500",
        "border-filled": "#6B5D00",
      },
      fontFamily: {
        arabic: ["Cairo", "sans-serif"],
        sans: ["Cairo", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
