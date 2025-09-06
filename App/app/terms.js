import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function TermsAndConditionsScreen() {
  const router = useRouter();
  const [isChecked, setIsChecked] = useState(false);

  const handleAccept = () => {
    if (isChecked) {
      router.back();
    } else {
      alert('Please accept the terms and conditions.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Terms And Conditions</Text>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.paragraph}>
          Welcome to SafeHaven — your trusted companion for security and protection. By installing and using our application, you agree to the terms outlined below, confirming that you understand and accept them. Our mission is to provide you with reliable tools that enhance your safety and help safeguard your home, workplace, or other property.
        </Text>

        <Text style={styles.paragraph}>
          When using the SafeHaven app, you agree to do so responsibly and in compliance with all relevant laws and privacy regulations. You may not use the app to track or monitor individuals without their clear consent. The app is intended strictly for personal or authorized security purposes, such as monitoring your home, ensuring workplace safety, or protecting property you own or manage. Any attempt to invade someone’s privacy may result in immediate account termination and potential legal consequences.
        </Text>

        <Text style={styles.paragraph}>
          We take your privacy and data security seriously. Any personal information you share with us — including login credentials, preferences, or device settings — is encrypted and securely stored. We do not sell, rent, or share your data with unauthorized third parties. You remain in control of your data at all times and may request its deletion by contacting our support team.
        </Text>

        <Text style={styles.paragraph}>
          SafeHaven provides real-time monitoring and security alerts to help you respond quickly to potential threats. While we strive for optimal performance and uptime, certain conditions such as internet outages or device malfunctions may delay alerts. It’s your responsibility to ensure your device remains connected to the internet and that necessary permissions, such as push notifications, are enabled to receive timely updates.
        </Text>

        <Text style={styles.paragraph}>
          You're responsible for keeping your SafeHaven account secure. This means protecting your login details and not sharing them with others. If you detect any unauthorized access or suspicious behavior, please report it to us right away. If you wish to deactivate or delete your account, you can do so through the app or by contacting our support team. All related security data will be removed accordingly.
        </Text>

        <Text style={styles.paragraph}>
          To keep the platform safe for everyone, users are strictly prohibited from engaging in activities such as illegal spying, harassment, or unauthorized surveillance. You must not modify or misuse the system in ways that could pose a risk to others. Attempts to hack, reverse-engineer, or tamper with any part of the app or its underlying systems are also forbidden. Violations of these rules may lead to account suspension and potential legal action.
        </Text>

        <Text style={styles.paragraph}>
          We may occasionally update the app to improve your experience. These updates might include new features, bug fixes, or security improvements. By continuing to use the app after such updates, you automatically accept any revised terms that come with them.
        </Text>

        <Text style={styles.paragraph}>
          It’s important to understand that while SafeHaven is designed to support your security, it does not guarantee complete protection. We are not liable for any loss, damage, or incident that may occur due to system failures, delayed alerts, or misuse of the app. SafeHaven should be used as part of a comprehensive safety strategy — not as your only line of defense.
        </Text>

        <Text style={styles.paragraph}>
          If you break these terms, we reserve the right to suspend or delete your account without prior notice. In serious cases of misuse or unauthorized activity, we may take legal action to protect our users and platform.
        </Text>

        <View style={styles.checkboxContainer}>
          <TouchableOpacity onPress={() => setIsChecked(!isChecked)} style={styles.checkboxWrapper}>
            <View style={[styles.checkbox, isChecked && styles.checkboxChecked]}>
              {isChecked && <Ionicons name="checkmark" size={16} color="#fff" />}
            </View>
            <Text style={styles.checkboxText}>I accept all the terms and conditions</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.acceptButton} onPress={handleAccept}>
          <Text style={styles.acceptButtonText}>Accept</Text>
        </TouchableOpacity>
      </ScrollView>
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
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  headerText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  content: {
    padding: 20,
  },
  paragraph: {
    fontSize: 14,
    color: '#334155',
    marginBottom: 15,
    lineHeight: 22,
  },
  checkboxContainer: {
    marginTop: 20,
    marginBottom: 20,
  },
  checkboxWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#1D4ED8',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkboxChecked: {
    backgroundColor: '#1D4ED8',
  },
  checkboxText: {
    fontSize: 14,
    color: '#334155',
  },
  acceptButton: {
    backgroundColor: '#1D4ED8',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
