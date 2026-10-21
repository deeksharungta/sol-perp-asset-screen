const { platformSelect } = require("nativewind/theme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.tsx", "./src/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: "#E9EEF6",
        surface: "#FFFFFF",
        pill: "#22242A0A",
        "text-primary": "#22242A",
        "text-secondary": "#22242AA3",
        "text-tertiary": "#22242A7A",
        "text-on-color": "#FFFFFF",
        "text-green": "#0FAA55",
        "text-red": "#D9323B",
        like: "#FC454E",
        accent: "#2398FF",
        "price-line-green": "#0CC25E",
        "price-line-red": "#F63841",
      },

      fontSize: {
        "2xs": ["10px", { lineHeight: "13px", letterSpacing: "0.1px" }],
      },

      fontFamily: {
        // iOS uses its built-in SF Pro Rounded; Android uses the bundled copy from app.json.
        sans: platformSelect({
          ios: "ui-rounded",
          android: "SFProRounded",
          default: "system-ui",
        }),
      },
    },
  },
  plugins: [],
};
