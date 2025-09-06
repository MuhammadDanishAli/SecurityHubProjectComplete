import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams } from 'expo-router';
import { EventEmitter } from 'events';
import axios from 'axios';

const deviceEventEmitter = new EventEmitter();
export { deviceEventEmitter };

const API_URL = 'http://192.168.100.30:8000/api/';
const WS_URL = 'ws://192.168.100.30:8000/ws/security/';

// Map node_id to friendly names and types
const deviceMap = {
  sensor_01: { name: 'Living Room Motion', type: 'motion' },
  sensor_02: { name: 'Kitchen Humidity', type: 'humidity' },
  sensor_04: { name: 'Window Vibration', type: 'vibration' },
  sensor_07: { name: 'Attic Temperature', type: 'temperature' },
};

const getDeviceImage = (type) => {
  const imageMap = {
    motion: require('../assets/images/Motion Sensor.png'),
    humidity: require('../assets/images/Humidity.png'),
    vibration: require('../assets/images/Vibration.png'),
    temperature: require('../assets/images/Temperature.png'),
  };
  return imageMap[type] || require('../assets/images/Sensor.png');
};

const DeviceSection = ({ icon, label, options, selectedOption, onChange, extraInfo }) => {
  return (
    <View style={styles.section}>
      <View style={styles.iconBox}>
        <Image source={icon} style={styles.sectionIcon} />
      </View>
      <View style={styles.sectionBody}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.optionRow}>
          {options.map((option) => (
            <TouchableOpacity
              key={option}
              style={[styles.optionButton, selectedOption === option && styles.selectedButton]}
              onPress={() => onChange(option)}
            >
              <Text style={[styles.optionText, selectedOption === option && styles.selectedText]}>
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {extraInfo && <Text style={styles.extraInfo}>{extraInfo}</Text>}
      </View>
    </View>
  );
};

export default function DeviceDetailScreen() {
  const { name } = useLocalSearchParams();
  const [selectedDoor, setSelectedDoor] = useState('Not Connected');
  const [selectedDataType, setSelectedDataType] = useState('Time Delay');
  const [emergencyMode, setEmergencyMode] = useState('Normal');
  const [usageType, setUsageType] = useState('Active');
  const [sensorValue, setSensorValue] = useState('N/A');
  const [sensorUnit, setSensorUnit] = useState('');
  const [lastUpdated, setLastUpdated] = useState('N/A');
  const deviceType = deviceMap[name]?.type || 'unknown';
  const deviceIcon = getDeviceImage(deviceType);

  useEffect(() => {
    const fetchDeviceStatus = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) throw new Error('No token found');
        const response = await axios.get(`${API_URL}sensor-status/?client_id=1`, {
          headers: { Authorization: `Token ${token}` },
          timeout: 10000,
        });
        const statusData = response.data.data[name];
        if (statusData) {
          setSelectedDoor(statusData.connected ? 'Connected' : 'Not Connected');
          setSensorValue(statusData.value || 'N/A');
          setSensorUnit(statusData.unit || '');
          setLastUpdated(statusData.timestamp ? new Date(statusData.timestamp).toLocaleString() : 'N/A');
        }
      } catch (error) {
        console.error('Error fetching device status:', error.message);
      }
    };

    const loadDeviceState = async () => {
      try {
        const stored = await AsyncStorage.getItem(`device-${name}`);
        if (stored) {
          const parsed = JSON.parse(stored);
          setSelectedDoor(parsed.connected ? 'Connected' : 'Not Connected');
          setSelectedDataType(parsed.dataType || 'Time Delay');
          setEmergencyMode(parsed.emergencyMode || 'Normal');
          setUsageType(parsed.usageType || 'Active');
        }
      } catch (e) {
        console.error('Error loading device state:', e);
      }
    };

    fetchDeviceStatus();
    loadDeviceState();

    const websocket = new WebSocket(WS_URL);
    websocket.onopen = () => {
      console.log('WebSocket connected');
    };
    websocket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.status === 'success' && message.data && message.data[name]) {
        const statusData = message.data[name];
        setSelectedDoor(statusData.connected ? 'Connected' : 'Not Connected');
        setSensorValue(statusData.value || 'N/A');
        setSensorUnit(statusData.unit || '');
        setLastUpdated(statusData.timestamp ? new Date(statusData.timestamp).toLocaleString() : 'N/A');
      }
    };
    websocket.onclose = () => {
      console.log('WebSocket disconnected');
    };
    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    return () => {
      websocket.close();
    };
  }, [name]);

  const saveDeviceState = async (updatedState) => {
    try {
      const stored = await AsyncStorage.getItem(`device-${name}`);
      const deviceData = stored ? JSON.parse(stored) : {};
      const updated = { ...deviceData, ...updatedState };
      await AsyncStorage.setItem(`device-${name}`, JSON.stringify(updated));
      const token = await AsyncStorage.getItem('token');
      await axios.post(
        `${API_URL}sensor/`,
        {
          sensor_id: name,
          state: updated.connected,
        },
        { headers: { Authorization: `Token ${token}` } }
      );
      deviceEventEmitter.emit('deviceStatusChanged', { name, deviceData: updated });
    } catch (e) {
      console.error('Error saving device state:', e.message);
    }
  };

  const handleConnectionChange = (status) => {
    setSelectedDoor(status);
    saveDeviceState({ connected: status === 'Connected' });
  };

  const handleDataTypeChange = (type) => {
    setSelectedDataType(type);
    saveDeviceState({ dataType: type });
  };

  const handleEmergencyModeChange = (mode) => {
    setEmergencyMode(mode);
    saveDeviceState({ emergencyMode: mode });
  };

  const handleUsageTypeChange = (type) => {
    setUsageType(type);
    saveDeviceState({ usageType: type });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Image source={deviceIcon} style={styles.iconTop} />
            <Text style={styles.title}>{deviceMap[name]?.name || name}</Text>
          </View>
          <View style={styles.content}>
            <DeviceSection
              icon={deviceIcon}
              label={(deviceMap[name]?.name || name).toUpperCase()}
              options={['Connected', 'Not Connected']}
              selectedOption={selectedDoor}
              onChange={handleConnectionChange}
              extraInfo={`Value: ${sensorValue} ${sensorUnit}\nLast Updated: ${lastUpdated}`}
            />
            <DeviceSection
              icon={require('../assets/images/Data Quality.png')}
              label="DATA TYPE"
              options={['Time Delay', 'Instant']}
              selectedOption={selectedDataType}
              onChange={handleDataTypeChange}
            />
            <DeviceSection
              icon={require('../assets/images/Siren.png')}
              label="EMERGENCY MODE"
              options={['Emergency', 'Normal']}
              selectedOption={emergencyMode}
              onChange={handleEmergencyModeChange}
            />
            <DeviceSection
              icon={require('../assets/images/Database.png')}
              label="USAGE TYPE"
              options={['Active', 'Bypass']}
              selectedOption={usageType}
              onChange={handleUsageTypeChange}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: { backgroundColor: '#fff', flex: 1 },
  header: {
    backgroundColor: '#1D4ED8',
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconTop: {
    width: 50,
    height: 50,
    marginBottom: 10,
    resizeMode: 'contain',
  },
  title: { fontSize: 20, color: '#fff', fontWeight: 'bold' },
  content: { padding: 20 },
  section: { flexDirection: 'row', marginTop: 54, marginBottom: 10 },
  iconBox: {
    width: 50,
    height: 50,
    backgroundColor: '#1D4ED8',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  sectionIcon: {
    width: 24,
    height: 24,
    tintColor: '#fff',
    resizeMode: 'contain',
  },
  sectionBody: { flex: 1 },
  label: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 8,
    color: '#0F172A',
  },
  optionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  optionButton: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  selectedButton: { backgroundColor: '#1D4ED8' },
  optionText: { fontSize: 12, color: '#0F172A', fontWeight: 'bold' },
  selectedText: { color: '#fff' },
  extraInfo: { fontSize: 12, color: '#64748B', marginTop: 8 },
});