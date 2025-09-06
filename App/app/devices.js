import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import * as Battery from 'expo-battery';
import * as Network from 'expo-network';
import { Ionicons, FontAwesome5 } from '@expo-vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { EventEmitter } from 'events';
import axios from 'axios';

export const deviceEventEmitter = new EventEmitter();
const API_URL = 'http://192.168.100.30:8000/api/';
const WS_URL = 'ws://192.168.100.30:8000/ws/security/';

// Map node_id to friendly names and icons based on ESP32 setup
const deviceMap = {
  sensor_01: { name: 'Living Room Motion', type: 'motion' },
  sensor_02: { name: 'Kitchen Humidity', type: 'humidity' },
  sensor_04: { name: 'Window Vibration', type: 'vibration' },
  sensor_07: { name: 'Attic Temperature', type: 'temperature' },
};

const getDeviceIcon = (type) => {
  const iconMap = {
    motion: require('../assets/images/Motion Sensor.png'),
    humidity: require('../assets/images/Humidity.png'),
    vibration: require('../assets/images/Vibration.png'),
    temperature: require('../assets/images/Temperature.png'),
  };
  return iconMap[type] || require('../assets/images/Sensor.png');
};

export default function DevicesScreen() {
  const [devices, setDevices] = useState([]);
  const [time, setTime] = useState('');
  const [wifiEnabled, setWifiEnabled] = useState(true);
  const [batteryLevel, setBatteryLevel] = useState(100);
  const router = useRouter();

  const loadDevices = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.error('No token found in AsyncStorage');
        router.push('/signin');
        return;
      }
      const response = await axios.get(`${API_URL}sensor-status/?client_id=1`, {
        headers: { Authorization: `Token ${token}` },
        timeout: 10000,
      });
      const backendDevices = Object.keys(response.data.data).map((nodeId, index) => ({
        id: index + 1,
        node_id: nodeId,
        name: deviceMap[nodeId]?.name || nodeId.toUpperCase().replace(/_/g, ' '),
        connected: response.data.data[nodeId].connected,
        type: response.data.data[nodeId].type || deviceMap[nodeId]?.type || 'unknown',
        value: response.data.data[nodeId].value,
        unit: response.data.data[nodeId].unit,
        timestamp: response.data.data[nodeId].timestamp,
        icon: getDeviceIcon(response.data.data[nodeId].type || deviceMap[nodeId]?.type),
        isRemovable: false,
      }));
      setDevices(backendDevices);
    } catch (error) {
      console.error('Failed to load devices:', error.message);
      const savedDevices = JSON.parse(await AsyncStorage.getItem('savedDevices')) || [];
      setDevices(savedDevices);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadDevices();
    }, [])
  );

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const formatted = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
      setTime(formatted);
    };

    const checkWifi = async () => {
      const status = await Network.getNetworkStateAsync();
      setWifiEnabled(status.isConnected && status.isWifiEnabled);
    };

    const fetchBattery = async () => {
      const level = await Battery.getBatteryLevelAsync();
      setBatteryLevel(Math.round(level * 100));
    };

    updateTime();
    checkWifi();
    fetchBattery();

    const interval = setInterval(() => {
      updateTime();
      checkWifi();
      fetchBattery();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const websocket = new WebSocket(WS_URL);
    websocket.onopen = () => {
      console.log('WebSocket connected');
    };
    websocket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.status === 'success' && message.data) {
        const newDevices = Object.keys(message.data).map((nodeId, index) => ({
          id: index + 1,
          node_id: nodeId,
          name: deviceMap[nodeId]?.name || nodeId.toUpperCase().replace(/_/g, ' '),
          connected: message.data[nodeId].connected,
          type: message.data[nodeId].type || deviceMap[nodeId]?.type || 'unknown',
          value: message.data[nodeId].value,
          unit: message.data[nodeId].unit,
          timestamp: message.data[nodeId].timestamp,
          icon: getDeviceIcon(message.data[nodeId].type || deviceMap[nodeId]?.type),
          isRemovable: false,
        }));
        setDevices((prev) => {
          const updated = [...prev];
          newDevices.forEach((newDevice) => {
            const index = updated.findIndex((d) => d.node_id === newDevice.node_id);
            if (index !== -1) {
              updated[index] = newDevice;
            } else {
              updated.push(newDevice);
            }
          });
          return updated;
        });
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
  }, []);

  useEffect(() => {
    const listener = ({ name, connected }) => {
      setDevices((prev) =>
        prev.map((device) =>
          device.name === name
            ? { ...device, connected, status: connected ? 'connected' : 'not connected' }
            : device
        )
      );
    };
    deviceEventEmitter.on('deviceStatusChanged', listener);
    return () => deviceEventEmitter.off('deviceStatusChanged', listener);
  }, []);

  const removeDevice = async (id) => {
    const updated = devices.filter((device) => device.id !== id);
    setDevices(updated);
    const removable = updated.filter((d) => d.isRemovable);
    await AsyncStorage.setItem('savedDevices', JSON.stringify(removable));
  };

  const openDeviceDetails = (device) => {
    router.push({
      pathname: '/devicedetail',
      params: {
        name: device.node_id,
        status: device.connected ? 'connected' : 'not connected',
        connected: device.connected ? 'true' : 'false',
        type: device.type,
        value: device.value,
        unit: device.unit,
        timestamp: device.timestamp,
      },
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.statusBar}>
        <Text style={styles.statusTime}>{time}</Text>
        <View style={styles.statusIcons}>
          <Ionicons name="cellular" size={16} color="#fff" style={styles.icon} />
          {wifiEnabled && <Ionicons name="wifi" size={16} color="#fff" style={styles.icon} />}
          <FontAwesome5 name="battery-full" size={14} color="#fff" style={styles.icon} />
          <Text style={styles.batteryText}>{batteryLevel}%</Text>
        </View>
      </View>
      <View style={styles.header}>
        <Text style={styles.headerText}>Devices</Text>
      </View>
      <View style={styles.body}>
        <Text style={styles.newDevicesLabel}>New Devices</Text>
        <TouchableOpacity style={styles.addDeviceBox} onPress={() => router.push('/adddevice')}>
          <Text style={styles.plus}>＋</Text>
          <Text style={styles.addText}>Add device</Text>
        </TouchableOpacity>
        <View style={styles.grid}>
          {devices.map((device) => (
            <TouchableOpacity
              key={device.id}
              style={styles.deviceCard}
              onPress={() => openDeviceDetails(device)}
            >
              <Image source={device.icon} style={styles.deviceIcon} />
              <Text style={styles.deviceName}>{device.name}</Text>
              <Text style={[styles.deviceStatus, { color: device.connected ? 'green' : 'gray' }]}>
                {device.connected ? 'Connected' : 'Not Connected'}
              </Text>
              <Text style={styles.deviceDetail}>Value: {device.value} {device.unit}</Text>
              <Text style={styles.deviceDetail}>Last Updated: {device.timestamp ? new Date(device.timestamp).toLocaleString() : 'N/A'}</Text>
              {device.isRemovable && (
                <TouchableOpacity style={styles.removeButton} onPress={() => removeDevice(device.id)}>
                  <Text style={styles.removeButtonText}>Remove</Text>
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#F1F5F9', flex: 1 },
  statusBar: {
    backgroundColor: '#1D4ED8',
    height: 44,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 4,
  },
  statusTime: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  statusIcons: { flexDirection: 'row', alignItems: 'center' },
  icon: { marginHorizontal: 3 },
  batteryText: { color: '#fff', fontSize: 12, marginLeft: 4 },
  header: {
    backgroundColor: '#1D4ED8',
    paddingVertical: 60,
    alignItems: 'center',
  },
  headerText: { fontSize: 22, color: '#fff', fontWeight: 'bold' },
  body: { padding: 16 },
  newDevicesLabel: {
    color: '#475569',
    fontWeight: '600',
    marginBottom: 12,
    marginLeft: 4,
  },
  addDeviceBox: {
    backgroundColor: '#1D4ED8',
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    borderRadius: 6,
  },
  plus: { color: '#fff', fontSize: 20, marginRight: 8 },
  addText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  deviceCard: {
    backgroundColor: '#fff',
    width: '48%',
    padding: 16,
    paddingBottom: 24,
    marginBottom: 16,
    alignItems: 'center',
    borderRadius: 8,
    elevation: 1,
    minHeight: 220,
  },
  deviceIcon: {
    width: 40,
    height: 40,
    marginBottom: 8,
    resizeMode: 'contain',
  },
  deviceName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 2,
  },
  deviceStatus: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  deviceDetail: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  removeButton: {
    marginTop: 8,
    backgroundColor: '#DC2626',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 6,
  },
  removeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});