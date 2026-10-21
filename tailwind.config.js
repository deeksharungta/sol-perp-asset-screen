const { platformSelect } = require("nativewind/theme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.tsx", "./src/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: require("./src/theme/palette.json"),

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
