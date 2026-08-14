import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../utils/colors';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

const HealthVaultModal = ({ visible, onClose, onSelect }) => {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (visible) {
      fetchRecords();
    }
  }, [visible, user]);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const userId = user?.uid || user?.id || 'patient_user';
      const q = query(collection(db, 'records'), where('patientId', '==', String(userId)));
      const snap = await getDocs(q);
      const recList = [];
      snap.forEach(d => recList.push({ id: d.id, ...d.data() }));
      setRecords(recList);
    } catch (error) {
      console.error('Error fetching vault records from Firestore:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (fileUrl) => {
    if (!fileUrl) return 'document-text';
    const ext = fileUrl.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext) || fileUrl.startsWith('data:image')) return 'image';
    return 'document-text';
  };

  const isPdf = (fileUrl) => getFileIcon(fileUrl) === 'document-text';

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.recordItem} 
      onPress={() => onSelect(item)}
    >
      <View style={[styles.fileIconBox, { backgroundColor: isPdf(item.fileUrl) ? 'rgba(230,57,70,0.1)' : 'rgba(59,130,246,0.1)' }]}>
        <Ionicons
          name={getFileIcon(item.fileUrl)}
          size={24}
          color={isPdf(item.fileUrl) ? colors.emergency : '#3B82F6'}
        />
      </View>
      <View style={styles.recordInfo}>
        <Text style={styles.fileName} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.metaText}>{item.date || 'Medical Record'}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Select from Vault</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
          ) : records.length === 0 ? (
            <Text style={styles.emptyText}>Your vault is empty.</Text>
          ) : (
            <FlatList
              data={records}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderItem}
              contentContainerStyle={{ paddingBottom: 20 }}
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end'
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textLight,
    marginVertical: 20,
  },
  recordItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  fileIconBox: {
    width: 44,
    height: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  recordInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  metaText: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 2,
  },
});

export default HealthVaultModal;
