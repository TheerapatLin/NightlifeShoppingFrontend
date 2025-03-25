/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        'plex-sans': ['IBM Plex Sans Thai', 'sans-serif'],
        'noto-sans': ['Noto Sans Thai', 'sans-serif'],
        'CerFont': ['CerFont', 'noto-sans'], 
      },
      colors: {
        primarygray: "#f8f8f8",
        qblack: "#222222",
        qyellow: "#FFBB38",
        qred: "#EF262C",
        qgray: "#797979",
        qblacktext: "#1D1D1D",
        qgraytwo: "#8E8E8E",
        "qgray-border": "#EFEFEF",
        "qblue-white": "#CBECFF",
        "qh2-green": "#2D6F6D",
        "qh3-blue":"#1868D5",
        "certificate_name":"#0ca248",
        "certi_detial":"#c2c3c3",
        "grayAirbnb":"#6A6A6A",
      },
      scale: {
        60: "0.6",
      },
    },
  },
  variants: {
    extend: {
      textColor: ["focus-within"],
      borderStyle: ["last"],
    },
  },
  //plugins: [require("@tailwindcss/line-clamp")],
};
