const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);
// expo-sqlite uses a WASM binary on web; Metro must treat .wasm as an asset
config.resolver.assetExts.push("wasm");
module.exports = withNativeWind(config, { input: "./global.css" });
