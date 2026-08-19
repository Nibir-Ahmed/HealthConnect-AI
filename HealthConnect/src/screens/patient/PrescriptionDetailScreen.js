import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import Card from '../../components/Card';
import colors from '../../utils/colors';

const PrescriptionDetailScreen = ({ route, navigation }) => {
  const { height: windowHeight } = useWindowDimensions();
  const { prescription } = route.params;

  let parsedMedications = [];
  try {
    parsedMedications = typeof prescription.medications === 'string' 
      ? JSON.parse(prescription.medications) 
      : (prescription.medications || []);
  } catch (e) {
    console.error("Failed to parse medications", e);
  }

  const doctorName = prescription.doctor?.name || prescription.doctorName || 'Dr. Fahim Ahmed';
  const doctorSpecialty = prescription.doctor?.specialty || 'General Practitioner';
  const patientName = prescription.patient?.name || prescription.patientName || 'Patient';
  const issuedDate = new Date(prescription.createdAt || Date.now()).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  const generatePrescriptionHtml = () => `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
        <style>
          @page { margin: 20mm; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            color: #1a202c;
            background: #fff;
            padding: 30px;
            margin: 0;
          }
          .presc-container {
            border: 2px solid #2a9d8f;
            border-radius: 12px;
            padding: 30px;
            position: relative;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #2a9d8f;
            padding-bottom: 20px;
            margin-bottom: 20px;
          }
          .clinic-brand {
            color: #2a9d8f;
            font-size: 26px;
            font-weight: 800;
            letter-spacing: -0.5px;
            margin: 0;
          }
          .clinic-sub {
            color: #718096;
            font-size: 12px;
            margin-top: 4px;
          }
          .doc-info {
            text-align: right;
          }
          .doc-name {
            font-size: 18px;
            font-weight: 700;
            color: #2d3748;
            margin: 0;
          }
          .doc-spec {
            color: #2a9d8f;
            font-size: 13px;
            font-weight: 600;
          }
          .patient-bar {
            background: #f7fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 12px 18px;
            display: flex;
            justify-content: space-between;
            margin-bottom: 25px;
          }
          .patient-item {
            font-size: 13px;
          }
          .patient-label {
            color: #a0aec0;
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
          }
          .patient-val {
            font-weight: 600;
            color: #2d3748;
          }
          .rx-symbol {
            font-size: 32px;
            font-weight: 900;
            font-family: serif;
            color: #2a9d8f;
            margin-bottom: 10px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
          }
          th {
            background: #edf2f7;
            color: #4a5568;
            font-size: 12px;
            font-weight: 700;
            text-align: left;
            padding: 10px 14px;
            border-bottom: 2px solid #cbd5e0;
          }
          td {
            padding: 12px 14px;
            font-size: 13px;
            border-bottom: 1px solid #e2e8f0;
          }
          .med-name {
            font-weight: 700;
            color: #2d3748;
          }
          .advice-section {
            background: #f0fdf4;
            border-left: 4px solid #2a9d8f;
            padding: 14px 18px;
            border-radius: 4px;
            margin-bottom: 40px;
          }
          .advice-title {
            font-size: 13px;
            font-weight: 700;
            color: #2a9d8f;
            margin-bottom: 6px;
          }
          .advice-body {
            font-size: 13px;
            color: #2d3748;
            line-height: 1.5;
          }
          .footer-signature {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            margin-top: 50px;
            padding-top: 20px;
            border-top: 1px dashed #cbd5e0;
          }
          .stamp {
            border: 2px solid #2a9d8f;
            color: #2a9d8f;
            padding: 8px 16px;
            font-size: 11px;
            font-weight: 800;
            border-radius: 6px;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .sig-line {
            width: 180px;
            text-align: center;
          }
          .sig-text {
            border-top: 1px solid #718096;
            padding-top: 4px;
            font-size: 12px;
            color: #718096;
          }
        </style>
      </head>
      <body>
        <div class="presc-container">
          <div class="header">
            <div>
              <h1 class="clinic-brand">HealthConnect Medical Center</h1>
              <div class="clinic-sub">Digital Healthcare & Clinical Telemedicine Platform</div>
            </div>
            <div class="doc-info">
              <h2 class="doc-name">${doctorName}</h2>
              <div class="doc-spec">${doctorSpecialty}</div>
              <div class="clinic-sub">Registration ID: BMDC-98421</div>
            </div>
          </div>

          <div class="patient-bar">
            <div class="patient-item">
              <div class="patient-label">Patient Name</div>
              <div class="patient-val">${patientName}</div>
            </div>
            <div class="patient-item">
              <div class="patient-label">Date Issued</div>
              <div class="patient-val">${issuedDate}</div>
            </div>
            <div class="patient-item">
              <div class="patient-label">Prescription ID</div>
              <div class="patient-val">RX-${String(prescription.id || '101').slice(0, 8).toUpperCase()}</div>
            </div>
          </div>

          <div class="rx-symbol">℞</div>

          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Medicine / Generic Name</th>
                <th>Dosage</th>
                <th>Frequency</th>
                <th>Duration</th>
              </tr>
            </thead>
            <tbody>
              ${parsedMedications.map((med, idx) => `
                <tr>
                  <td>${idx + 1}</td>
                  <td class="med-name">${med.name || 'Medicine'}</td>
                  <td>${med.dosage || '1 Tablet'}</td>
                  <td>${med.frequency || 'After meals'}</td>
                  <td>${med.duration || '5 days'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          ${prescription.notes ? `
            <div class="advice-section">
              <div class="advice-title">Doctor's Clinical Instructions & Dietary Advice:</div>
              <div class="advice-body">${prescription.notes}</div>
            </div>
          ` : ''}

          <div class="footer-signature">
            <div class="stamp">✓ Verified Digital Prescription</div>
            <div class="sig-line">
              <div style="font-family: cursive; font-size: 18px; color: #2a9d8f; margin-bottom: 2px;">${doctorName}</div>
              <div class="sig-text">Authorized Doctor Signature</div>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  const handlePrint = async () => {
    try {
      if (Platform.OS === 'web') {
        await Print.printAsync({ html: generatePrescriptionHtml() });
        return;
      }
      const file = await Print.printToFileAsync({ html: generatePrescriptionHtml() });
      if (file && file.uri) {
        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
          await Sharing.shareAsync(file.uri, {
            UTI: '.pdf',
            mimeType: 'application/pdf',
            dialogTitle: 'Download Printable Prescription PDF'
          });
        } else {
          Alert.alert('Success', 'PDF generated successfully.');
        }
      }
    } catch (err) {
      console.error('Prescription print error:', err);
      Alert.alert('Print Error', 'Could not generate prescription document.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Digital Prescription</Text>
        <TouchableOpacity style={styles.printHeaderBtn} onPress={handlePrint}>
          <Ionicons name="print-outline" size={22} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContainer} style={{ flex: 1 }}>
          {/* Top Banner with Print Button */}
          <View style={styles.printBanner}>
            <View style={styles.printBannerLeft}>
              <View style={styles.rxBadge}>
                <Text style={styles.rxText}>℞</Text>
              </View>
              <View>
                <Text style={styles.printBannerTitle}>Official Medical Prescription</Text>
                <Text style={styles.printBannerSub}>Issued by {doctorName}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.printBtn} onPress={handlePrint} activeOpacity={0.8}>
              <Ionicons name="print" size={16} color={colors.white} />
              <Text style={styles.printBtnText}>Print PDF</Text>
            </TouchableOpacity>
          </View>

          <Card style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.infoCol}>
                <Text style={styles.label}>PATIENT</Text>
                <Text style={styles.value}>{patientName}</Text>
              </View>
              <View style={styles.infoCol}>
                <Text style={styles.label}>DATE ISSUED</Text>
                <Text style={styles.value}>{issuedDate}</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <View style={styles.infoCol}>
                <Text style={styles.label}>DOCTOR</Text>
                <Text style={styles.value}>{doctorName}</Text>
                <Text style={styles.subValue}>{doctorSpecialty}</Text>
              </View>
              <View style={styles.infoCol}>
                <Text style={styles.label}>PRESCRIPTION ID</Text>
                <Text style={styles.value}>RX-{String(prescription.id || '101').slice(0, 8).toUpperCase()}</Text>
              </View>
            </View>
          </Card>

          <Text style={styles.sectionTitle}>Prescribed Medications ({parsedMedications.length})</Text>
          {parsedMedications.map((med, index) => (
            <Card key={index} style={styles.medCard}>
              <View style={styles.medHeader}>
                <View style={styles.medIconBox}>
                  <Ionicons name="medical" size={20} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.medName}>{med.name}</Text>
                  <Text style={styles.medSub}>{med.dosage}</Text>
                </View>
              </View>
              <View style={styles.medDetails}>
                <View style={styles.medInfoBox}>
                  <Text style={styles.medLabel}>Frequency</Text>
                  <Text style={styles.medValue}>{med.frequency || 'After meals'}</Text>
                </View>
                <View style={styles.medInfoBox}>
                  <Text style={styles.medLabel}>Duration</Text>
                  <Text style={styles.medValue}>{med.duration || '5 Days'}</Text>
                </View>
              </View>
            </Card>
          ))}

          {prescription.notes ? (
            <View>
              <Text style={styles.sectionTitle}>Doctor's Clinical Instructions</Text>
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
  printHeaderBtn: {
    padding: 6
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40
  },
  printBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(42, 157, 143, 0.2)',
    boxShadow: '0px 2px 8px rgba(0,0,0,0.04)',
    elevation: 2
  },
  printBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  rxBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(42, 157, 143, 0.12)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  rxText: {
    fontSize: 20,
    fontWeight: '900',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    color: colors.primary
  },
  printBannerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary
  },
  printBannerSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2
  },
  printBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6
  },
  printBtnText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '700'
  },
  infoCard: {
    padding: 16,
    borderRadius: 14,
    marginBottom: 20
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  infoCol: {
    flex: 1
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 0.5,
    marginBottom: 4
  },
  value: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary
  },
  subValue: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
    marginTop: 2
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 12
  },
  medCard: {
    padding: 16,
    borderRadius: 14,
    marginBottom: 12
  },
  medHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12
  },
  medIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(42, 157, 143, 0.1)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  medName: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary
  },
  medSub: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2
  },
  medDetails: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: 10,
    padding: 10,
    justifyContent: 'space-around'
  },
  medInfoBox: {
    alignItems: 'center'
  },
  medLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary
  },
  medValue: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 2
  },
  adviceCard: {
    padding: 16,
    borderRadius: 14,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary
  },
  adviceText: {
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 20
  }
});

export default PrescriptionDetailScreen;
