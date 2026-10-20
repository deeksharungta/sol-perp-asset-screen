import "./global.css";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AssetDetailScreen } from "./src/screens/AssetDetailScreen";

export default function App() {
  return (
    <SafeAreaProvider>
      <AssetDetailScreen />
      <StatusBar style="dark" />
    </SafeAreaProvider>
  );
}
