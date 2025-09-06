import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://192.168.100.30:8000/api/';
const WS_URL = 'ws://192.168.100.30:8000/ws/security/';

export default function NotificationScreen() {
  const [notifications, setNotifications] = useState([]);
  const router = useRouter();

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
        if (error.response && error.response.status === 401) {
          await AsyncStorage.clear();
          router.push('/signin');
        }
      }
    };
    fetchNotifications();
  }, []);

  // Dynamic color + icon based on notification type
  const getNotificationStyle = (type) => {
    const base = {
      backgroundColor: '#F8FAFC',
      borderColor: '#E2E8F0',
    };
    const colorMap = {
      motion: '#facc15',
      smoke: '#ef4444',
      glass: '#3b82f6',
      fire: '#dc2626',
      gas: '#9ca3af',
      temperature: '#f97316',
      water: '#14b8a6',
      window: '#8b5cf6',
      door: '#0d9488',
      intruder: '#f97316',
    };
    return { ...base, borderLeftColor: colorMap[type] || '#94a3b8', borderLeftWidth: 6 };
  };

  const getIcon = (type) => {
    switch (type) {
      case 'motion': return <Ionicons name="walk" size={22} color="#1f2937" />;
      case 'smoke': return <MaterialCommunityIcons name="smoke-detector" size={22} color="#1f2937" />;
      case 'glass': return <FontAwesome5 name="glass-whiskey" size={22} color="#1f2937" />;
      case 'fire': return <Ionicons name="flame" size={22} color="#1f2937" />;
      case 'gas': return <MaterialCommunityIcons name="gas-cylinder" size={22} color="#1f2937" />;
      case 'temperature': return <Ionicons name="thermometer" size={22} color="#1f2937" />;
      case 'water': return <Ionicons name="water" size={22} color="#1f2937" />;
      case 'window': return <Ionicons name="md-window" size={22} color="#1f2937" />;
      case 'door': return <FontAwesome5 name="door-open" size={22} color="#1f2937" />;
      case 'intruder': return <MaterialCommunityIcons name="account-alert" size={22} color="#1f2937" />;
      default: return <Ionicons name="alert-circle-outline" size={22} color="#1f2937" />;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notifications</Text>
      <ScrollView contentContainerStyle={styles.notificationsList}>
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <View
              key={notification.id}
              style={[styles.notificationCard, getNotificationStyle(notification.message.toLowerCase().includes('motion') ? 'motion' : notification.message.toLowerCase().includes('door') ? 'door' : 'default')]}
            >
              <View style={styles.iconBox}>
                {getIcon(notification.message.toLowerCase().includes('motion') ? 'motion' : notification.message.toLowerCase().includes('door') ? 'door' : 'default')}
              </View>
              <Text style={styles.notificationText}>{notification.message}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.noNotifications}>No notifications available.</Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 20,
  },
  notificationsList: {
    paddingBottom: 60,
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    marginBottom: 12,
    borderRadius: 10,
    borderWidth: 1,
    backgroundColor: '#F8FAFC',
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
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
  notificationText: {
    fontSize: 15,
    color: '#0F172A',
    flex: 1,
    flexWrap: 'wrap',
  },
  noNotifications: {
    textAlign: 'center',
    color: '#64748B',
    marginTop: 20,
  },
});