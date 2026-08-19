import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Linking, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Avatar from '../../components/Avatar';
import colors from '../../utils/colors';
import { db } from '../../services/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';

const PatientVaultScreen = ({ navigation, route }) => {
  const { height: windowHeight } = useWindowDimensions();
  const { patientId, patientName } = route.params || {};
  const [patientProfile, setPatientProfile] = useState(null);
  const [records, setRecords] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatientData();
  }, [patientId]);

  const fetchPatientData = async () => {
    try {
      setLoading(true);
      if (patientId) {
        // Fetch patient profile
        try {
          const userDoc = await getDoc(doc(db, 'users', String(patientId)));
          if (userDoc.exists()) {
            setPatientProfile(userDoc.data());
          }
        } catch (e) {
          console.log('Error fetching user profile:', e);
        }

        // Fetch records
        try {
          const qRecords = query(collection(db, 'records'), where('patientId', '==', String(patientId)));
          const recSnap = await getDocs(qRecords);
          const recList = [];
          recSnap.forEach(d => recList.push({ id: d.id, ...d.data() }));
          setRecords(recList);
        } catch (e) {
          console.log('Error fetching records:', e);
        }

        // Fetch past prescriptions
        try {
          const qPresc = query(collection(db, 'prescriptions'), where('patientId', '==', String(patientId)));
          const prescSnap = await getDocs(qPresc);
          const prescList = [];
          prescSnap.forEach(d => prescList.push({ id: d.id, ...d.data() }));
          setPrescriptions(prescList);
        } catch (e) {
          console.log('Error fetching prescriptions:', e);
        }
      }
    } catch (error) {
      console.error('Error in fetchPatientData:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (fileUrl) => {
    if (!fileUrl) return 'document-text';
    const ext = fileUrl.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) return 'image';
    return 'document-text';
  };

  const isPdf = (fileUrl) => getFileIcon(fileUrl) === 'document-text';

  const handleOpen = (fileUrl) => {
    if (!fileUrl) {
      Alert.alert('Notice', 'No file attached to this record.');
      return;
    }
    Linking.openURL(fileUrl).catch(() => {
      Alert.alert('Notice', 'Could not open file URL.');
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{patientName ? `${patientName}'s Health Vault` : 'Patient Health Vault'}</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContainer} style={{ flex: 1 }}>
          <View style={styles.infoBanner}>
            <Ionicons name="shield-checkmark" size={20} color={colors.primary} />
            <Text style={styles.infoText}>Encrypted Patient Medical Record Access</Text>
          </View>

          {/* Patient Emergency Medical Vitals Card */}
          <Card style={styles.vitalsCard}>
            <View style={styles.vitalsHeader}>
              <Avatar uri={patientProfile?.avatar} name={patientName || 'Patient'} size={50} />
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={styles.patientTitleName}>{patientName || patientProfile?.name || 'Patient'}</Text>
                <Text style={styles.patientSub}>{patientProfile?.email || 'Registered Patient'}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.vitalsGrid}>
              <View style={styles.vitalBox}>
                <Text style={styles.vitalLabel}>BLOOD GROUP</Text>
                <Text style={[styles.vitalVal, { color: colors.emergency }]}>{patientProfile?.bloodType || 'O+'}</Text>
              </View>
              <View style={styles.vitalBox}>
                <Text style={styles.vitalLabel}>AGE</Text>
                <Text style={styles.vitalVal}>{patientProfile?.age ? `${patientProfile.age} yrs` : '26 yrs'}</Text>
              </View>
              <View style={styles.vitalBox}>
                <Text style={styles.vitalLabel}>KNOWN ALLERGIES</Text>
                <Text style={styles.vitalVal}>{patientProfile?.allergies?.length ? patientProfile.allergies.join(', ') : 'None'}</Text>
              </View>
            </View>
          </Card>

          {/* Uploaded Documents */}
          <Text style={styles.sectionTitle}>Medical Reports & Documents ({records.length})</Text>
          {loading ? (
            <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
          ) : records.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="folder-open-outline" size={44} color={colors.textLight} />
              <Text style={styles.emptyText}>No Lab Reports Uploaded</Text>
              <Text style={styles.emptySubText}>The patient has not attached outside lab reports.</Text>
            </View>
          ) : (
            records.map((item) => (
              <Card key={item.id} style={styles.recordCard}>
                <TouchableOpacity style={styles.cardLeft} onPress={() => handleOpen(item.fileUrl)}>
                  <View style={[styles.fileIconBox, { backgroundColor: isPdf(item.fileUrl) ? 'rgba(230,57,70,0.1)' : 'rgba(59,130,246,0.1)' }]}>
                    <Ionicons
                      name={getFileIcon(item.fileUrl)}
                      size={24}
                      color={isPdf(item.fileUrl) ? colors.emergency : '#3B82F6'}
                    />
                  </View>
                  <View style={styles.recordInfo}>
                    <Text style={styles.fileName} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.metaText}>{item.date || new Date().toLocaleDateString()}</Text>
                    <Badge text={(item.type || 'DOCUMENT').toUpperCase()} variant="info" style={styles.catBadge} />
                  </View>
                </TouchableOpacity>
                <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
              </Card>
            ))
          )}

          {/* Past Prescriptions */}
          <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Prescription History ({prescriptions.length})</Text>
          {prescriptions.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="receipt-outline" size={44} color={colors.textLight} />
              <Text style={styles.emptyText}>No Previous Prescriptions</Text>
            </View>
          ) : (
            prescriptions.map((presc) => (
              <Card key={presc.id} style={styles.prescCard}>
                <TouchableOpacity
                  style={styles.prescRow}
                  onPress={() => navigation.navigate('PrescriptionDetail', { prescription: presc })}
                >
                  <View style={styles.prescIconBox}>
                    <Ionicons name="medical" size={22} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.prescTitle}>Prescription #{String(presc.id).slice(0, 6)}</Text>
                    <Text style={styles.prescDate}>{new Date(presc.createdAt || Date.now()).toLocaleDateString()}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
                </TouchableOpacity>
              </Card>
            ))
          )}
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
  scrollContainer: {
    padding: 20,
    paddingBottom: 40
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(42, 157, 143, 0.1)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    gap: 8
  },
  infoText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary
  },
  vitalsCard: {
    padding: 16,
    borderRadius: 14,
    marginBottom: 24
  },
  vitalsHeader: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  patientTitleName: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.textPrimary
  },
  patientSub: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 14
  },
  vitalsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  vitalBox: {
    flex: 1,
    alignItems: 'center'
  },
  vitalLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 0.5,
    marginBottom: 4
  },
  vitalVal: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 12
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    backgroundColor: colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 10
  },
  emptySubText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: 'center'
  },
  recordCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 14,
    marginBottom: 10
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  fileIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  recordInfo: {
    marginLeft: 12,
    flex: 1
  },
  fileName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary
  },
  metaText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2
  },
  catBadge: {
    marginTop: 4,
    alignSelf: 'flex-start'
  },
  prescCard: {
    padding: 14,
    borderRadius: 14,
    marginBottom: 10
  },
  prescRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  prescIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(42, 157, 143, 0.1)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  prescTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary
  },
  prescDate: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2
  }
});

export default PatientVaultScreen;
