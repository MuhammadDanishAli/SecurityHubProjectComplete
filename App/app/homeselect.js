import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HomeSelectScreen = () => {
  const router = useRouter();
  const [selected, setSelected] = useState(null);

  const homes = [
    { label: 'Home 1', icon: '🏠' },
    { label: 'Home 2', icon: '🏠' },
    { label: 'Office', icon: '🏢' },
  ];

  const handleSelectHome = async (label) => {
    setSelected(label); // highlight the selected button
    await AsyncStorage.setItem('selectedHome', label);
    setTimeout(() => {
      router.push('/'); // Navigate to HomeScreen (index.js)
    }, 300); // slight delay for feedback
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select your home</Text>

      {homes.map(({ label, icon }) => {
        const isSelected = selected === label;
        return (
          <TouchableOpacity
            key={label}
            style={[
              styles.button,
              isSelected && styles.selectedButton
            ]}
            onPress={() => handleSelectHome(label)}
          >
            <Text style={[styles.buttonText, isSelected && styles.selectedButtonText]}>
              {icon} {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default HomeSelectScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 30,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#fff',
    borderColor: '#1D4ED8',
    borderWidth: 2,
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
  selectedButton: {
    backgroundColor: '#1D4ED8',
  },
  buttonText: {
    fontSize: 16,
    color: '#000',
    fontWeight: 'bold',
  },
  selectedButtonText: {
    color: '#fff',
  },
});