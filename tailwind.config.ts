import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#08090b",
        graphite: "#17191d",
        steel: "#d8dde6",
        smoke: "#f4f5f7",
        signal: "#d5162a",
        gold: "#c8a24c",
        turf: "#1b7b56",
        ice: "#77d5df"
      },
      fontFamily: {
        sans: ["Inter", "Arial", "Helvetica", "sans-serif"],
        display: ["Arial Black", "Inter", "Arial", "Helvetica", "sans-serif"]
      },
      boxShadow: {
        clean: "0 18px 60px rgba(0, 0, 0, 0.16)"
      }
    }
  },
  plugins: []
};

export default config;
