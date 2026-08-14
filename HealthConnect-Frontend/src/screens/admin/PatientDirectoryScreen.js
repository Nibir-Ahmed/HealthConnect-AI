import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Alert, ActivityIndicator, Platform, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Avatar from '../../components/Avatar';
import Card from '../../components/Card';
import colors from '../../utils/colors';
import { db } from '../../services/firebase';
import { collection, onSnapshot, doc, updateDoc, deleteDoc, setDoc, getDoc } from 'firebase/firestore';

const PatientDirectoryScreen = ({ route, navigation }) => {
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState(route?.params?.initialFilter || 'all'); // 'all', 'patient', 'doctor', 'admin'

  // Role Switch Modal
  const [roleModalVisible, setRoleModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'users'), (snapshot) => {
      const userList = [];
      snapshot.forEach((d) => {
        userList.push({ id: d.id, ...d.data() });
      });
      setUsers(userList);
      setLoading(false);
    }, (err) => {
      console.error('Error fetching users from Firestore:', err);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const handleRoleChange = async (newRole) => {
    if (!selectedUser) return;
    try {
      await updateDoc(doc(db, 'users', selectedUser.id), {
        role: newRole
      });

      // If promoted to doctor, ensure doctor doc exists
      if (newRole === 'doctor') {
        const docRef = doc(db, 'doctors', selectedUser.id);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
          await setDoc(docRef, {
            id: selectedUser.id,
            userId: selectedUser.id,
            name: selectedUser.name ? (selectedUser.name.startsWith('Dr.') ? selectedUser.name : `Dr. ${selectedUser.name}`) : 'Dr. Specialist',
            email: selectedUser.email,
            specialty: 'General Physician',
            avatar: selectedUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedUser.name || 'Doctor')}&background=00A896&color=fff&bold=true`,
            experience: 5,
            rating: 5.0,
            reviews: 0,
            consultationFee: 40,
            bio: 'Verified medical practitioner on HealthConnect.',
            isVerified: true,
            isOnline: true,
            createdAt: new Date().toISOString()
          });
        }
      }

      setRoleModalVisible(false);
      const msg = `Role for ${selectedUser.name} updated to ${newRole.toUpperCase()}.`;
      if (Platform.OS === 'web') window.alert(msg);
      else Alert.alert('Success', msg);
    } catch (e) {
      console.error('Role update error:', e);
      if (Platform.OS === 'web') window.alert('Failed to update role: ' + e.message);
      else Alert.alert('Error', e.message);
    }
  };

  const handleDeleteUser = (userToDelete) => {
    const confirmMessage = `Are you sure you want to permanently delete ${userToDelete.name} (${userToDelete.role}) from Firestore? This cannot be undone.`;
    
    const executeDelete = async () => {
      try {
        await deleteDoc(doc(db, 'users', userToDelete.id));
        // If user was doctor, also delete doctor profile
        if (userToDelete.role === 'doctor') {
          await deleteDoc(doc(db, 'doctors', userToDelete.id)).catch(() => {});
        }
        if (Platform.OS === 'web') window.alert('User account deleted successfully.');
        else Alert.alert('Success', 'User account deleted successfully.');
      } catch (error) {
        console.error('Error deleting user:', error);
        if (Platform.OS === 'web') window.alert('Failed to delete user.');
        else Alert.alert('Error', 'Failed to delete user.');
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm(confirmMessage)) {
        executeDelete();
      }
    } else {
      Alert.alert('Confirm Delete', confirmMessage, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: executeDelete }
      ]);
    }
  };

  const filteredUsers = users.filter((u) => {
    const userRole = u.role || 'patient';
    const matchesRole = filterRole === 'all' || userRole === filterRole;
    const matchesSearch = (u.name || '').toLowerCase().includes(search.toLowerCase()) || 
                          (u.email || '').toLowerCase().includes(search.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const getRoleBadgeStyle = (role) => {
    switch (role) {
      case 'admin':
        return { bg: 'rgba(139, 92, 246, 0.1)', color: '#8B5CF6', label: 'Admin' };
      case 'doctor':
        return { bg: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6', label: 'Doctor' };
      default:
        return { bg: 'rgba(16, 185, 129, 0.1)', color: '#10B981', label: 'Patient' };
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>User & Role Management</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{filteredUsers.length}</Text>
        </View>
      </View>

      {/* Role Filter Tabs */}
      <View style={styles.filterSection}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color={colors.textLight} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by user name or email..."
            placeholderTextColor={colors.textLight}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color={colors.textLight} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.tabContainer}>
          {[
            { key: 'all', label: `All (${users.length})` },
            { key: 'patient', label: `Patients (${users.filter(u => (u.role || 'patient') === 'patient').length})` },
            { key: 'doctor', label: `Doctors (${users.filter(u => u.role === 'doctor').length})` },
            { key: 'admin', label: `Admins (${users.filter(u => u.role === 'admin').length})` }
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tabBtn, filterRole === tab.key && styles.activeTabBtn]}
              onPress={() => setFilterRole(tab.key)}
            >
              <Text style={[styles.tabText, filterRole === tab.key && styles.activeTabText]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ marginTop: 12, color: colors.textSecondary }}>Connecting to Firestore Users...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => item.id}
          style={{ flex: 1 }}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={48} color={colors.textLight} />
              <Text style={styles.emptyTitle}>No users found</Text>
              <Text style={styles.emptySubtitle}>Try searching with a different term or role filter.</Text>
            </View>
          }
          renderItem={({ item }) => {
            const roleInfo = getRoleBadgeStyle(item.role);
            return (
              <Card style={styles.userCard}>
                <View style={styles.cardHeader}>
                  <Avatar uri={item.avatar} name={item.name || 'User'} size={48} />
                  <View style={styles.userInfo}>
                    <View style={styles.nameRow}>
                      <Text style={styles.userName}>{item.name || 'Registered User'}</Text>
                      <View style={[styles.roleBadge, { backgroundColor: roleInfo.bg }]}>
                        <Text style={[styles.roleText, { color: roleInfo.color }]}>{roleInfo.label}</Text>
                      </View>
                    </View>
                    <Text style={styles.userEmail}>{item.email}</Text>
                    {item.createdAt && (
                      <Text style={styles.userDate}>
                        Joined: {new Date(item.createdAt).toLocaleDateString()}
                      </Text>
                    )}
                  </View>
                </View>

                {/* Actions */}
                <View style={styles.cardActions}>
                  <TouchableOpacity
                    style={[styles.btnAction, styles.btnRole]}
                    onPress={() => {
                      setSelectedUser(item);
                      setRoleModalVisible(true);
                    }}
                  >
                    <Ionicons name="swap-horizontal" size={16} color={colors.primary} />
                    <Text style={styles.btnRoleText}>Change Role</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.btnAction, styles.btnDelete]}
                    onPress={() => handleDeleteUser(item)}
                  >
                    <Ionicons name="trash-outline" size={16} color={colors.emergency} />
                    <Text style={styles.btnDeleteText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </Card>
            );
          }}
        />
      )}

      {/* Role Switcher Modal */}
      <Modal visible={roleModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Change User Role</Text>
              <TouchableOpacity onPress={() => setRoleModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSub}>{selectedUser?.name} ({selectedUser?.email})</Text>
            <Text style={styles.modalDesc}>Select the new permission level for this user:</Text>

            <View style={styles.roleOptions}>
              {[
                { role: 'patient', title: 'Patient', desc: 'Standard user with booking & emergency access', icon: 'person', color: '#10B981' },
                { role: 'doctor', title: 'Doctor', desc: 'Medical practitioner with blog publishing & appointment tools', icon: 'medical', color: '#3B82F6' },
                { role: 'admin', title: 'Administrator', desc: 'Full control over users, doctors, and platform settings', icon: 'shield', color: '#8B5CF6' }
              ].map((opt) => (
                <TouchableOpacity
                  key={opt.role}
                  style={[
                    styles.roleOptionCard,
                    (selectedUser?.role || 'patient') === opt.role && styles.roleOptionCardActive
                  ]}
                  onPress={() => handleRoleChange(opt.role)}
                >
                  <View style={[styles.roleOptionIcon, { backgroundColor: `${opt.color}20` }]}>
                    <Ionicons name={opt.icon} size={20} color={opt.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.roleOptionTitle}>{opt.title}</Text>
                    <Text style={styles.roleOptionDesc}>{opt.desc}</Text>
                  </View>
                  {(selectedUser?.role || 'patient') === opt.role && (
                    <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.modalCancelBtn}
              onPress={() => setRoleModalVisible(false)}
            >
              <Text style={styles.modalCancelBtnText}>Cancel</Text>
            </TouchableOpacity>
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
  filterSection: {
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
  tabContainer: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap'
  },
  tabBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border
  },
  activeTabBtn: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary
  },
  activeTabText: {
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
  userCard: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 14
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  userInfo: {
    flex: 1,
    marginLeft: 12
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  userName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary
  },
  userEmail: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2
  },
  userDate: {
    fontSize: 11,
    color: colors.textLight,
    marginTop: 2
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8
  },
  roleText: {
    fontSize: 11,
    fontWeight: '700'
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    paddingTop: 10,
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
  btnRole: {
    backgroundColor: colors.primaryFaded,
    flex: 1.5
  },
  btnRoleText: {
    color: colors.primary,
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
    maxWidth: 420,
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
    marginBottom: 8
  },
  modalDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 16
  },
  roleOptions: {
    gap: 10,
    marginBottom: 16
  },
  roleOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: colors.background,
    borderWidth: 1.5,
    borderColor: 'transparent',
    gap: 12
  },
  roleOptionCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryFaded
  },
  roleOptionIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  roleOptionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary
  },
  roleOptionDesc: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2
  },
  modalCancelBtn: {
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: colors.background,
    alignItems: 'center'
  },
  modalCancelBtnText: {
    color: colors.textSecondary,
    fontWeight: '700',
    fontSize: 13
  }
});

export default PatientDirectoryScreen;
