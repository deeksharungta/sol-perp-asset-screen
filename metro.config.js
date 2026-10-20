const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, {
  input: "./global.css",
  // NativeWind defaults to 14px on native; 16px makes Tailwind classes match Figma's pixel values.
  inlineRem: 16,
});
