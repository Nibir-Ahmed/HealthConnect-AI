import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Linking, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import colors from '../../utils/colors';
import api from '../../services/api';

const PatientVaultScreen = ({ navigation, route }) => {
  const { height: windowHeight } = useWindowDimensions();
  const { patientId, patientName } = route.params || {};
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVaultRecords();
  }, [patientId]);

  const fetchVaultRecords = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/records/ehr?patientId=${patientId}`);
      setRecords(res.data);
    } catch (error) {
      console.error('Error fetching patient records:', error);
      Alert.alert('Error', 'Failed to load patient health data.');
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
      Alert.alert('Error', 'No file attached to this record.');
      return;
    }
    const backendUrl = api.defaults.baseURL.replace('/api', '');
    const fullUrl = fileUrl.startsWith('http') ? fileUrl : `${backendUrl}${fileUrl}`;
    Linking.openURL(fullUrl).catch(() => {
      Alert.alert('Error', 'Could not open this file.');
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{patientName ? `${patientName}'s Vault` : 'Patient Vault'}</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContainer} style={{ flex: 1 }}>
        <View style={styles.infoBanner}>
          <Ionicons name="shield-checkmark" size={20} color={colors.primary} />
          <Text style={styles.infoText}>You are viewing secure patient records.</Text>
        </View>

        <Text style={styles.sectionTitle}>Shared Documents ({records.length})</Text>

        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
        ) : records.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="folder-open-outline" size={48} color={colors.textLight} />
            <Text style={styles.emptyText}>Vault is empty</Text>
            <Text style={styles.emptySubText}>The patient has not uploaded any documents.</Text>
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
              <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
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
  infoBanner: {
    flexDirection: 'row',
    backgroundColor: colors.primaryFaded,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24
  },
  infoText: {
    marginLeft: 8,
    color: colors.primaryDark,
    fontSize: 13,
    fontWeight: '500'
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
  catBadge: {
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start'
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
  }
});

export default PatientVaultScreen;
