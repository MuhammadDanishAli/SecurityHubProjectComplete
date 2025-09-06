import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView, Alert, StatusBar } from 'react-native';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://192.168.100.30:8000/api/';
const WS_URL = 'ws://192.168.100.30:8000/ws/security/';

export default function HomeScreen() {
  const [armMode, setArmMode] = useState('Disarm');
  const [devices, setDevices] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const fetchMode = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          console.error('No token found in AsyncStorage');
          router.push('/signin');
          return;
        }
        const response = await axios.get(`${API_URL}mode/`, {
          headers: { Authorization: `Token ${token}` },
          timeout: 10000,
        });
        const mode = response.data.message.split(' ').slice(-2)[0];
        setArmMode(mode.charAt(0).toUpperCase() + mode.slice(1));
      } catch (error) {
        console.error('Error fetching mode:', error.message);
        setArmMode('Disarm');
        if (error.response && error.response.status === 401) {
          await AsyncStorage.clear();
          router.push('/signin');
        } else {
          Alert.alert('Error', 'Unable to fetch system mode.');
        }
      }
    };
    fetchMode();
  }, []);

  useEffect(() => {
    const fetchDevices = async () => {
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
        const deviceList = Object.keys(response.data.data).map((nodeId, index) => ({
          id: index + 1,
          node_id: nodeId,
          sensor_type: response.data.data[nodeId].type || 'unknown',
          status: response.data.data[nodeId].connected ? 'connected' : 'not connected',
          value: response.data.data[nodeId].value,
          unit: response.data.data[nodeId].unit,
          timestamp: response.data.data[nodeId].timestamp,
        }));
        setDevices(deviceList);
      } catch (error) {
        console.error('Failed to load devices:', error.message);
        setDevices([]);
        if (error.response && error.response.status === 401) {
          await AsyncStorage.clear();
          router.push('/signin');
        } else {
          Alert.alert('Error', 'Unable to fetch devices.');
        }
      }
    };
    fetchDevices();
  }, []);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          console.error('No token found in AsyncStorage');
          router.push('/signin');
          return;
        }
        const response = await axios.get(`${API_URL}notifications/?client_id=1`, {
          headers: { Authorization: `Token ${token}` },
          timeout: 10000,
        });
        setNotifications(response.data);
      } catch (error) {
        console.error('Failed to load notifications:', error.message);
        setNotifications([]);
        if (error.response && error.response.status === 401) {
          await AsyncStorage.clear();
          router.push('/signin');
        } else {
          Alert.alert('Error', 'Unable to fetch notifications.');
        }
      }
    };
    fetchNotifications();
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
          sensor_type: message.data[nodeId].type || 'unknown',
          status: message.data[nodeId].connected ? 'connected' : 'not connected',
          value: message.data[nodeId].value,
          unit: message.data[nodeId].unit,
          timestamp: message.data[nodeId].timestamp,
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

  const updateMode = async (newMode) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.error('No token found in AsyncStorage');
        router.push('/signin');
        return;
      }
      await axios.post(`${API_URL}mode/`, { mode: newMode.toLowerCase() }, {
        headers: { Authorization: `Token ${token}` },
        timeout: 10000,
      });
      setArmMode(newMode);
    } catch (error) {
      console.error('Error updating mode:', error.message);
      if (error.response && error.response.status === 401) {
        await AsyncStorage.clear();
        router.push('/signin');
      } else {
        Alert.alert('Error', 'Unable to update mode.');
      }
    }
  };

  const removeDevice = async (deviceId) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.error('No token found in AsyncStorage');
        router.push('/signin');
        return;
      }
      await axios.delete(`${API_URL}devices/${deviceId}/?client_id=1`, {
        headers: { Authorization: `Token ${token}` },
        timeout: 10000,
      });
      const response = await axios.get(`${API_URL}sensor-status/?client_id=1`, {
        headers: { Authorization: `Token ${token}` },
        timeout: 10000,
      });
      const deviceList = Object.keys(response.data.data).map((nodeId, index) => ({
        id: index + 1,
        node_id: nodeId,
        sensor_type: response.data.data[nodeId].type || 'unknown',
        status: response.data.data[nodeId].connected ? 'connected' : 'not connected',
        value: response.data.data[nodeId].value,
        unit: response.data.data[nodeId].unit,
        timestamp: response.data.data[nodeId].timestamp,
      }));
      setDevices(deviceList);
    } catch (error) {
      console.error('Failed to remove device:', error.message);
      if (error.response && error.response.status === 401) {
        await AsyncStorage.clear();
        router.push('/signin');
      } else {
        Alert.alert('Error', 'Failed to remove device.');
      }
    }
  };

  const getStatusIcon = () => {
    switch (armMode) {
      case 'Disarm': return require('../assets/images/disarm.png');
      case 'Stay': return require('../assets/images/arm stay.png');
      case 'Away': return require('../assets/images/arm away.png');
      default: return require('../assets/images/arm away.png');
    }
  };

  const getStatusColor = () => {
    switch (armMode) {
      case 'Disarm': return '#22C55E';
      case 'Stay': return '#F59E0B';
      case 'Away': return '#DC2626';
      default: return '#DC2626';
    }
  };

  const getDeviceIcon = (type) => {
    switch (type) {
      case 'motion': return <Ionicons name="walk" size={24} color="#0F172A" />;
      case 'vibration': return <MaterialCommunityIcons name="vibrate" size={24} color="#0F172A" />;
      case 'temperature': return <Ionicons name="thermometer" size={24} color="#0F172A" />;
      case 'humidity': return <MaterialCommunityIcons name="water-percent" size={24} color="#0F172A" />;
      default: return <Ionicons name="alert-circle" size={24} color="#0F172A" />;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#1D4ED8" barStyle="light-content" />

      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Image source={require('../assets/images/home 12.png')} style={styles.headerIcon} />
          <Text style={styles.headerTitle}>
            {armMode === 'Stay' ? 'Arm Stay' : armMode === 'Away' ? 'Arm Away' : 'Disarm'}
          </Text>
        </View>

        <TouchableOpacity style={styles.addDeviceBtn} onPress={() => router.push('/devices')}>
          <Text style={styles.addDeviceText}>+ Add device</Text>
        </TouchableOpacity>

        <View style={styles.statusContainer}>
          <Image source={getStatusIcon()} style={styles.statusIcon} />
          <Text style={styles.statusTitle}>System</Text>
          <Text style={[styles.statusText, { color: getStatusColor() }]}>
            {armMode === 'Stay' ? 'Arm Stay' : armMode === 'Away' ? 'Arm Away' : 'Disarm'}
          </Text>
        </View>

        <View style={styles.modeButtons}>
          <TouchableOpacity style={styles.modeBox} onPress={() => updateMode('Disarm')}>
            <Image source={require('../assets/images/disarm.png')} style={styles.modeIcon} />
            <Text style={styles.modeLabel}>Disarm</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.modeBox} onPress={() => updateMode('Stay')}>
            <Image source={require('../assets/images/arm stay.png')} style={styles.modeIcon} />
            <Text style={styles.modeLabel}>Arm Stay</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.modeBox} onPress={() => updateMode('Away')}>
            <Image source={require('../assets/images/arm away.png')} style={styles.modeIcon} />
            <Text style={styles.modeLabel}>Arm Away</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.notificationsContainer}>
          <Text style={styles.notificationsTitle}>Recent Notifications</Text>
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <View key={notification.id} style={styles.notificationItem}>
                <Ionicons name="alert-circle" size={24} color="#DC2626" style={styles.notificationIcon} />
                <View style={styles.notificationInfo}>
                  <Text style={styles.notificationMessage}>{notification.message}</Text>
                  <Text style={styles.notificationTimestamp}>{new Date(notification.timestamp).toLocaleString()}</Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.noNotificationsText}>No recent notifications.</Text>
          )}
        </View>

        <View style={styles.devicesContainer}>
          <Text style={styles.devicesTitle}>Devices</Text>
          {devices.length > 0 ? (
            devices.map((device) => (
              <View key={device.id} style={styles.deviceItem}>
                <View style={styles.iconBox}>
                  {getDeviceIcon(device.sensor_type)}
                </View>
                <View style={styles.deviceInfo}>
                  <Text style={styles.deviceName}>{`Sensor ${device.node_id}`}</Text>
                  <Text style={styles.deviceDetail}>Type: {device.sensor_type}</Text>
                  <Text style={styles.deviceDetail}>Status: {device.status}</Text>
                  <Text style={styles.deviceDetail}>Value: {device.value} {device.unit}</Text>
                  <Text style={styles.deviceDetail}>Last Updated: {device.timestamp ? new Date(device.timestamp).toLocaleString() : 'N/A'}</Text>
                </View>
                <TouchableOpacity
                  style={styles.removeBtn}
                  onPress={() => {
                    Alert.alert(
                      'Confirm Removal',
                      `Remove Sensor ${device.node_id}?`,
                      [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Remove', onPress: () => removeDevice(device.node_id) },
                      ]
                    );
                  }}
                >
                  <Text style={styles.removeText}>Remove</Text>
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <Text style={styles.noDevicesText}>No devices found.</Text>
          )}
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/')}>
          <Ionicons
            name="home-outline"
            size={24}
            color={pathname === '/' ? '#1D4ED8' : '#94A3B8'}
          />
          <Text style={[styles.navText, { color: pathname === '/' ? '#1D4ED8' : '#94A3B8' }]}>
            Home
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/notificationscreen')}>
          <Ionicons
            name="notifications-outline"
            size={24}
            color={pathname === '/notificationscreen' ? '#1D4ED8' : '#94A3B8'}
          />
          <Text style={[styles.navText, { color: pathname === '/notificationscreen' ? '#1D4ED8' : '#94A3B8' }]}>
            Notification
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/profile')}>
          <Ionicons
            name="person-outline"
            size={24}
            color={pathname === '/profile' ? '#1D4ED8' : '#94A3B8'}
          />
          <Text style={[styles.navText, { color: pathname === '/profile' ? '#1D4ED8' : '#94A3B8' }]}>
            Me
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContainer: { flex: 1 },
  scrollContent: { paddingBottom: 90 },
  header: {
    backgroundColor: '#1D4ED8',
    paddingTop: 20,
    paddingBottom: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIcon: { width: 50, height: 50, marginBottom: 10 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#FFFFFF' },
  addDeviceBtn: {
    backgroundColor: '#1D4ED8',
    borderRadius: 10,
    marginHorizontal: 20,
    marginVertical: 20,
    paddingVertical: 10,
    alignItems: 'center',
  },
  addDeviceText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  statusContainer: { alignItems: 'center', marginVertical: 20 },
  statusIcon: { width: 60, height: 60, marginBottom: 10 },
  statusTitle: { fontSize: 18, fontWeight: 'bold', color: '#0F172A' },
  statusText: { fontSize: 16, fontWeight: 'bold', marginTop: 4 },
  modeButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  modeBox: { alignItems: 'center', padding: 5, width: 90 },
  modeIcon: { width: 36, height: 36, marginBottom: 5 },
  modeLabel: { fontSize: 14, fontWeight: '600', color: '#0F172A', textAlign: 'center' },
  notificationsContainer: { marginHorizontal: 20, marginBottom: 20 },
  notificationsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 10,
    marginTop: 10,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  notificationIcon: { marginRight: 12 },
  notificationInfo: { flex: 1 },
  notificationMessage: { fontSize: 16, fontWeight: '600', color: '#0F172A' },
  notificationTimestamp: { fontSize: 14, color: '#64748B', marginTop: 2 },
  noNotificationsText: { textAlign: 'center', color: '#64748B', marginTop: 20 },
  devicesContainer: { marginHorizontal: 20, marginBottom: 20 },
  devicesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 10,
    marginTop: 10,
  },
  deviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'space-between',
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  deviceInfo: { flex: 1 },
  deviceName: { fontSize: 16, fontWeight: '600', color: '#0F172A' },
  deviceDetail: { fontSize: 14, color: '#64748B', marginTop: 2 },
  noDevicesText: { textAlign: 'center', color: '#64748B', marginTop: 20 },
  removeBtn: {
    backgroundColor: '#DC2626',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  removeText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  bottomBar: {
    height: 70,
    backgroundColor: '#F8FAFC',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: '#E2E8F0',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  navItem: { alignItems: 'center', justifyContent: 'center' },
  navText: { fontSize: 12, marginTop: 4 },
});