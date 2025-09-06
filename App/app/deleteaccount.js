import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Alert, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_URL = 'http://192.168.100.30:8000/api/';
const WS_URL = 'ws://192.168.100.30:8000/ws/security/';

const DeleteAccountScreen = () => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const router = useRouter();

  const handleDeleteAccount = async () => {
    if (!password) {
      Alert.alert('Error', 'Please enter your password to confirm.');
      return;
    }
    setShowConfirmModal(true);
  };

  const confirmFinalDeletion = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.delete(`${API_URL}delete-account/`, {
        headers: { Authorization: `Token ${token}` },
        data: { password },
      });
      setShowConfirmModal(false);
      Alert.alert('Account Deleted', 'Your account has been successfully deleted.', [
        { text: 'OK', onPress: async () => { await AsyncStorage.clear(); router.replace('/signup'); } },
      ]);
    } catch (error) {
      setShowConfirmModal(false);
      Alert.alert('Error', error.response?.data?.error || 'Failed to delete account.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Delete Account</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>Are You Sure You Want To Delete Your Account?</Text>
        <View style={styles.warningBox}>
          <Text style={styles.warningText}>This action will permanently delete all of your data...</Text>
          <Text style={styles.bullet}>• All sensor data and alert logs will be eliminated.</Text>
          <Text style={styles.bullet}>• Your user profile and settings will be deleted.</Text>
          <Text style={styles.bullet}>• This action cannot be undone.</Text>
        </View>
        <Text style={styles.confirmText}>Please Enter Your Password To Confirm Deletion Of Your Account.</Text>
        <View style={styles.passwordInput}>
          <TextInput
            style={styles.input}
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            placeholderTextColor="#aaa"
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Icon name={showPassword ? 'eye-slash' : 'eye'} size={22} color="#555" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
          <Text style={styles.deleteButtonText}>Yes, Delete Account</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
      <Modal
        animationType="fade"
        transparent={true}
        visible={showConfirmModal}
        onRequestClose={() => setShowConfirmModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Delete Account</Text>
            <Text style={styles.modalSubtitle}>Are You Sure You Want To Delete Your Account?</Text>
            <Text style={styles.modalText}>By deleting your account...</Text>
            <TouchableOpacity style={styles.modalDeleteButton} onPress={confirmFinalDeletion}>
              <Text style={styles.modalDeleteButtonText}>Yes, Delete Account</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalCancelButton} onPress={() => setShowConfirmModal(false)}>
              <Text style={styles.modalCancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    backgroundColor: '#1D4ED8',
    padding: 70,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { color: 'white', fontSize: 18, fontWeight: '600' },
  content: { padding: 20 },
  title: {
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 20,
    color: '#333',
  },
  warningBox: {
    backgroundColor: '#E0E7FF',
    borderRadius: 10,
    padding: 15,
    marginBottom: 25,
  },
  warningText: { color: '#333', marginBottom: 10 },
  bullet: { color: '#333', marginLeft: 10, marginTop: 5 },
  confirmText: { textAlign: 'center', fontSize: 14, marginBottom: 10, color: '#333' },
  passwordInput: {
    flexDirection: 'row',
    backgroundColor: '#f1f1f1',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 20,
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  input: { flex: 1, fontSize: 16, color: '#000' },
  deleteButton: {
    backgroundColor: '#1D4ED8',
    paddingVertical: 14,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 15,
  },
  deleteButtonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  cancelButton: {
    backgroundColor: '#E0E7FF',
    paddingVertical: 14,
    borderRadius: 20,
    alignItems: 'center',
  },
  cancelButtonText: { color: '#1D4ED8', fontWeight: '600', fontSize: 16 },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#000', marginBottom: 8 },
  modalSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  modalText: { fontSize: 13, color: '#333', textAlign: 'center', marginBottom: 20 },
  modalDeleteButton: {
    backgroundColor: '#10B981',
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 30,
    marginBottom: 10,
  },
  modalDeleteButtonText: { color: 'white', fontWeight: '600', fontSize: 16 },
  modalCancelButton: {
    backgroundColor: '#D1FAE5',
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 30,
  },
  modalCancelButtonText: { color: '#047857', fontWeight: '600', fontSize: 16 },
});

export default DeleteAccountScreen;