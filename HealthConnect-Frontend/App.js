import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './src/context/AuthContext';
import { LogBox } from 'react-native';

// Ignore React Navigation internal warnings for deprecated pointerEvents
LogBox.ignoreLogs(['props.pointerEvents is deprecated']);
import AppNavigator from './src/navigation/AppNavigator';

if (Platform.OS === 'web') {
  const style = document.createElement('style');
  style.textContent = `
    html, body, #root {
      height: 100vh;
      min-height: 100vh;
      max-height: 100vh;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      flex: 1;
    }
  `;
  document.head.appendChild(style);
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer>
          <AppNavigator />
          <StatusBar style="dark" />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
