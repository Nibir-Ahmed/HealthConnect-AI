import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Avatar from '../../components/Avatar';
import Card from '../../components/Card';
import colors from '../../utils/colors';
import api from '../../services/api';

const PatientDirectoryScreen = ({ navigation }) => {
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/users');
      // Only show patients in the patient directory
      const patients = response.data.filter(u => u.role === 'patient');
      setUsers(patients);
    } catch (error) {
      console.error('Error fetching users:', error);
      Alert.alert('Error', 'Could not load patient directory');
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = users.filter((pat) =>
    pat.name?.toLowerCase().includes(search.toLowerCase()) || 
    pat.email?.toLowerCase().includes(search.toLowerCase())
  );

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
        <Text style={styles.headerTitle}>Patient Directory</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color={colors.textLight} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search patients by name or email..."
            placeholderTextColor={colors.textLight}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      {/* Patient List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredPatients}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => (
            <Card style={styles.patientCard} onPress={() => handlePatientSelect(item)}>
              <View style={styles.cardHeader}>
                <Avatar uri={item.avatar || require('../../../assets/images/sara.png')} size={44} />
                <View style={styles.patientInfo}>
                  <Text style={styles.patientName}>{item.name}</Text>
                  <Text style={styles.patientEmail}>{item.email}</Text>
                </View>
                <View style={styles.bloodBadge}>
                  <Text style={styles.bloodText}>Patient</Text>
                </View>
              </View>
            </Card>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="people-circle-outline" size={48} color={colors.textLight} />
              <Text style={styles.emptyText}>No Patients Found</Text>
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
  bloodBadge: {
    backgroundColor: 'rgba(42, 157, 143, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8
  },
  bloodText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary
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
