import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TextInput, TouchableOpacity, Alert, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Avatar from '../../components/Avatar';
import Card from '../../components/Card';
import colors from '../../utils/colors';
import api from '../../services/api';

const PatientDirectoryScreen = ({ navigation }) => {
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState('all'); // 'all', 'patient', 'doctor'

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      Alert.alert('Error', 'Could not load user directory');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = (userToDelete) => {
    const confirmMessage = `Are you sure you want to delete ${userToDelete.name} (${userToDelete.role})? This cannot be undone.`;
    
    if (Platform.OS === 'web') {
      if (window.confirm(confirmMessage)) {
        executeDelete(userToDelete.id);
      }
    } else {
      Alert.alert('Confirm Delete', confirmMessage, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => executeDelete(userToDelete.id) }
      ]);
    }
  };

  const executeDelete = async (userId) => {
    try {
      await api.delete(`/admin/users/${userId}`);
      if (Platform.OS === 'web') window.alert('User deleted successfully.');
      else Alert.alert('Success', 'User deleted successfully.');
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      if (Platform.OS === 'web') window.alert('Failed to delete user.');
      else Alert.alert('Error', 'Failed to delete user.');
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesRole = filterRole === 'all' || u.role === filterRole;
    const matchesSearch = u.name?.toLowerCase().includes(search.toLowerCase()) || 
                          u.email?.toLowerCase().includes(search.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const handlePatientSelect = (patient) => {
    Alert.alert(
      'Patient Information',
      `Name: ${patient.name}\nEmail: ${patient.email}\nPhone: ${patient.phone || 'N/A'}\nJoined: ${new Date(patient.createdAt).toLocaleDateString()}`,
      [{ text: 'Close', style: 'cancel' }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>User & Doctor Directory</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Role Filter Tabs */}
      <View style={styles.tabContainer}>
        {['all', 'patient', 'doctor'].map((role) => (
          <TouchableOpacity
            key={role}
            style={[styles.tabBtn, filterRole === role && styles.activeTabBtn]}
            onPress={() => setFilterRole(role)}
          >
            <Text style={[styles.tabText, filterRole === role && styles.activeTabText]}>
              {role === 'all' ? 'All Users' : role === 'patient' ? 'Patients' : 'Doctors'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color={colors.textLight} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search users or doctors..."
            placeholderTextColor={colors.textLight}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      {/* User / Doctor List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => item.id.toString()}
          style={{ flex: 1 }}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => (
            <Card style={styles.patientCard} onPress={() => handlePatientSelect(item)}>
              <View style={styles.cardHeader}>
                <Avatar uri={item.avatar} name={item.name} size={44} />
                <View style={styles.patientInfo}>
                  <Text style={styles.patientName}>{item.name}</Text>
                  <Text style={styles.patientEmail}>{item.email}</Text>
                </View>
                <View style={[styles.roleBadge, item.role === 'doctor' ? styles.docBadge : item.role === 'admin' ? styles.adminBadge : styles.patientBadge]}>
                  <Text style={styles.roleText}>{item.role?.toUpperCase()}</Text>
                </View>
                <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDeleteUser(item)}>
                  <Ionicons name="trash-outline" size={20} color={colors.emergency} />
                </TouchableOpacity>
              </View>
            </Card>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="people-circle-outline" size={48} color={colors.textLight} />
              <Text style={styles.emptyText}>No Accounts Found</Text>
            </View>
          }
        />
      )}
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
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: colors.border
  },
  searchIcon: {
    marginRight: 8
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: colors.textPrimary
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  listContainer: {
    padding: 20
  },
  patientCard: {
    marginBottom: 12,
    padding: 14
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  patientInfo: {
    marginLeft: 12,
    flex: 1
  },
  patientName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary
  },
  patientEmail: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 8
  },
  tabBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border
  },
  activeTabBtn: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary
  },
  activeTabText: {
    color: colors.white
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8
  },
  patientBadge: {
    backgroundColor: 'rgba(42, 157, 143, 0.1)'
  },
  docBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)'
  },
  adminBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)'
  },
  roleText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textPrimary
  },
  deleteBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)'
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60
  },
  emptyText: {
    fontSize: 16,
    color: colors.textLight,
    marginTop: 12
  }
});

export default PatientDirectoryScreen;
