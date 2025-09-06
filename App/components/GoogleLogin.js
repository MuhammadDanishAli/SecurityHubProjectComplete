import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { AntDesign } from '@expo/vector-icons';

export default function GoogleLogin() {
  const handleGoogleLogin = () => {
    console.log('Google Login Clicked!');
    // ✅ Add your Google login logic here
  };

  return (
    <TouchableOpacity style={styles.button} onPress={handleGoogleLogin}>
      <AntDesign name="google" size={24} color="white" style={{ marginRight: 10 }} />
      <Text style={styles.buttonText}>Continue with Google</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DB4437', // Google red color
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
