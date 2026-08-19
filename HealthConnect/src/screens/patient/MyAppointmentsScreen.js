import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, Platform } from 'react-native';;
import { Ionicons } from '@expo/vector-icons';
import { getPatientAppointments, updateAppointmentStatus } from '../../services/appointmentsApi';
import { useAuth } from '../../context/AuthContext';
import AppointmentCard from '../../components/AppointmentCard';
import colors from '../../utils/colors';

const MyAppointmentsScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('upcoming'); // upcoming, past
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, [user]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const data = await getPatientAppointments(user?.id || user?.uid);
      const formatted = (data || []).map(appt => ({
        id: appt.id.toString(),
        doctor: {
          id: appt.doctor?.id || appt.doctorId,
          userId: appt.doctor?.userId,
          name: appt.doctor?.name || appt.doctor?.User?.name || 'Dr. Specialist',
          specialty: appt.doctor?.specialty || 'General Practitioner',
          avatar: appt.doctor?.avatar || appt.doctor?.User?.avatar,
          isOnline: true
        },
        date: appt.date,
        time: appt.time,
        status: appt.status || 'upcoming'
      }));
      setAppointments(formatted);
    } catch (error) {
      console.error('Error fetching appointments from Firestore:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = (appointmentId) => {
    const executeCancel = async () => {
      try {
        await updateAppointmentStatus(appointmentId, 'cancelled');
        if (Platform.OS === 'web') {
          alert('Appointment cancelled successfully.');
        } else {
          Alert.alert('Success', 'Appointment cancelled successfully.');
        }
        fetchAppointments();
      } catch (err) {
        console.error('Error cancelling appointment in Firestore:', err);
        Alert.alert('Error', 'Failed to cancel appointment. Please try again.');
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to cancel this appointment?')) {
        executeCancel();
      }
    } else {
      Alert.alert(
        'Cancel Appointment',
        'Are you sure you want to cancel this appointment?',
        [
          { text: 'No', style: 'cancel' },
          { text: 'Yes, Cancel', style: 'destructive', onPress: executeCancel }
        ]
      );
    }
  };

  const filteredAppointments = appointments.filter((appointment) => {
    if (activeTab === 'upcoming') {
      return appointment.status === 'pending' || appointment.status === 'confirmed' || appointment.status === 'upcoming';
    } else {
      return appointment.status === 'completed' || appointment.status === 'cancelled';
    }
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => (navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Home'))}
        >
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Appointments</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'upcoming' && styles.activeTab]}
          onPress={() => setActiveTab('upcoming')}
        >
          <Text style={[styles.tabText, activeTab === 'upcoming' && styles.activeTabText]}>Upcoming</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'past' && styles.activeTab]}
          onPress={() => setActiveTab('past')}
        >
          <Text style={[styles.tabText, activeTab === 'past' && styles.activeTabText]}>Past</Text>
        </TouchableOpacity>
      </View>

      {/* Appointment List */}
      {loading ? (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredAppointments}
          keyExtractor={(item) => item.id}
          style={{ flex: 1 }}
          renderItem={({ item }) => (
            <AppointmentCard
              appointment={item}
              onPress={() => {
                if (item.status === 'pending' || item.status === 'confirmed' || item.status === 'upcoming') {
                  navigation.navigate('DoctorChat', { appointment: item });
                }
              }}
              onCancel={handleCancel}
            />
          )}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="calendar-outline" size={48} color={colors.textLight} />
              <Text style={styles.emptyText}>No appointments found</Text>
              <Text style={styles.emptySubText}>All your {activeTab} consultations will appear here</Text>
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
    paddingHorizontal: 20
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent'
  },
  activeTab: {
    borderBottomColor: colors.primary
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary
  },
  activeTabText: {
    color: colors.primary
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

export default MyAppointmentsScreen;
