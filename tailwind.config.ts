import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        parchment: {
          light: "#f4e4c1",
          DEFAULT: "#ede0b0",
          dark: "#d4c48a",
        },
        ink: {
          light: "#1a0f02",
          DEFAULT: "#0d0600",
          dark: "#000000",
        },
        blood: {
          light: "#a52a2a",
          DEFAULT: "#8b1a1a",
          dark: "#5c1010",
        },
        gold: {
          light: "#b8941e",
          DEFAULT: "#8b6914",
          dark: "#6b4f0e",
        },
      },
      fontFamily: {
        cinzel: ["var(--font-cinzel)", "serif"],
        crimson: ["var(--font-crimson)", "serif"],
      },
      boxShadow: {
        tome: "0 4px 12px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(139, 105, 20, 0.3)",
        "tome-hover":
          "0 6px 20px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(139, 105, 20, 0.5)",
      },
    },
  },
  plugins: [],
};

export default config;
