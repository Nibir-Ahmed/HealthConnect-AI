import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Card from '../../components/Card';
import Avatar from '../../components/Avatar';
import Badge from '../../components/Badge';
import colors from '../../utils/colors';
import { db } from '../../services/firebase';
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';

const DoctorAppointmentsScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'confirmed', 'completed'

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'appointments'), (snapshot) => {
      const appts = [];
      snapshot.forEach((d) => {
        const data = d.data();
        if (!data.doctorId || data.doctorId === user?.id || data.doctorId === user?.uid || data.doctorName?.includes(user?.name)) {
          appts.push({ id: d.id, ...data });
        }
      });
      setAppointments(appts);
      setLoading(false);
    }, (err) => {
      console.error('Error fetching appointments:', err);
      setLoading(false);
    });

    return () => unsub();
  }, [user]);

  const handleUpdateStatus = async (apptId, newStatus) => {
    try {
      await updateDoc(doc(db, 'appointments', apptId), {
        status: newStatus
      });
      const msg = `Appointment marked as ${newStatus}.`;
      if (Platform.OS === 'web') window.alert(msg);
      else Alert.alert('Updated', msg);
    } catch (e) {
      console.error('Update appointment status error:', e);
    }
  };

  const filteredAppointments = appointments.filter((a) => {
    if (filter === 'all') return true;
    return (a.status || 'pending') === filter;
  });

  const renderItem = ({ item }) => {
    const patientName = item.patientName || item.patient?.name || 'Patient';
    const avatar = item.patientAvatar || item.patient?.avatar;
    const status = item.status || 'pending';

    return (
      <Card style={styles.apptCard}>
        <View style={styles.cardHeader}>
          <Avatar uri={avatar} name={patientName} size={48} />
          <View style={styles.patientInfo}>
            <Text style={styles.patientName}>{patientName}</Text>
            <Text style={styles.patientSub}>{item.type || 'In-Person Consultation'} • {item.symptoms || 'Regular Checkup'}</Text>
          </View>
          <Badge
            text={status.toUpperCase()}
            variant={status === 'confirmed' ? 'success' : status === 'completed' ? 'primary' : 'warning'}
          />
        </View>

        <View style={styles.divider} />

        <View style={styles.metaRow}>
          <View style={styles.timeRow}>
            <Ionicons name="calendar-outline" size={15} color={colors.primary} />
            <Text style={styles.timeText}>{item.date || 'Today'}</Text>
          </View>
          <View style={styles.timeRow}>
            <Ionicons name="time-outline" size={15} color="#3B82F6" />
            <Text style={styles.timeText}>{item.time || '10:00 AM'}</Text>
          </View>
        </View>

        {/* Action Controls */}
        <View style={styles.cardActions}>
          {status === 'pending' && (
            <>
              <TouchableOpacity
                style={[styles.btnAction, styles.btnDecline]}
                onPress={() => handleUpdateStatus(item.id, 'cancelled')}
              >
                <Ionicons name="close-circle-outline" size={16} color={colors.emergency} />
                <Text style={styles.btnDeclineText}>Decline</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btnAction, styles.btnAccept]}
                onPress={() => handleUpdateStatus(item.id, 'confirmed')}
              >
                <Ionicons name="checkmark-circle-outline" size={16} color={colors.white} />
                <Text style={styles.btnAcceptText}>Accept</Text>
              </TouchableOpacity>
            </>
          )}

          {status === 'confirmed' && (
            <>
              <TouchableOpacity
                style={[styles.btnAction, styles.btnComplete]}
                onPress={() => handleUpdateStatus(item.id, 'completed')}
              >
                <Ionicons name="checkmark-done" size={16} color="#10B981" />
                <Text style={styles.btnCompleteText}>Complete Visit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btnAction, styles.btnChat]}
                onPress={() => navigation.navigate('PatientChat', { appointment: item })}
              >
                <Ionicons name="chatbubble-ellipses-outline" size={16} color={colors.white} />
                <Text style={styles.btnChatText}>Open Chat</Text>
              </TouchableOpacity>
            </>
          )}

          {status === 'completed' && (
            <View style={styles.completedBox}>
              <Ionicons name="checkmark-circle" size={16} color="#10B981" />
              <Text style={styles.completedText}>Consultation Completed</Text>
            </View>
          )}
        </View>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>My Consultations</Text>
          <Text style={styles.headerSubtitle}>Manage appointments & clinical visits</Text>
        </View>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{filteredAppointments.length}</Text>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterSection}>
        {[
          { key: 'all', label: `All (${appointments.length})` },
          { key: 'pending', label: `Pending (${appointments.filter(a => (a.status || 'pending') === 'pending').length})` },
          { key: 'confirmed', label: `Confirmed (${appointments.filter(a => a.status === 'confirmed').length})` },
          { key: 'completed', label: `Done (${appointments.filter(a => a.status === 'completed').length})` }
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

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ marginTop: 12, color: colors.textSecondary }}>Loading appointments...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredAppointments}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="calendar-outline" size={48} color={colors.textLight} />
              <Text style={styles.emptyTitle}>No appointments found</Text>
              <Text style={styles.emptySubtitle}>When patients schedule a visit, it will appear here.</Text>
            </View>
          }
          renderItem={renderItem}
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary
  },
  headerSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2
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
    flexDirection: 'row',
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 8,
    flexWrap: 'wrap'
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  listContent: {
    padding: 16,
    paddingBottom: 32
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
    marginTop: 4
  },
  apptCard: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 14
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  patientInfo: {
    flex: 1,
    marginLeft: 12
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
    backgroundColor: colors.border,
    marginVertical: 12
  },
  metaRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  timeText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600'
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 4
  },
  btnAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 10,
    gap: 6
  },
  btnAccept: {
    backgroundColor: colors.primary
  },
  btnAcceptText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '700'
  },
  btnDecline: {
    backgroundColor: colors.emergencyFaded
  },
  btnDeclineText: {
    color: colors.emergency,
    fontSize: 12,
    fontWeight: '700'
  },
  btnComplete: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)'
  },
  btnCompleteText: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '700'
  },
  btnChat: {
    backgroundColor: colors.primary
  },
  btnChatText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '700'
  },
  completedBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderRadius: 10
  },
  completedText: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '700'
  }
});

export default DoctorAppointmentsScreen;
