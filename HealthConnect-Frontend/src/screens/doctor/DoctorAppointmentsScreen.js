import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from '../../components/Card';
import Avatar from '../../components/Avatar';
import Badge from '../../components/Badge';
import colors from '../../utils/colors';
import { getDoctorAppointments } from '../../services/appointmentsApi';

const DoctorAppointmentsScreen = ({ navigation }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const data = await getDoctorAppointments();
      setAppointments(data);
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
      Alert.alert('Error', 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(hours, minutes);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderItem = ({ item }) => {
    const patientName = item.patient?.name || 'Unknown Patient';
    const avatar = item.patient?.avatar ? { uri: item.patient.avatar } : require('../../../assets/images/sara.png');
    
    // Inject patientId into patient object for the chat screen
    const chatAppointment = {
      ...item,
      patient: {
        ...item.patient,
        id: item.patientId
      }
    };

    return (
      <Card style={styles.apptCard}>
        <View style={styles.cardHeader}>
          <Avatar uri={avatar} size={44} />
          <View style={styles.patientInfo}>
            <Text style={styles.patientName}>{patientName}</Text>
            <Text style={styles.patientSub}>Consultation type: {item.type}</Text>
          </View>
          <Badge text={item.status.toUpperCase()} variant={item.status === 'confirmed' ? 'success' : 'warning'} />
        </View>

        <View style={styles.divider} />

        <View style={styles.cardFooter}>
          <View style={styles.timeRow}>
            <Ionicons name="time-outline" size={16} color={colors.primary} />
            <Text style={styles.timeText}>{item.date} • {formatTime(item.time)}</Text>
          </View>

          <TouchableOpacity
            style={styles.connectBtn}
            onPress={() => navigation.navigate('PatientChat', { appointment: chatAppointment })}
          >
            <Text style={styles.connectBtnText}>Connect Chat</Text>
            <Ionicons name="chevron-forward" size={14} color={colors.white} />
          </TouchableOpacity>
        </View>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Consultations</Text>
        <TouchableOpacity onPress={fetchAppointments}>
          <Ionicons name="refresh" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={appointments}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          renderItem={renderItem}
          ListEmptyComponent={
            <View style={styles.centerContainer}>
              <Ionicons name="calendar-outline" size={48} color={colors.textLight} />
              <Text style={styles.emptyText}>No appointments booked</Text>
              <Text style={styles.emptySubText}>Patients haven't booked any consultations yet.</Text>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary
  },
  listContainer: {
    padding: 20,
    flexGrow: 1
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  apptCard: {
    marginBottom: 16,
    padding: 16
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
  patientSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: 14
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  timeText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    marginLeft: 6
  },
  connectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8
  },
  connectBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.white,
    marginRight: 4
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
    marginTop: 4
  }
});

export default DoctorAppointmentsScreen;
