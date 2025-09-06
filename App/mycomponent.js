// MyComponent.js

import React from 'react';
import { View, Image, StyleSheet } from 'react-native';  // Import Image and other necessary components

const MyComponent = () => (
  <View style={styles.container}>
    <Image source={require('./assets/safehaven_logo.png')} style={styles.logo} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  logo: {
    width: 200,  // Set the width of the image
    height: 200, // Set the height of the image
    resizeMode: 'contain', // Ensures the image scales without being distorted
  },
});

export default MyComponent;
