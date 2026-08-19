import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Linking, useWindowDimensions, Modal, FlatList, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Avatar from '../../components/Avatar';
import colors from '../../utils/colors';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/firebase';
import { doc, deleteDoc, collection, addDoc, query, where, onSnapshot } from 'firebase/firestore';

const HealthRecordsScreen = ({ navigation }) => {
  const { height: windowHeight } = useWindowDimensions();
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('vault'); // 'vault' or 'prescriptions'
  
  // Share Modal State
  const [isShareModalVisible, setIsShareModalVisible] = useState(false);
  const [recordToShare, setRecordToShare] = useState(null);
  const [shareDoctors, setShareDoctors] = useState([]);
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    const userId = user?.uid || user?.id || 'patient_user';
    
    // Subscribe to records in real-time
    const qRecords = query(collection(db, 'records'), where('patientId', '==', String(userId)));
    const unsubRecords = onSnapshot(qRecords, (snapshot) => {
      const recList = [];
      snapshot.forEach(docSnap => {
        recList.push({ id: docSnap.id, ...docSnap.data() });
      });
      recList.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      setRecords(recList);
      setLoading(false);
    }, (err) => {
      console.error('Error listening to records:', err);
      setLoading(false);
    });

    // Subscribe to prescriptions in real-time
    const qPresc = query(collection(db, 'prescriptions'), where('patientId', '==', String(userId)));
    const unsubPresc = onSnapshot(qPresc, (snapshot) => {
      const prescList = [];
      snapshot.forEach(docSnap => {
        prescList.push({ id: docSnap.id, ...docSnap.data() });
      });
      prescList.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      setPrescriptions(prescList);
    }, (err) => {
      console.error('Error listening to prescriptions:', err);
    });

    return () => {
      unsubRecords();
      unsubPresc();
    };
  }, [user]);

  const handleUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true
      });

      if (result.canceled) return;
      const file = result.assets[0];

      setLoading(true);

      let fileDataUrl = '';
      if (Platform.OS === 'web' && file.file) {
        // Read file as base64 data URL
        const reader = new FileReader();
        fileDataUrl = await new Promise((resolve, reject) => {
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(file.file);
        });
      } else {
        // Mobile fetch to blob then base64 or URI
        fileDataUrl = file.uri;
      }

      const userId = user?.uid || user?.id || 'patient_user';
      const isPdfFile = file.mimeType?.includes('pdf') || file.name.endsWith('.pdf');

      await addDoc(collection(db, 'records'), {
        patientId: String(userId),
        title: file.name,
        type: isPdfFile ? 'pdf' : 'xray',
        fileUrl: fileDataUrl,
        size: file.size || 0,
        date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
        createdAt: new Date().toISOString()
      });

      if (Platform.OS === 'web') window.alert('File uploaded and secured successfully.');
      else Alert.alert('Success', 'File uploaded and secured successfully.');
    } catch (error) {
      console.error('Upload error:', error);
      if (Platform.OS === 'web') window.alert('There was a problem uploading your document: ' + error.message);
      else Alert.alert('Upload Failed', 'There was a problem uploading your document: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id, fileName) => {
    const executeDelete = async () => {
      try {
        setLoading(true);
        await deleteDoc(doc(db, 'records', String(id)));
        if (Platform.OS === 'web') window.alert('Record deleted successfully.');
        else Alert.alert('Success', 'Record deleted successfully.');
      } catch (error) {
        console.error('Delete error:', error);
      } finally {
        setLoading(false);
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm(`Are you sure you want to permanently delete "${fileName}"?`)) {
        executeDelete();
      }
    } else {
      Alert.alert(
        'Delete Record',
        `Are you sure you want to permanently delete "${fileName}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: executeDelete }
        ]
      );
    }
  };

  const getFileIcon = (fileUrl, type) => {
    if (type === 'pdf') return 'document-text';
    if (!fileUrl) return 'document-text';
    const ext = fileUrl.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext) || fileUrl.startsWith('data:image')) return 'image';
    return 'document-text';
  };

  const isPdf = (fileUrl, type) => type === 'pdf' || getFileIcon(fileUrl, type) === 'document-text';

  const handleOpen = (fileUrl) => {
    if (!fileUrl) {
      Alert.alert('Notice', 'No file data attached to this record.');
      return;
    }
    if (Platform.OS === 'web') {
      const win = window.open();
      if (win) {
        win.document.write(`<iframe src="${fileUrl}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
      } else {
        window.location.href = fileUrl;
      }
    } else {
      Linking.openURL(fileUrl).catch(() => {
        Alert.alert('Notice', 'Could not open file URL.');
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Health Vault & Records</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'vault' && styles.activeTab]}
          onPress={() => setActiveTab('vault')}
        >
          <Ionicons name="folder-open" size={18} color={activeTab === 'vault' ? colors.primary : colors.textLight} />
          <Text style={[styles.tabText, activeTab === 'vault' && styles.activeTabText]}>
            Documents ({records.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'prescriptions' && styles.activeTab]}
          onPress={() => setActiveTab('prescriptions')}
        >
          <Ionicons name="receipt" size={18} color={activeTab === 'prescriptions' ? colors.primary : colors.textLight} />
          <Text style={[styles.tabText, activeTab === 'prescriptions' && styles.activeTabText]}>
            Prescriptions ({prescriptions.length})
          </Text>
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContainer} style={{ flex: 1 }}>
          {activeTab === 'vault' ? (
            <View>
              {/* Upload Drop Area */}
              <TouchableOpacity style={styles.uploadArea} onPress={handleUpload} activeOpacity={0.7}>
                <Ionicons name="cloud-upload-outline" size={44} color={colors.primary} />
                <Text style={styles.uploadTitle}>Upload New Document</Text>
                <Text style={styles.uploadSub}>Supports PDF, JPG, PNG up to 10MB</Text>
              </TouchableOpacity>

              <Text style={styles.sectionTitle}>Uploaded Files ({records.length})</Text>

              {loading ? (
                <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 30 }} />
              ) : records.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Ionicons name="folder-outline" size={48} color={colors.textLight} />
                  <Text style={styles.emptyText}>No Documents Uploaded</Text>
                  <Text style={styles.emptySubText}>Upload your medical reports, test results, or diagnostic scans.</Text>
                </View>
              ) : (
                records.map((item) => (
                  <Card key={item.id} style={styles.recordCard}>
                    <TouchableOpacity style={styles.recordMain} onPress={() => handleOpen(item.fileUrl)}>
                      <View style={[styles.fileIconBox, { backgroundColor: isPdf(item.fileUrl, item.type) ? 'rgba(230,57,70,0.1)' : 'rgba(59,130,246,0.1)' }]}>
                        <Ionicons
                          name={getFileIcon(item.fileUrl, item.type)}
                          size={24}
                          color={isPdf(item.fileUrl, item.type) ? colors.emergency : '#3B82F6'}
                        />
                      </View>
                      <View style={styles.recordInfo}>
                        <Text style={styles.fileName} numberOfLines={1}>{item.title}</Text>
                        <Text style={styles.fileDate}>{item.date}</Text>
                        <Badge text={(item.type || 'DOCUMENT').toUpperCase()} variant="info" style={styles.catBadge} />
                      </View>
                    </TouchableOpacity>

                    <View style={styles.actionButtons}>
                      <TouchableOpacity style={styles.iconBtn} onPress={() => handleOpen(item.fileUrl)}>
                        <Ionicons name="eye-outline" size={20} color={colors.primary} />
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.iconBtn} onPress={() => handleDelete(item.id, item.title)}>
                        <Ionicons name="trash-outline" size={20} color={colors.emergency} />
                      </TouchableOpacity>
                    </View>
                  </Card>
                ))
              )}
            </View>
          ) : (
            <View>
              <Text style={styles.sectionTitle}>Prescription History ({prescriptions.length})</Text>
              {loading ? (
                <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 30 }} />
              ) : prescriptions.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Ionicons name="receipt-outline" size={48} color={colors.textLight} />
                  <Text style={styles.emptyText}>No Prescriptions Found</Text>
                  <Text style={styles.emptySubText}>Prescriptions issued by your doctors will appear here.</Text>
                </View>
              ) : (
                prescriptions.map((item) => (
                  <Card key={item.id} style={styles.prescCard}>
                    <TouchableOpacity
                      style={styles.prescRow}
                      onPress={() => navigation.navigate('PrescriptionDetail', { prescription: item })}
                    >
                      <View style={styles.prescIconBox}>
                        <Ionicons name="medical" size={24} color={colors.primary} />
                      </View>
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={styles.prescDoctor}>{item.doctor?.name || item.doctorName || 'Dr. Fahim Ahmed'}</Text>
                        <Text style={styles.prescSpecialty}>{item.doctor?.specialty || 'General Practitioner'}</Text>
                        <Text style={styles.prescDate}>{new Date(item.createdAt || Date.now()).toLocaleDateString()}</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
                    </TouchableOpacity>
                  </Card>
                ))
              )}
            </View>
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: 16
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent'
  },
  activeTab: {
    borderBottomColor: colors.primary
  },
  tabText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textSecondary
  },
  activeTabText: {
    color: colors.primary
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40
  },
  uploadArea: {
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    borderRadius: 16,
    padding: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(42, 157, 143, 0.04)',
    marginBottom: 24
  },
  uploadTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 10
  },
  uploadSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4
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
  recordMain: {
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
  fileDate: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2
  },
  catBadge: {
    marginTop: 4,
    alignSelf: 'flex-start'
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  iconBtn: {
    padding: 6
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
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(42, 157, 143, 0.1)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  prescDoctor: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary
  },
  prescSpecialty: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
    marginTop: 2
  },
  prescDate: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2
  }
});

export default HealthRecordsScreen;
