/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        medicalBlue: "#2563EB",
        softGreen: "#22C55E"
      }
    }
  },
  plugins: []
};
