import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, useWindowDimensions, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import Avatar from '../../components/Avatar';
import Card from '../../components/Card';
import colors from '../../utils/colors';
import { db } from '../../services/firebase';
import { collection, onSnapshot, query, where, doc, updateDoc } from 'firebase/firestore';

const DoctorHomeScreen = ({ navigation }) => {
  const { height: windowHeight } = useWindowDimensions();
  const { user } = useAuth();
  
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Live Firestore appointments subscription
    const unsub = onSnapshot(collection(db, 'appointments'), (snapshot) => {
      const appts = [];
      snapshot.forEach((d) => {
        const data = d.data();
        // Match doctor by ID or show appointments
        if (!data.doctorId || data.doctorId === user?.id || data.doctorId === user?.uid || data.doctorName?.includes(user?.name)) {
          appts.push({ id: d.id, ...data });
        }
      });
      setAppointments(appts);
      setLoading(false);
    }, (err) => {
      console.error('Error listening to doctor appointments:', err);
      setLoading(false);
    });

    return () => unsub();
  }, [user]);

  const today = new Date().toISOString().split('T')[0];
  const uniquePatients = new Set(appointments.map(a => a.patientId || a.patientName || a.userId)).size;
  const todaysAppts = appointments.filter(a => a.date === today).length;
  
  const incomingRequests = appointments.filter(a => a.status === 'pending');
  const todaysSchedule = appointments.filter(a => a.status === 'confirmed' || a.date === today);

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    return timeStr;
  };

  const handleAcceptAppointment = async (apptId) => {
    try {
      await updateDoc(doc(db, 'appointments', apptId), {
        status: 'confirmed'
      });
    } catch (e) {
      console.error('Accept appointment error:', e);
    }
  };

  const handleDeclineAppointment = async (apptId) => {
    try {
      await updateDoc(doc(db, 'appointments', apptId), {
        status: 'cancelled'
      });
    } catch (e) {
      console.error('Decline appointment error:', e);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>
            Hello, {user?.name ? (user.name.startsWith('Dr.') ? user.name : `Dr. ${user.name}`) : 'Doctor'}
          </Text>
          <Text style={styles.subtitle}>{user?.specialty || 'General Practitioner'} • Active</Text>
        </View>
        <Avatar uri={user?.avatar} name={user?.name || 'Doctor'} size={48} online={true} />
      </View>

      <View style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          style={{ flex: 1 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => setRefreshing(false)} colors={[colors.primary]} />}
        >
          {/* Quick Stats Grid */}
          <View style={styles.statsGrid}>
            <Card style={styles.statCard}>
              <View style={[styles.statIconBox, { backgroundColor: 'rgba(0, 168, 150, 0.1)' }]}>
                <Ionicons name="people" size={22} color={colors.primary} />
              </View>
              <Text style={styles.statVal}>{loading ? '-' : uniquePatients}</Text>
              <Text style={styles.statLabel}>Total Patients</Text>
            </Card>

            <Card style={styles.statCard}>
              <View style={[styles.statIconBox, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
                <Ionicons name="calendar" size={22} color="#3B82F6" />
              </View>
              <Text style={styles.statVal}>{loading ? '-' : todaysAppts}</Text>
              <Text style={styles.statLabel}>Today's Visits</Text>
            </Card>

            <Card style={styles.statCard}>
              <View style={[styles.statIconBox, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
                <Ionicons name="star" size={22} color="#F59E0B" />
              </View>
              <Text style={styles.statVal}>5.0</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </Card>
          </View>

          {/* Incoming Consultation Requests */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Incoming Consultation Requests</Text>
            {incomingRequests.length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{incomingRequests.length} New</Text>
              </View>
            )}
          </View>
          
          {loading ? (
            <ActivityIndicator size="small" color={colors.primary} style={{ marginBottom: 20 }} />
          ) : incomingRequests.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Ionicons name="checkmark-circle-outline" size={28} color={colors.primary} />
              <Text style={styles.emptyText}>All incoming requests have been reviewed.</Text>
            </Card>
          ) : (
            incomingRequests.map((req, index) => (
              <Card key={req.id || index} style={styles.requestCard}>
                <View style={styles.requestTop}>
                  <Avatar uri={req.patientAvatar} name={req.patientName || 'Patient'} size={44} />
                  <View style={styles.requestInfo}>
                    <Text style={styles.requestName}>{req.patientName || 'Patient'}</Text>
                    <Text style={styles.requestReason} numberOfLines={1}>
                      {req.symptoms || req.reason || 'General health consultation'}
                    </Text>
                    <Text style={styles.requestTime}>
                      {req.date} at {req.time || '10:00 AM'}
                    </Text>
                  </View>
                </View>

                <View style={styles.requestActions}>
                  <TouchableOpacity
                    style={[styles.btnAction, styles.btnDecline]}
                    onPress={() => handleDeclineAppointment(req.id)}
                  >
                    <Ionicons name="close" size={16} color={colors.emergency} />
                    <Text style={styles.btnDeclineText}>Decline</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.btnAction, styles.btnAccept]}
                    onPress={() => handleAcceptAppointment(req.id)}
                  >
                    <Ionicons name="checkmark" size={16} color={colors.white} />
                    <Text style={styles.btnAcceptText}>Accept Request</Text>
                  </TouchableOpacity>
                </View>
              </Card>
            ))
          )}

          {/* Today's Schedule */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Consultation Schedule</Text>
          </View>
          
          {loading ? (
            <ActivityIndicator size="small" color={colors.primary} style={{ marginBottom: 20 }} />
          ) : todaysSchedule.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Ionicons name="calendar-outline" size={28} color={colors.textLight} />
              <Text style={styles.emptyText}>No appointments booked yet.</Text>
            </Card>
          ) : (
            <Card style={styles.scheduleCard}>
              {todaysSchedule.map((appt, index) => (
                <React.Fragment key={appt.id || index}>
                  <View style={styles.schedRow}>
                    <View style={styles.timeCol}>
                      <Text style={styles.schedTime}>{formatTime(appt.time || '10:00 AM')}</Text>
                      <Text style={styles.schedType}>{appt.date || 'Today'}</Text>
                    </View>
                    <View style={styles.dividerCol} />
                    <View style={styles.patientCol}>
                      <Text style={styles.schedPatient}>{appt.patientName || 'Patient'}</Text>
                      <View style={[styles.statusBadge, appt.status === 'confirmed' ? styles.statusConfirmed : styles.statusPending]}>
                        <Text style={[styles.statusText, appt.status === 'confirmed' ? { color: '#10B981' } : { color: '#F59E0B' }]}>
                          {appt.status ? appt.status.toUpperCase() : 'CONFIRMED'}
                        </Text>
                      </View>
                    </View>
                  </View>
                  {index < todaysSchedule.length - 1 && <View style={styles.horizontalDivider} />}
                </React.Fragment>
              ))}
            </Card>
          )}

          {/* Quick Doctor Actions */}
          <View style={[styles.sectionHeader, { marginTop: 24 }]}>
            <Text style={styles.sectionTitle}>Doctor Clinical Tools</Text>
          </View>

          <TouchableOpacity
            style={styles.actionCard}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('BlogEditor')}
          >
            <View style={styles.actionLeft}>
              <View style={[styles.actionIconBox, { backgroundColor: 'rgba(0, 168, 150, 0.1)' }]}>
                <Ionicons name="create-outline" size={22} color={colors.primary} />
              </View>
              <View style={styles.actionTextContainer}>
                <Text style={styles.actionTitle}>Publish Medical Article</Text>
                <Text style={styles.actionSubtitle}>Write guides to educate your patients</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('DoctorProfileSettings')}
          >
            <View style={styles.actionLeft}>
              <View style={[styles.actionIconBox, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
                <Ionicons name="person-outline" size={22} color="#3B82F6" />
              </View>
              <View style={styles.actionTextContainer}>
                <Text style={styles.actionTitle}>Profile & Fee Settings</Text>
                <Text style={styles.actionSubtitle}>Update specialty, fees, and bio</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
          </TouchableOpacity>

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
    paddingVertical: 14,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  headerLeft: {
    flex: 1
  },
  greeting: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary
  },
  subtitle: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
    marginTop: 2
  },
  scrollContainer: {
    padding: 18,
    paddingBottom: 36
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 22
  },
  statCard: {
    flex: 1,
    padding: 14,
    alignItems: 'center',
    borderRadius: 14
  },
  statIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8
  },
  statVal: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 2
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 4
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary
  },
  badge: {
    backgroundColor: colors.emergencyFaded,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10
  },
  badgeText: {
    color: colors.emergency,
    fontSize: 11,
    fontWeight: '700'
  },
  emptyCard: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
    borderRadius: 12,
    marginBottom: 16
  },
  emptyText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600'
  },
  requestCard: {
    padding: 14,
    borderRadius: 14,
    marginBottom: 12
  },
  requestTop: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  requestInfo: {
    flex: 1,
    marginLeft: 12
  },
  requestName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary
  },
  requestReason: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2
  },
  requestTime: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '600',
    marginTop: 2
  },
  requestActions: {
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
  btnAccept: {
    backgroundColor: colors.primary,
    flex: 1.5
  },
  btnAcceptText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '700'
  },
  btnDecline: {
    backgroundColor: colors.emergencyFaded,
    flex: 1
  },
  btnDeclineText: {
    color: colors.emergency,
    fontSize: 12,
    fontWeight: '700'
  },
  scheduleCard: {
    padding: 16,
    borderRadius: 14,
    marginBottom: 16
  },
  schedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6
  },
  timeCol: {
    width: 80
  },
  schedTime: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary
  },
  schedType: {
    fontSize: 11,
    color: colors.textLight,
    marginTop: 2
  },
  dividerCol: {
    width: 2,
    height: 30,
    backgroundColor: colors.border,
    marginHorizontal: 12
  },
  patientCol: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  schedPatient: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8
  },
  statusConfirmed: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)'
  },
  statusPending: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)'
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800'
  },
  horizontalDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 10
  },
  actionCard: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  actionIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  actionTextContainer: {
    flex: 1
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary
  },
  actionSubtitle: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2
  }
});

export default DoctorHomeScreen;