import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Platform, SafeAreaView, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import axios from 'axios';

const API_URL = 'http://192.168.100.30:8000/api/';
const WS_URL = 'ws://192.168.100.30:8000/ws/security/';

export default function AddDeviceScreen() {
  const [nodeId, setNodeId] = useState('');
  const [location, setLocation] = useState('');
  const [sensorType, setSensorType] = useState('');
  const [sensorTypes, setSensorTypes] = useState([]);
  const [clientId] = useState('1');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchSensorTypes = async () => {
      try {
        setIsLoading(true);
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          console.error('No token found in AsyncStorage');
          Alert.alert('Authentication Error', 'Please sign in to continue.');
          router.push('/signin');
          return;
        }
        const response = await axios.get(`${API_URL}sensor-types/`, {
          headers: { Authorization: `Token ${token}` },
          timeout: 10000,
        });
        const types = response.data.sensor_types || [];
        setSensorTypes(types);
        if (types.length > 0) setSensorType(types[0]);
        else Alert.alert('Warning', 'No sensor types available.');
      } catch (error) {
        console.error('Failed to fetch sensor types:', error.message);
        Alert.alert('Error', 'Failed to load sensor types. Check your network.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchSensorTypes();
  }, [router]);

  const handleAddDevice = async () => {
    if (!nodeId.trim() || !location.trim() || !sensorType) {
      Alert.alert('Missing Fields', 'Please enter Node ID, Location, and select a Sensor Type.');
      return;
    }
    try {
      setIsLoading(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.error('No token found in AsyncStorage');
        Alert.alert('Authentication Error', 'Please sign in to continue.');
        router.push('/signin');
        return;
      }
      const response = await axios.post(
        `${API_URL}devices/`,
        { node_id: nodeId, client_id: clientId, location, sensor_type: sensorType },
        { headers: { Authorization: `Token ${token}`, 'Content-Type': 'application/json' }, timeout: 10000 }
      );
      Alert.alert('Success', response.data.message || 'Device added successfully!');
      router.back();
    } catch (error) {
      console.error('Error adding device:', error.response?.data || error.message);
      Alert.alert('Error', error.response?.data?.error || 'Failed to add device. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Add Device</Text>
      </View>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1D4ED8" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      ) : (
        <View style={styles.form}>
          <Text style={styles.label}>Node ID</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. sensor_08"
            value={nodeId}
            onChangeText={setNodeId}
            autoCapitalize="none"
            placeholderTextColor="#94A3B8"
          />
          <Text style={styles.label}>Location</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Living Room"
            value={location}
            onChangeText={setLocation}
            placeholderTextColor="#94A3B8"
          />
          <Text style={styles.label}>Sensor Type</Text>
          <Picker
            selectedValue={sensorType}
            onValueChange={(itemValue) => setSensorType(itemValue)}
            style={styles.picker}
            enabled={sensorTypes.length > 0}
          >
            {sensorTypes.length === 0 ? (
              <Picker.Item label="No sensor types available" value="" />
            ) : (
              sensorTypes.map((type) => (
                <Picker.Item
                  key={type}
                  label={type.charAt(0).toUpperCase() + type.slice(1)}
                  value={type}
                />
              ))
            )}
          </Picker>
          <TouchableOpacity style={[styles.button, isLoading && styles.buttonDisabled]} onPress={handleAddDevice} disabled={isLoading}>
            <Text style={styles.buttonText}>{isLoading ? 'Adding Device...' : 'Add New Device'}</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}



const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingTop: Platform.OS === 'android' ? 0 : 0,
  },
  header: {
    backgroundColor: '#1D4ED8',
    paddingVertical: 40,
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  headerText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  form: {
    padding: 20,
    flex: 1,
  },
  label: {
    marginBottom: 8,
    color: '#1E293B',
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    fontSize: 16,
    color: '#1E293B',
  },
  picker: {
    backgroundColor: '#fff',
    borderRadius: 20,
    marginBottom: 20,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    fontSize: 16,
    color: '#1E293B',
  },
  button: {
    backgroundColor: '#1D4ED8',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: '#93C5FD',
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#1E293B',
    fontSize: 16,
    fontWeight: '500',
  },
});