/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          950: "#08080d",
          900: "#0e0e18",
          800: "#13131f",
          700: "#1a1a2a",
          600: "#1e1e30",
          500: "#2a2a3e",
          400: "#3a3a52",
          300: "#55556a",
          200: "#8888a0",
          100: "#b0b0c4",
          50: "#f0f0f5",
        },
        gold: {
          DEFAULT: "#d4a843",
          50: "#fdf8e8",
          100: "#f8ecc5",
          200: "#f0d68a",
          300: "#e8c050",
          400: "#d4a843",
          500: "#b8903a",
          600: "#9c7830",
          700: "#806028",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease-out forwards",
        "slide-up": "slideUp 0.4s ease-out forwards",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
