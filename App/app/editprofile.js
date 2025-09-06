import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import axios from 'axios';
import * as Battery from 'expo-battery';

cconst API_URL = 'http://192.168.100.30:8000/api/';
const WS_URL = 'ws://192.168.100.30:8000/ws/security/';

export default function EditProfileScreen() {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState({
    name: '',
    email: '',
    password: '',
    profileImage: '',
    selectedHome: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [batteryLevel, setBatteryLevel] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          Alert.alert('Error', 'No authentication token found. Please log in again.');
          router.push('/signin');
          return;
        }

        // Fetch from backend
        const response = await axios.get(`${API_URL}user-profile/`, {
          headers: { Authorization: `Token ${token}` },
          timeout: 10000,
        });
        const backendData = response.data;
        const storedUser = await AsyncStorage.getItem('currentUser');
        const parsedUser = storedUser ? JSON.parse(storedUser) : {};

        setUserInfo({
          name: backendData.name || parsedUser.name || '',
          email: backendData.email || parsedUser.email || '',
          password: parsedUser.password || '', // Password not fetched from backend for security
          profileImage: backendData.profileImage || parsedUser.profileImage || '',
          selectedHome: backendData.selectedHome || parsedUser.selectedHome || '',
        });
      } catch (error) {
        console.log('Error fetching user info:', error);
        const storedUser = await AsyncStorage.getItem('currentUser');
        if (storedUser) {
          setUserInfo(JSON.parse(storedUser));
        } else {
          Alert.alert('Error', 'Failed to load user data. Check your connection.');
          router.push('/signin');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchUserInfo();
  }, []);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const getBatteryLevel = async () => {
      const level = await Battery.getBatteryLevelAsync();
      setBatteryLevel(Math.round(level * 100));
    };
    getBatteryLevel();
  }, []);

  const handleSave = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('No token found');

      // Save to backend
      await axios.put(`${API_URL}user-profile/`, {
        name: userInfo.name,
        email: userInfo.email,
        password: userInfo.password, // Only update if changed
        profileImage: userInfo.profileImage,
        selectedHome: userInfo.selectedHome,
      }, {
        headers: { Authorization: `Token ${token}` },
        timeout: 10000,
      });

      // Save to AsyncStorage
      await AsyncStorage.setItem('currentUser', JSON.stringify(userInfo));
      Alert.alert('Success', 'Profile updated successfully');
      router.push('/profile');
    } catch (error) {
      console.log('Error saving user info:', error);
      Alert.alert('Error', 'Failed to update profile. Check your connection.');
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.systemInfo}>
          <Text style={styles.systemText}>{currentTime}</Text>
          <View style={styles.systemIcons}>
            <Ionicons name="wifi" size={18} color="#fff" style={{ marginRight: 6 }} />
            <Ionicons name="battery-full" size={20} color="#fff" />
            {batteryLevel !== null && (
              <Text style={[styles.systemText, { marginLeft: 4 }]}>{batteryLevel}%</Text>
            )}
          </View>
        </View>
        <View style={styles.header}>
          <View style={{ width: 24 }} />
          <Text style={styles.headerText}>Edit Profile</Text>
          <View style={{ width: 24 }} />
        </View>
        <Text style={styles.loadingText}>Loading user data...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.systemInfo}>
        <Text style={styles.systemText}>{currentTime}</Text>
        <View style={styles.systemIcons}>
          <Ionicons name="wifi" size={18} color="#fff" style={{ marginRight: 6 }} />
          <Ionicons name="battery-full" size={20} color="#fff" />
          {batteryLevel !== null && (
            <Text style={[styles.systemText, { marginLeft: 4 }]}>{batteryLevel}%</Text>
          )}
        </View>
      </View>

      <View style={styles.header}>
        <View style={{ width: 24 }} />
        <Text style={styles.headerText}>Edit Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      {userInfo.profileImage ? (
        <Image source={{ uri: userInfo.profileImage }} style={styles.floatingImage} />
      ) : (
        <View style={styles.floatingPlaceholder}>
          <Ionicons name="person" size={50} color="#fff" />
        </View>
      )}

      <ScrollView contentContainerStyle={styles.profileSection} keyboardShouldPersistTaps="handled">
        <View style={styles.formContainer}>
          <Text style={styles.profileLabel}>Full Name</Text>
          <TextInput
            value={userInfo.name}
            onChangeText={(text) => setUserInfo({ ...userInfo, name: text })}
            style={styles.input}
            placeholder="Enter your name"
          />

          <Text style={styles.profileLabel}>Email</Text>
          <TextInput
            value={userInfo.email}
            onChangeText={(text) => setUserInfo({ ...userInfo, email: text })}
            style={styles.input}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.profileLabel}>Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              value={userInfo.password}
              onChangeText={(text) => setUserInfo({ ...userInfo, password: text })}
              style={styles.passwordInput}
              placeholder="Enter your password"
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={24} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  systemInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 4,
    paddingHorizontal: 16,
    backgroundColor: '#1D4ED8',
  },
  systemText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
  systemIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#1D4ED8',
    paddingTop: 40,
    paddingBottom: 40,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
  },
  headerText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    position: 'absolute',
    left: 0,
    right: 0,
  },
  floatingImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#fff',
    position: 'absolute',
    top: 120,
    alignSelf: 'center',
    zIndex: 10,
    backgroundColor: '#fff',
  },
  floatingPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#1D4ED8',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 120,
    alignSelf: 'center',
    zIndex: 10,
  },
  profileSection: {
    paddingTop: 100,
    alignItems: 'center',
    paddingBottom: 30,
  },
  formContainer: {
    width: '90%',
  },
  profileLabel: {
    fontSize: 16,
    marginTop: 20,
    marginLeft: 10,
    color: '#0F172A',
  },
  input: {
    width: '100%',
    height: 45,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginTop: 5,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginTop: 5,
    height: 45,
  },
  passwordInput: {
    flex: 1,
  },
  saveButton: {
    marginTop: 30,
    backgroundColor: '#1D4ED8',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignSelf: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#0F172A',
    marginTop: 50,
  },
});