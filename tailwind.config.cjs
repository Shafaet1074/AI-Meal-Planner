/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",       // App Router pages
    "./src/pages/**/*.{js,ts,jsx,tsx}",     // Pages Router (if used)
    "./src/components/**/*.{js,ts,jsx,tsx}",// Components
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
