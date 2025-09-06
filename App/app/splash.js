// /home/danish/PROJECT/App/app/splash.js
import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const user = await AsyncStorage.getItem('currentUser');
      if (user) {
        const selectedHome = await AsyncStorage.getItem('selectedHome');
        if (selectedHome) {
          router.replace('/home');
        } else {
          router.replace('/homeselect');
        }
      } else {
        router.replace('/signup');
      }
    };

    setTimeout(checkUser, 2000); // Simulate splash screen delay
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.placeholderText}>Loading...</Text> {/* Simple placeholder */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  placeholderText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1D4ED8',
  },
});