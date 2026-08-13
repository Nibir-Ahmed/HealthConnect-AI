import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, useWindowDimensions, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Card from '../../components/Card';
import colors from '../../utils/colors';
import api from '../../services/api';

const PrescriptionScreen = ({ route, navigation }) => {
  const { height: windowHeight } = useWindowDimensions();
  const patientName = route.params?.patientName || 'Patient';
  const patientId = route.params?.patientId;
  const appointmentId = route.params?.appointmentId;
  
  const [medName, setMedName] = useState('');
  const [dosage, setDosage] = useState('');
  const [freq, setFreq] = useState('');
  const [duration, setDuration] = useState('');
  const [advice, setAdvice] = useState('');

  const [loading, setLoading] = useState(false);

  const issuePrescription = async () => {
    try {
      setLoading(true);
      const medications = [{
        name: medName,
        dosage: dosage,
        frequency: freq,
        duration: duration
      }];

      await api.post('/prescriptions', {
        patientId,
        appointmentId,
        medications: JSON.stringify(medications),
        notes: advice
      });

      if (Platform.OS === 'web') {
        alert(`Success: Prescription has been sent to ${patientName} and logged in their health vault.`);
        navigation.goBack();
      } else {
        Alert.alert('Success', 'Prescription has been sent to the patient and logged in their health vault.', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      }
    } catch (error) {
      console.error('Error issuing prescription:', error);
      Alert.alert('Error', 'Failed to issue prescription.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!medName || !dosage || !freq || !duration) {
      Alert.alert('Form Error', 'Please complete all medicine details before issuing.');
      return;
    }

    if (Platform.OS === 'web') {
      if (window.confirm(`Are you sure you want to send this prescription to ${patientName}?`)) {
        issuePrescription();
      }
    } else {
      Alert.alert(
        'Issue Prescription',
        `Are you sure you want to send this prescription to ${patientName}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Send', onPress: issuePrescription }
        ]
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Digital Prescription</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        enabled={Platform.OS === 'ios'}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled" style={{ flex: 1 }}>
        {/* Patient card */}
        <Card style={styles.patientCard}>
          <Text style={styles.patientLabel}>PATIENT DETAIL</Text>
          <Text style={styles.patientName}>{patientName}</Text>
          <Text style={styles.patientSub}>Active Consultation</Text>
        </Card>

        {/* Medicine form */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Add Medicine</Text>

          <Input
            label="Search/Select Medicine"
            placeholder="e.g. Metformin 500mg"
            icon="medical-outline"
            value={medName}
            onChangeText={setMedName}
          />

          <View style={styles.formRow}>
            <Input
              label="Dosage"
              placeholder="e.g. 1 Tablet"
              icon="flask-outline"
              value={dosage}
              onChangeText={setDosage}
              style={{ flex: 1 }}
            />
            <View style={{ width: 12 }} />
            <Input
              label="Duration"
              placeholder="e.g. 7 Days"
              icon="calendar-outline"
              value={duration}
              onChangeText={setDuration}
              style={{ flex: 1 }}
            />
          </View>

          <Input
            label="Frequency"
            placeholder="e.g. Once daily after breakfast"
            icon="repeat-outline"
            value={freq}
            onChangeText={setFreq}
          />

          <Input
            label="General Clinical Advice"
            placeholder="e.g. Drink plenty of water and rest."
            icon="information-circle-outline"
            value={advice}
            onChangeText={setAdvice}
            multiline={true}
            numberOfLines={3}
          />
        </View>

        <Button title="Issue Prescription" onPress={handleSubmit} style={styles.submitBtn} />
        </ScrollView>
      </KeyboardAvoidingView>
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
    padding: 4
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40
  },
  patientCard: {
    marginBottom: 24,
    padding: 16
  },
  patientLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 0.5
  },
  patientName: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 6
  },
  patientSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4
  },
  formSection: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 32
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 16
  },
  formRow: {
    flexDirection: 'row',
    width: '100%'
  },
  submitBtn: {
    marginTop: 8
  }
});

export default PrescriptionScreen;
