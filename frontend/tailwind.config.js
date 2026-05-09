/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0ea5e9", // Soft Blue
        secondary: "#14b8a6", // Teal
        background: "#f8fafc",
      }
    },
  },
  plugins: [],
}
