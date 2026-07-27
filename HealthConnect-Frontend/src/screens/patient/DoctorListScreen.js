import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, ScrollView, TouchableOpacity, ActivityIndicator, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getDoctors } from '../../services/doctorsApi';
import DoctorCard from '../../components/DoctorCard';
import colors from '../../utils/colors';

const SPECIALTIES = ['All', 'Cardiologist', 'Dermatologist', 'Pediatrician', 'General Physician', 'Neurologist', 'Psychiatrist', 'Orthopedic', 'ENT Specialist'];

const DoctorListScreen = ({ navigation }) => {
  const [search, setSearch] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const { height: windowHeight } = useWindowDimensions();

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const data = await getDoctors();
      const formattedDoctors = data.map(doc => ({
        id: doc.id.toString(),
        name: doc.User?.name || 'Unknown',
        specialty: doc.specialty,
        avatar: doc.User?.avatar || 'https://via.placeholder.com/150',
        rating: doc.rating,
        reviews: 0, // Mock for now if not in DB
        experience: doc.experience || 0,
        isOnline: doc.User?.isOnline || false,
        bio: doc.bio,
        consultationFee: doc.consultationFee
      }));
      setDoctors(formattedDoctors);
    } catch (error) {
      console.error('Error formatting doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDoctors = doctors.filter((doc) => {
    const matchesSearch = doc.name.toLowerCase().includes(search.toLowerCase()) || doc.specialty.toLowerCase().includes(search.toLowerCase());
    const matchesSpecialty = selectedSpecialty === 'All' || doc.specialty === selectedSpecialty;
    return matchesSearch && matchesSpecialty;
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Find Doctors</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color={colors.textLight} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by doctor name or specialty..."
            placeholderTextColor={colors.textLight}
            value={search}
            onChangeText={setSearch}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Specialty Filter Chips */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipScroll}>
          {SPECIALTIES.map((specialty) => (
            <TouchableOpacity
              key={specialty}
              style={[
                styles.chip,
                selectedSpecialty === specialty && styles.activeChip
              ]}
              onPress={() => setSelectedSpecialty(specialty)}
            >
              <Text style={[
                styles.chipText,
                selectedSpecialty === specialty && styles.activeChipText
              ]}>
                {specialty}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Doctor List */}
      <View style={{ flex: 1 }}>
        {loading ? (
          <View style={styles.emptyContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <FlatList
            data={filteredDoctors}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <DoctorCard
                doctor={item}
                onPress={() => navigation.navigate('DoctorProfile', { doctor: item })}
              />
            )}
            contentContainerStyle={styles.listContainer}
            style={{ flex: 1 }}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="people-outline" size={48} color={colors.textLight} />
                <Text style={styles.emptyText}>No doctors found</Text>
                <Text style={styles.emptySubText}>Try a different search or specialty filter</Text>
              </View>
            }
          />
        )}
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center'
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: colors.white
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
    color: colors.textPrimary,
    outlineStyle: 'none'
  },
  filterContainer: {
    backgroundColor: colors.white,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  chipScroll: {
    paddingHorizontal: 20
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.background,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.border
  },
  activeChip: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary
  },
  activeChipText: {
    color: colors.white
  },
  listContainer: {
    padding: 20,
    paddingBottom: 40
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 12
  },
  emptySubText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: 'center'
  }
});

export default DoctorListScreen;
