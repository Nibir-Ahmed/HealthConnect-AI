import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, useWindowDimensions, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Card from '../../components/Card';
import colors from '../../utils/colors';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/firebase';
import { collection, addDoc } from 'firebase/firestore';

const PrescriptionScreen = ({ route, navigation }) => {
  const { height: windowHeight } = useWindowDimensions();
  const { user } = useAuth();
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

      await addDoc(collection(db, 'prescriptions'), {
        patientId: String(patientId || 'patient_user'),
        patientName: patientName,
        appointmentId: appointmentId ? String(appointmentId) : '',
        doctorId: user?.uid || user?.id || 'doc_cardiology_1',
        doctor: {
          id: user?.uid || user?.id || 'doc_cardiology_1',
          name: user?.name || 'Dr. Fahim Ahmed',
          specialty: user?.specialty || 'General Practitioner'
        },
        medications: medications,
        notes: advice,
        createdAt: new Date().toISOString()
      });

      if (Platform.OS === 'web') {
        window.alert(`Success: Prescription has been sent to ${patientName} and logged in their health vault.`);
        navigation.goBack();
      } else {
        Alert.alert('Success', 'Prescription has been sent to the patient and logged in their health vault.', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      }
    } catch (error) {
      console.error('Error issuing prescription in Firestore:', error);
      Alert.alert('Error', 'Failed to issue prescription: ' + error.message);
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

        {/* Prescription Form */}
        <Text style={styles.sectionTitle}>Add Medication Details</Text>
        
        <Input
          label="Medicine Name & Generic"
          placeholder="e.g. Amoxicillin / Paracetamol"
          value={medName}
          onChangeText={setMedName}
          icon="medical-outline"
        />

        <View style={styles.row}>
          <View style={styles.col}>
            <Input
              label="Dosage"
              placeholder="e.g. 500mg"
              value={dosage}
              onChangeText={setDosage}
              icon="fitness-outline"
            />
          </View>
          <View style={styles.col}>
            <Input
              label="Frequency"
              placeholder="e.g. 1-0-1"
              value={freq}
              onChangeText={setFreq}
              icon="time-outline"
            />
          </View>
        </View>

        <Input
          label="Duration"
          placeholder="e.g. 5 Days / 2 Weeks"
          value={duration}
          onChangeText={setDuration}
          icon="calendar-outline"
        />

        <Text style={styles.sectionTitle}>Doctor's Advice & Guidelines</Text>
        <Input
          placeholder="e.g. Take medicine after food. Drink plenty of water and rest."
          value={advice}
          onChangeText={setAdvice}
          multiline
          numberOfLines={3}
          style={styles.adviceInput}
        />

        <Button
          title="Issue Digital Prescription"
          onPress={handleSubmit}
          loading={loading}
          style={styles.submitBtn}
        />
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
    paddingVertical: 14,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  backBtn: {
    padding: 4
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40
  },
  patientCard: {
    padding: 16,
    borderRadius: 14,
    marginBottom: 20
  },
  patientLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 0.5,
    marginBottom: 4
  },
  patientName: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary
  },
  patientSub: {
    fontSize: 12,
    color: colors.primary,
    marginTop: 2,
    fontWeight: '600'
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 10,
    marginBottom: 12
  },
  row: {
    flexDirection: 'row',
    gap: 12
  },
  col: {
    flex: 1
  },
  adviceInput: {
    height: 80,
    textAlignVertical: 'top'
  },
  submitBtn: {
    marginTop: 24
  }
});

export default PrescriptionScreen;
