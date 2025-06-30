import React from 'react';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  console.log("API BASE URL", process.env.EXPO_PUBLIC_SCOUTJAR_SERVER_BASE_URL);
  console.log("API BASE URL", process.env.EXPO_PUBLIC_SCOUTJAR_AI_BASE_URL);
  return <AppNavigator />;
}
