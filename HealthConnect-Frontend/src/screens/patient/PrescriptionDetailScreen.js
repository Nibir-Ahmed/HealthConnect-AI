import React from 'react';
import { View, Text, StyleSheet,  ScrollView, TouchableOpacity, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Card from '../../components/Card';
import colors from '../../utils/colors';

const PrescriptionDetailScreen = ({ route, navigation }) => {
  const { height: windowHeight } = useWindowDimensions();
  const { prescription } = route.params;

  let parsedMedications = [];
  try {
    parsedMedications = typeof prescription.medications === 'string' 
      ? JSON.parse(prescription.medications) 
      : prescription.medications;
  } catch (e) {
    console.error("Failed to parse medications", e);
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Prescription Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContainer} style={{ flex: 1 }}>
        <Card style={styles.infoCard}>
          <Text style={styles.label}>DATE ISSUED</Text>
          <Text style={styles.value}>{new Date(prescription.createdAt).toLocaleDateString()}</Text>
          
          <View style={styles.divider} />
          
          <Text style={styles.label}>DOCTOR ID (Issuer)</Text>
          <Text style={styles.value}>Dr. ID: {prescription.doctorId}</Text>
        </Card>

        <Text style={styles.sectionTitle}>Medications</Text>
        {parsedMedications.map((med, index) => (
          <Card key={index} style={styles.medCard}>
            <View style={styles.medHeader}>
              <Ionicons name="medical" size={24} color={colors.primary} />
              <Text style={styles.medName}>{med.name}</Text>
            </View>
            <View style={styles.medDetails}>
              <View style={styles.medInfoBox}>
                <Text style={styles.medLabel}>Dosage</Text>
                <Text style={styles.medValue}>{med.dosage}</Text>
              </View>
              <View style={styles.medInfoBox}>
                <Text style={styles.medLabel}>Duration</Text>
                <Text style={styles.medValue}>{med.duration}</Text>
              </View>
              <View style={styles.medInfoBox}>
                <Text style={styles.medLabel}>Frequency</Text>
                <Text style={styles.medValue}>{med.frequency}</Text>
              </View>
            </View>
          </Card>
        ))}

        {prescription.notes ? (
          <View>
            <Text style={styles.sectionTitle}>Doctor's Advice</Text>
            <Card style={styles.adviceCard}>
              <Text style={styles.adviceText}>{prescription.notes}</Text>
            </Card>
          </View>
        ) : null}
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
  infoCard: {
    padding: 16,
    marginBottom: 24
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 0.5,
    marginBottom: 4
  },
  value: {
    fontSize: 15,
    color: colors.textPrimary,
    fontWeight: '500'
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12,
    marginTop: 8
  },
  medCard: {
    padding: 16,
    marginBottom: 16
  },
  medHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
  },
  medName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginLeft: 12
  },
  medDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 8
  },
  medInfoBox: {
    flex: 1,
    alignItems: 'center'
  },
  medLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginBottom: 4
  },
  medValue: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center'
  },
  adviceCard: {
    padding: 16,
    backgroundColor: 'rgba(59,130,246,0.05)',
    borderColor: 'rgba(59,130,246,0.2)',
    borderWidth: 1
  },
  adviceText: {
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 22
  }
});

export default PrescriptionDetailScreen;
