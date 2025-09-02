/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html","./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        site: "#fdf8f7",
        blush: "#fde7ef",
        pinkBtn: "#ff78a5"
      },
      boxShadow: { soft: "0 10px 30px rgba(0,0,0,.08)" }
    }
  },
  plugins: [require("@tailwindcss/typography")]
};
