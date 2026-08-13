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
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

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

  const fetchData = async () => {
    try {
      setLoading(true);
      const [recordsRes, prescriptionsRes] = await Promise.all([
        api.get('/records/ehr'),
        api.get('/prescriptions/patient')
      ]);
      setRecords(recordsRes.data);
      setPrescriptions(prescriptionsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      Alert.alert('Error', 'Failed to load health data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true
      });

      if (result.canceled) return;
      const file = result.assets[0];

      // Prepare form data
      const formData = new FormData();
      if (Platform.OS === 'web' && file.file) {
        formData.append('file', file.file);
      } else if (Platform.OS === 'web') {
        const res = await fetch(file.uri);
        const blob = await res.blob();
        formData.append('file', blob, file.name);
      } else {
        formData.append('file', {
          uri: file.uri,
          name: file.name,
          type: file.mimeType || 'application/octet-stream',
        });
      }
      formData.append('title', file.name);
      formData.append('type', file.mimeType?.includes('pdf') ? 'general' : 'xray');

      setLoading(true);
      await api.post('/records/ehr', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      Alert.alert('Success', 'File uploaded and secured successfully.');
      fetchData();
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Upload Failed', 'There was a problem uploading your document.');
      setLoading(false);
    }
  };

  const handleDelete = (id, fileName) => {
    Alert.alert(
      'Delete Record',
      `Are you sure you want to permanently delete "${fileName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await api.delete(`/records/ehr/${id}`);
              setRecords((prev) => prev.filter((item) => item.id !== id));
            } catch (error) {
              console.error('Delete error:', error);
              Alert.alert('Error', 'Failed to delete record.');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const getFileIcon = (fileUrl) => {
    if (!fileUrl) return 'document-text';
    const ext = fileUrl.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) return 'image';
    return 'document-text';
  };

  const isPdf = (fileUrl) => getFileIcon(fileUrl) === 'document-text';

  const openShareModal = async (record) => {
    setRecordToShare(record);
    setIsShareModalVisible(true);
    try {
      setSharing(true);
      const res = await api.get('/chat/inbox');
      // Filter inbox to just doctors
      const doctors = res.data.filter(item => item.partner.role === 'doctor').map(item => item.partner);
      setShareDoctors(doctors);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to fetch doctors.');
    } finally {
      setSharing(false);
    }
  };

  const shareRecord = async (doctorId) => {
    try {
      setSharing(true);
      await api.post('/chat/send', {
        receiverId: doctorId,
        content: `I've shared a health record with you: ${recordToShare.title}`,
        attachmentUrl: recordToShare.fileUrl,
        attachmentType: 'file'
      });
      Alert.alert('Success', 'Record shared successfully.');
      setIsShareModalVisible(false);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to share record.');
    } finally {
      setSharing(false);
    }
  };

  const handleOpen = (fileUrl) => {
    if (!fileUrl) {
      Alert.alert('Error', 'No file attached to this record.');
      return;
    }
    const backendUrl = api.defaults.baseURL.replace('/api', '');
    Linking.openURL(`${backendUrl}${fileUrl}`).catch(() => {
      Alert.alert('Error', 'Could not open this file.');
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Health Vault</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'vault' && styles.activeTab]} 
          onPress={() => setActiveTab('vault')}
        >
          <Text style={[styles.tabText, activeTab === 'vault' && styles.activeTabText]}>My Vault</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'prescriptions' && styles.activeTab]} 
          onPress={() => setActiveTab('prescriptions')}
        >
          <Text style={[styles.tabText, activeTab === 'prescriptions' && styles.activeTabText]}>Prescriptions</Text>
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContainer} style={{ flex: 1 }}>
        {activeTab === 'vault' ? (
          <>
            {/* Upload Action */}
            <TouchableOpacity style={styles.uploadArea} activeOpacity={0.8} onPress={handleUpload}>
              <Ionicons name="cloud-upload-outline" size={32} color={colors.primary} />
              <Text style={styles.uploadTitle}>Upload New Document</Text>
              <Text style={styles.uploadSubtitle}>Supports PDF, JPG up to 10MB</Text>
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>Uploaded Files ({records.length})</Text>

            {loading ? (
              <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
            ) : records.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="folder-open-outline" size={48} color={colors.textLight} />
                <Text style={styles.emptyText}>Your vault is empty</Text>
                <Text style={styles.emptySubText}>Upload test reports, scans, or prescriptions to keep them safe</Text>
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
                      <View style={styles.metaRow}>
                        <Text style={styles.metaText}>{item.date}</Text>
                      </View>
                      <Badge text={item.type.toUpperCase()} variant="info" style={styles.catBadge} />
                    </View>
                  </TouchableOpacity>

                  <View style={{ flexDirection: 'row' }}>
                    <TouchableOpacity style={styles.actionBtn} onPress={() => openShareModal(item)}>
                      <Ionicons name="share-outline" size={20} color={colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(item.id, item.title)}>
                      <Ionicons name="trash-outline" size={20} color={colors.textLight} />
                    </TouchableOpacity>
                  </View>
                </Card>
              ))
            )}
          </>
        ) : (
          <>
            <Text style={styles.sectionTitle}>Digital Prescriptions ({prescriptions.length})</Text>

            {loading ? (
              <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
            ) : prescriptions.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="medical-outline" size={48} color={colors.textLight} />
                <Text style={styles.emptyText}>No prescriptions found</Text>
                <Text style={styles.emptySubText}>Digital prescriptions issued by your doctors will appear here.</Text>
              </View>
            ) : (
              prescriptions.map((item) => (
                <TouchableOpacity 
                  key={item.id} 
                  activeOpacity={0.8}
                  onPress={() => navigation.navigate('PrescriptionDetail', { prescription: item })}
                >
                  <Card style={styles.recordCard}>
                    <View style={styles.cardLeft}>
                      <View style={[styles.fileIconBox, { backgroundColor: 'rgba(16,185,129,0.1)' }]}>
                        <Ionicons name="document-text-outline" size={24} color="#10B981" />
                      </View>
                      <View style={styles.recordInfo}>
                        <Text style={styles.fileName} numberOfLines={1}>Prescription - {new Date(item.createdAt).toLocaleDateString()}</Text>
                        <View style={styles.metaRow}>
                          <Text style={styles.metaText}>By Dr. ID: {item.doctorId}</Text>
                        </View>
                        <Badge text="DIGITAL RX" variant="success" style={styles.catBadge} />
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={colors.textLight} style={{ marginRight: 8 }} />
                  </Card>
                </TouchableOpacity>
              ))
            )}
          </>
        )}
      </ScrollView>
      </View>

      {/* Share Modal */}
      <Modal visible={isShareModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Share Record</Text>
              <TouchableOpacity onPress={() => setIsShareModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSubtitle}>Select a doctor from your inbox to share {recordToShare?.title}</Text>
            
            {sharing && shareDoctors.length === 0 ? (
              <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 20 }} />
            ) : shareDoctors.length === 0 ? (
              <Text style={styles.emptyText}>You haven't chatted with any doctors yet.</Text>
            ) : (
              <FlatList
                data={shareDoctors}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.doctorItem} onPress={() => shareRecord(item.id)}>
                    <Avatar uri={item.avatar} size={40} />
                    <Text style={styles.doctorName}>{item.name}</Text>
                    <Ionicons name="send" size={20} color={colors.primary} />
                  </TouchableOpacity>
                )}
              />
            )}
            
            {sharing && shareDoctors.length > 0 && (
              <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 10 }} />
            )}
          </View>
        </View>
      </Modal>
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent'
  },
  activeTab: {
    borderBottomColor: colors.primary
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
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
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.primary,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28
  },
  uploadTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 10
  },
  uploadSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 16
  },
  recordCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    padding: 14
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10
  },
  fileIconBox: {
    width: 44,
    height: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  recordInfo: {
    marginLeft: 14,
    flex: 1
  },
  fileName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4
  },
  metaText: {
    fontSize: 11,
    color: colors.textSecondary
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: colors.textLight,
    marginHorizontal: 6
  },
  catBadge: {
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start'
  },
  deleteBtn: {
    padding: 8
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 12
  },
  emptySubText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
    lineHeight: 18
  },
  actionBtn: {
    padding: 8,
    marginLeft: 4
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end'
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary
  },
  modalSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 20
  },
  doctorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  doctorName: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary
  }
});

export default HealthRecordsScreen;
