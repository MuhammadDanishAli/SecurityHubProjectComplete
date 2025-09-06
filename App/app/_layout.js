// app/_layout.js
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Layout() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [initialRoute, setInitialRoute] = useState('signin');

  useEffect(() => {
    async function prepare() {
      try {
        await SplashScreen.preventAutoHideAsync();
        await Font.loadAsync({});
        const token = await AsyncStorage.getItem('token');
        if (token) setInitialRoute('index');
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
        await SplashScreen.hideAsync();
      }
    }
    prepare();
  }, []);

  if (!appIsReady) return null;

  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }} initialRouteName={initialRoute}>
        <Stack.Screen name="index" options={{ title: 'Home' }} />
        <Stack.Screen name="splash" options={{ title: 'Splash' }} />
        <Stack.Screen name="signup" options={{ title: 'Sign Up' }} />
        <Stack.Screen name="signin" options={{ title: 'Sign In' }} />
        <Stack.Screen name="homeselect" options={{ title: 'Home Select' }} />
        <Stack.Screen name="notificationscreen" options={{ title: 'Notifications' }} />
        <Stack.Screen name="profile" options={{ title: 'Profile' }} />
        <Stack.Screen name="devices" options={{ title: 'Devices' }} />
        <Stack.Screen name="devicedetail" options={{ title: 'Device Detail' }} />
        <Stack.Screen name="adddevice" options={{ title: 'Add Device' }} />
        <Stack.Screen name="deleteaccount" options={{ title: 'Delete Account' }} />
      </Stack>
    </SafeAreaProvider>
  );
}