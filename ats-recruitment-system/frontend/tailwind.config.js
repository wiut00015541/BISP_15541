/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef9f4",
          100: "#d5f0e1",
          500: "#178f58",
          700: "#0f6f45",
        },
      },
    },
  },
  plugins: [],
};
