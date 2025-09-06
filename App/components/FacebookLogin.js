import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

export default function FacebookLogin() {
  const handleFacebookLogin = () => {
    console.log('Facebook Login Clicked!');
    // ✅ Add your Facebook login logic here
  };

  return (
    <TouchableOpacity style={styles.button} onPress={handleFacebookLogin}>
      <FontAwesome name="facebook" size={24} color="white" style={{ marginRight: 10 }} />
      <Text style={styles.buttonText}>Continue with Facebook</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4267B2', // Facebook blue color
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
