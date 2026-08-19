import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, TextInput, Modal, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Avatar from '../../components/Avatar';
import Card from '../../components/Card';
import colors from '../../utils/colors';
import { db } from '../../services/firebase';
import { collection, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';

const DoctorVerificationScreen = ({ route, navigation }) => {
  const [doctorsList, setDoctorsList] = useState([]);
  const [filter, setFilter] = useState(route?.params?.initialFilter || 'all'); // 'all', 'pending', 'verified'
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Edit Doctor Modal State
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [editSpecialty, setEditSpecialty] = useState('');
  const [editFee, setEditFee] = useState('');
  const [editExp, setEditExp] = useState('');
  const [editBio, setEditBio] = useState('');

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'doctors'), (snapshot) => {
      const docs = [];
      snapshot.forEach((d) => {
        docs.push({ id: d.id, ...d.data() });
      });
      setDoctorsList(docs);
      setLoading(false);
    }, (err) => {
      console.error('Error fetching doctors from Firestore:', err);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const handleVerify = async (doctor) => {
    try {
      await updateDoc(doc(db, 'doctors', doctor.id), {
        isVerified: true
      });
      const msg = `${doctor.name || 'Doctor'} has been verified and is active on HealthConnect.`;
      if (Platform.OS === 'web') window.alert(msg);
      else Alert.alert('Verified', msg);
    } catch (e) {
      console.error('Verification error:', e);
      if (Platform.OS === 'web') window.alert('Failed to verify doctor: ' + e.message);
      else Alert.alert('Error', e.message);
    }
  };

  const handleRevoke = async (doctor) => {
    try {
      await updateDoc(doc(db, 'doctors', doctor.id), {
        isVerified: false
      });
      const msg = `Verification revoked for ${doctor.name || 'Doctor'}.`;
      if (Platform.OS === 'web') window.alert(msg);
      else Alert.alert('Revoked', msg);
    } catch (e) {
      console.error('Revocation error:', e);
    }
  };

  const handleToggleOnline = async (doctor) => {
    try {
      await updateDoc(doc(db, 'doctors', doctor.id), {
        isOnline: !doctor.isOnline
      });
    } catch (e) {
      console.error('Toggle online error:', e);
    }
  };

  const handleDeleteDoctor = (doctor) => {
    const confirmDelete = async () => {
      try {
        await deleteDoc(doc(db, 'doctors', doctor.id));
        const msg = `${doctor.name || 'Doctor'} was removed from the system.`;
        if (Platform.OS === 'web') window.alert(msg);
        else Alert.alert('Deleted', msg);
      } catch (e) {
        console.error('Delete doctor error:', e);
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm(`Are you sure you want to permanently delete "${doctor.name}"? This action cannot be undone.`)) {
        confirmDelete();
      }
    } else {
      Alert.alert(
        'Delete Doctor',
        `Are you sure you want to permanently delete "${doctor.name}" from Firestore?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: confirmDelete }
        ]
      );
    }
  };

  const openEditModal = (doctor) => {
    setSelectedDoctor(doctor);
    setEditSpecialty(doctor.specialty || 'General Practitioner');
    setEditFee(doctor.consultationFee ? String(doctor.consultationFee) : '40');
    setEditExp(doctor.experience ? String(doctor.experience) : '5');
    setEditBio(doctor.bio || '');
    setEditModalVisible(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedDoctor) return;
    try {
      await updateDoc(doc(db, 'doctors', selectedDoctor.id), {
        specialty: editSpecialty.trim(),
        consultationFee: Number(editFee) || 40,
        experience: Number(editExp) || 5,
        bio: editBio.trim()
      });
      setEditModalVisible(false);
      if (Platform.OS === 'web') window.alert('Doctor details updated successfully!');
      else Alert.alert('Updated', 'Doctor details updated successfully!');
    } catch (e) {
      console.error('Update doctor error:', e);
      if (Platform.OS === 'web') window.alert('Update failed: ' + e.message);
      else Alert.alert('Error', e.message);
    }
  };

  const filteredDoctors = doctorsList.filter((docItem) => {
    const nameMatch = (docItem.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                      (docItem.specialty || '').toLowerCase().includes(searchQuery.toLowerCase());
    if (!nameMatch) return false;
    if (filter === 'pending') return docItem.isVerified === false;
    if (filter === 'verified') return docItem.isVerified === true;
    return true;
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Doctor Management</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{filteredDoctors.length}</Text>
        </View>
      </View>

      {/* Search and Filters */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color={colors.textLight} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search doctors by name or specialty..."
            placeholderTextColor={colors.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={colors.textLight} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.filterRow}>
          {[
            { key: 'all', label: `All (${doctorsList.length})` },
            { key: 'pending', label: `Pending (${doctorsList.filter(d => d.isVerified === false).length})` },
            { key: 'verified', label: `Verified (${doctorsList.filter(d => d.isVerified === true).length})` }
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.filterTab, filter === tab.key && styles.filterTabActive]}
              onPress={() => setFilter(tab.key)}
            >
              <Text style={[styles.filterTabText, filter === tab.key && styles.filterTabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ marginTop: 12, color: colors.textSecondary }}>Loading doctors from Firestore...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredDoctors}
          keyExtractor={(item) => item.id}
          style={{ flex: 1 }}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="medical-outline" size={48} color={colors.textLight} />
              <Text style={styles.emptyTitle}>No doctors found</Text>
              <Text style={styles.emptySubtitle}>
                {filter === 'pending'
                  ? 'There are no pending doctor verifications at this time.'
                  : 'Doctors who register will appear here for management.'}
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <Card style={styles.docCard}>
              <View style={styles.cardHeader}>
                <Avatar uri={item.avatar} name={item.name || 'Doctor'} size={50} />
                <View style={styles.docInfo}>
                  <View style={styles.nameRow}>
                    <Text style={styles.docName}>{item.name || 'Dr. Specialist'}</Text>
                    {item.isVerified ? (
                      <View style={styles.verifiedBadge}>
                        <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                        <Text style={styles.verifiedText}>Verified</Text>
                      </View>
                    ) : (
                      <View style={styles.pendingBadge}>
                        <Ionicons name="time" size={14} color={colors.emergency} />
                        <Text style={styles.pendingText}>Pending</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.docSpecialty}>{item.specialty || 'General Practitioner'}</Text>
                  <Text style={styles.docEmail}>{item.email || 'doctor@healthconnect.com'}</Text>
                </View>
              </View>

              {/* Stats & Meta */}
              <View style={styles.metaRow}>
                <View style={styles.metaChip}>
                  <Ionicons name="cash-outline" size={14} color={colors.primary} />
                  <Text style={styles.metaText}>${item.consultationFee || 40} / visit</Text>
                </View>
                <View style={styles.metaChip}>
                  <Ionicons name="briefcase-outline" size={14} color="#3B82F6" />
                  <Text style={styles.metaText}>{item.experience || 5} yrs exp</Text>
                </View>
                <TouchableOpacity
                  style={[styles.metaChip, item.isOnline ? styles.onlineChip : styles.offlineChip]}
                  onPress={() => handleToggleOnline(item)}
                >
                  <View style={[styles.statusDot, { backgroundColor: item.isOnline ? '#10B981' : colors.textLight }]} />
                  <Text style={[styles.metaText, { color: item.isOnline ? '#10B981' : colors.textLight }]}>
                    {item.isOnline ? 'Online' : 'Offline'}
                  </Text>
                </TouchableOpacity>
              </View>

              {item.bio ? <Text style={styles.bioText} numberOfLines={2}>{item.bio}</Text> : null}

              {/* Admin Action Bar */}
              <View style={styles.cardActions}>
                {item.isVerified ? (
                  <TouchableOpacity
                    style={[styles.btnAction, styles.btnRevoke]}
                    onPress={() => handleRevoke(item)}
                  >
                    <Ionicons name="close-circle-outline" size={16} color={colors.emergency} />
                    <Text style={styles.btnRevokeText}>Revoke</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={[styles.btnAction, styles.btnVerify]}
                    onPress={() => handleVerify(item)}
                  >
                    <Ionicons name="checkmark-circle-outline" size={16} color={colors.white} />
                    <Text style={styles.btnVerifyText}>Approve & Verify</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[styles.btnAction, styles.btnEdit]}
                  onPress={() => openEditModal(item)}
                >
                  <Ionicons name="create-outline" size={16} color="#3B82F6" />
                  <Text style={styles.btnEditText}>Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.btnAction, styles.btnDelete]}
                  onPress={() => handleDeleteDoctor(item)}
                >
                  <Ionicons name="trash-outline" size={16} color={colors.emergency} />
                  <Text style={styles.btnDeleteText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </Card>
          )}
        />
      )}

      {/* Edit Doctor Modal */}
      <Modal visible={editModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Doctor Details</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSub}>{selectedDoctor?.name}</Text>

            <Text style={styles.inputLabel}>Medical Specialty</Text>
            <TextInput
              style={styles.modalInput}
              value={editSpecialty}
              onChangeText={setEditSpecialty}
              placeholder="e.g. Cardiologist, Dermatologist"
            />

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Fee ($)</Text>
                <TextInput
                  style={styles.modalInput}
                  value={editFee}
                  onChangeText={setEditFee}
                  keyboardType="numeric"
                  placeholder="40"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Experience (Yrs)</Text>
                <TextInput
                  style={styles.modalInput}
                  value={editExp}
                  onChangeText={setEditExp}
                  keyboardType="numeric"
                  placeholder="5"
                />
              </View>
            </View>

            <Text style={styles.inputLabel}>Doctor Bio</Text>
            <TextInput
              style={[styles.modalInput, { height: 70, textAlignVertical: 'top' }]}
              value={editBio}
              onChangeText={setEditBio}
              multiline
              placeholder="Doctor clinical bio..."
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalCancel]}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalSave]}
                onPress={handleSaveEdit}
              >
                <Text style={styles.modalSaveText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
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
  countBadge: {
    backgroundColor: colors.primaryFaded,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12
  },
  countText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primary
  },
  searchSection: {
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 42,
    marginBottom: 10
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: colors.textPrimary,
    marginLeft: 8
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8
  },
  filterTab: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border
  },
  filterTabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary
  },
  filterTabTextActive: {
    color: colors.white
  },
  listContainer: {
    padding: 16,
    paddingBottom: 32
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center'
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 12
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 6
  },
  docCard: {
    padding: 16,
    marginBottom: 14,
    borderRadius: 14
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  docInfo: {
    flex: 1,
    marginLeft: 12
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  docName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary
  },
  docSpecialty: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
    marginTop: 2
  },
  docEmail: {
    fontSize: 11,
    color: colors.textLight,
    marginTop: 2
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 4
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#10B981'
  },
  pendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.emergencyFaded,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 4
  },
  pendingText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.emergency
  },
  metaRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    flexWrap: 'wrap'
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4
  },
  onlineChip: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)'
  },
  offlineChip: {
    backgroundColor: colors.background
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3
  },
  metaText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary
  },
  bioText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 10,
    lineHeight: 16
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border
  },
  btnAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    gap: 4
  },
  btnVerify: {
    backgroundColor: colors.primary,
    flex: 1.4
  },
  btnVerifyText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '700'
  },
  btnRevoke: {
    backgroundColor: colors.emergencyFaded,
    flex: 1.2
  },
  btnRevokeText: {
    color: colors.emergency,
    fontSize: 12,
    fontWeight: '700'
  },
  btnEdit: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    flex: 1
  },
  btnEditText: {
    color: '#3B82F6',
    fontSize: 12,
    fontWeight: '700'
  },
  btnDelete: {
    backgroundColor: colors.emergencyFaded,
    flex: 1
  },
  btnDeleteText: {
    color: colors.emergency,
    fontSize: 12,
    fontWeight: '700'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary
  },
  modalSub: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: 16
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 4,
    marginTop: 8
  },
  modalInput: {
    backgroundColor: colors.background,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: colors.textPrimary
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center'
  },
  modalCancel: {
    backgroundColor: colors.background
  },
  modalCancelText: {
    color: colors.textSecondary,
    fontWeight: '700',
    fontSize: 13
  },
  modalSave: {
    backgroundColor: colors.primary
  },
  modalSaveText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 13
  }
});

export default DoctorVerificationScreen;
