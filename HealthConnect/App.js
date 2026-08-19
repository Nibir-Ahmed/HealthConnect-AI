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
  const origWarn = console.warn;
  console.warn = (...args) => {
    if (args[0] && typeof args[0] === 'string' && (args[0].includes('pointerEvents') || args[0].includes('aria-hidden'))) {
      return;
    }
    origWarn(...args);
  };

  const style = document.createElement('style');
  style.textContent = `
    html, body, #root, #root > div, [data-reactroot] {
      height: 100% !important;
      width: 100% !important;
      margin: 0;
      padding: 0;
      display: flex !important;
      flex-direction: column !important;
      flex: 1 1 auto !important;
      overflow: hidden;
    }
    /* Fix react-native-safe-area-context / React Native Web flex-shrink & height bounds on web */
    #root div[class*="r-minHeight-2llsf"], #root div[style*="min-height: 100%"] {
      flex: 1 1 0% !important;
      height: 100% !important;
      max-height: 100% !important;
    }
    /* Ensure ScrollView containers scroll properly on web */
    [class*="r-overflow"] {
      -webkit-overflow-scrolling: touch;
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
