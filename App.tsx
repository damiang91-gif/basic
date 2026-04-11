import 'react-native-gesture-handler';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { UserDataProvider } from './src/context/UserDataContext';
import { AppNavigator } from './src/navigation/AppNavigator';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <UserDataProvider>
        <StatusBar style="light" />
        <AppNavigator />
      </UserDataProvider>
    </GestureHandlerRootView>
  );
}
