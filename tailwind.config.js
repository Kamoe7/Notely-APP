/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "#F7F5F0",
        ink: "#1C1B19",
        ledger: "#2B4C5C",   // deep desaturated teal-blue, the one accent
        ledger2: "#3E6B7D",
        flag: "#C1502E",     // used sparingly: the broken/missing-feature markers
        line: "#DAD6CB",
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
        mono: ["var(--font-mono)"],
      },
    },
  },
  plugins: [],
};
