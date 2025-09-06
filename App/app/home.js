import React, { useEffect } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();

  useEffect(() => {
    router.push('/index'); // Redirect to index.js (HomeScreen)
  }, []);

  return <View />;
}