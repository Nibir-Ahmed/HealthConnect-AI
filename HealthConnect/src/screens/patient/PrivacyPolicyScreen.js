import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../utils/colors';

const PrivacyPolicyScreen = ({ navigation }) => {
  const { height: windowHeight } = useWindowDimensions();
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={{ width: 40 }} />
      </View>
      <View style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content} style={{ flex: 1 }}>
        <Text style={styles.title}>HealthConnect Privacy Policy</Text>
        <Text style={styles.lastUpdated}>Last Updated: July 2026</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Data Collection</Text>
          <Text style={styles.paragraph}>
            HealthConnect collects information that you provide directly to us, such as your name, email, medical history, blood type, allergies, and emergency contact details. This data is required to provide the core services of the app.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Use of Information</Text>
          <Text style={styles.paragraph}>
            The information we collect is used to:
            {'\n'}• Maintain your digital Medical ID.
            {'\n'}• Facilitate doctor appointments and consultations.
            {'\n'}• Improve our healthcare services and user experience.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Data Security</Text>
          <Text style={styles.paragraph}>
            We implement advanced security measures to protect your medical information. All patient records are encrypted at rest and in transit. However, no electronic transmission over the internet or information storage technology can be guaranteed to be 100% secure.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Sharing of Information</Text>
          <Text style={styles.paragraph}>
            We do not sell your personal data. We may share your information only with verified medical professionals within the HealthConnect platform when you explicitly grant them access or book an appointment.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Your Rights</Text>
          <Text style={styles.paragraph}>
            You have the right to access, update, or delete your personal and medical data at any time through the "Edit Profile" section of the app. 
          </Text>
        </View>

      </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  backBtn: {
    padding: 4,
    marginLeft: -4
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary
  },
  content: {
    padding: 24,
    paddingBottom: 40
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 8
  },
  lastUpdated: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 32
  },
  section: {
    marginBottom: 24
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primaryDark,
    marginBottom: 12
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 24,
    color: colors.textSecondary
  }
});

export default PrivacyPolicyScreen;
