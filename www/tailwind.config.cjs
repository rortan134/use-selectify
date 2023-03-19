/** @type {import('tailwindcss').Config} */
const config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-segoe)"],
        inter: ["var(--font-inter)"]
      },
    },
  },
  plugins: [],
};

module.exports = config;
