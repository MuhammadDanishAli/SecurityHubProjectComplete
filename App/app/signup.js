import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://192.168.100.30:8000/api/';
const WS_URL = 'ws://192.168.100.30:8000/ws/security/';

export default function ProfileScreen() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          console.error('No token found in AsyncStorage');
          router.push('/signin');
          return;
        }
        const response = await axios.get(`${API_URL}user-profile/`, {
          headers: { Authorization: `Token ${token}` },
          timeout: 10000,
        });
        setUser(response.data);
        setError(null);
      } catch (error) {
        console.error('Failed to load user profile:', error.message);
        setError('Unable to load profile. Check your network connection.');
        if (error.response && error.response.status === 401) {
          await AsyncStorage.clear();
          router.push('/signin');
        }
      }
    };
    fetchUserProfile();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.clear();
    router.push('/signin');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Profile</Text>
      </View>
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : user ? (
        <View style={styles.profileInfo}>
          <Text style={styles.label}>Username:</Text>
          <Text style={styles.value}>{user.username}</Text>
          <Text style={styles.label}>Full Name:</Text>
          <Text style={styles.value}>{user.full_name || 'N/A'}</Text>
          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>{user.email}</Text>
          <Text style={styles.label}>Role:</Text>
          <Text style={styles.value}>{user.role}</Text>
        </View>
      ) : (
        <Text style={styles.loading}>Loading user data...</Text>
      )}
      <TouchableOpacity style={styles.button} onPress={() => router.push('/deleteaccount')}>
        <Text style={styles.buttonText}>Delete Account</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={handleLogout}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#1D4ED8',
    paddingVertical: 60,
    alignItems: 'center',
  },
  headerText: {
    fontSize: 22,
    color: '#fff',
    fontWeight: 'bold',
  },
  profileInfo: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F172A',
    marginTop: 10,
  },
  value: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#1D4ED8',
    paddingVertical: 14,
    marginHorizontal: 20,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 20,
  },
  logoutButton: {
    backgroundColor: '#DC2626',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  loading: {
    textAlign: 'center',
    color: '#64748B',
    marginTop: 20,
  },
  errorText: {
    textAlign: 'center',
    color: '#DC2626',
    marginTop: 20,
    paddingHorizontal: 20,
  },
});