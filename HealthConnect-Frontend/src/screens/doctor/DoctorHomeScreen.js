import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet,  ScrollView, TouchableOpacity, ActivityIndicator, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import Avatar from '../../components/Avatar';
import Card from '../../components/Card';
import colors from '../../utils/colors';
import api from '../../services/api';
const DoctorHomeScreen = ({ navigation }) => {
  const { height: windowHeight } = useWindowDimensions();
  const { user } = useAuth();
  
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await api.get('/appointments/doctor');
        if (response.data) {
          setAppointments(response.data);
        }
      } catch (error) {
        console.error('Error fetching appointments:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);
  const today = new Date().toISOString().split('T')[0];
  const uniquePatients = new Set(appointments.map(a => a.patientId)).size;
  const todaysAppts = appointments.filter(a => a.date === today).length;
  
  const incomingRequests = appointments.filter(a => a.status === 'pending');
  const todaysSchedule = appointments.filter(a => a.status === 'confirmed' && a.date === today);
  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const [h, m] = timeStr.split(':');
    const date = new Date();
    date.setHours(parseInt(h, 10), parseInt(m, 10));
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, Dr. {user?.name || 'Doctor'}</Text>
          <Text style={styles.subtitle}>{user?.specialty || 'Medical Professional'} • Online</Text>
        </View>
        <Avatar uri={user?.avatar || 'doc_1.jpg'} size={48} online={true} />
      </View>
      <View style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
        {/* Quick Stats Grid */}
        <View style={styles.statsGrid}>
          <Card style={styles.statCard}>
            <Ionicons name="people" size={24} color={colors.primary} />
            <Text style={styles.statVal}>{loading ? '-' : uniquePatients}</Text>
            <Text style={styles.statLabel}>Patients</Text>
          </Card>
          <Card style={styles.statCard}>
            <Ionicons name="calendar" size={24} color="#3B82F6" />
            <Text style={styles.statVal}>{loading ? '-' : todaysAppts}</Text>
            <Text style={styles.statLabel}>Today's Appts</Text>
          </Card>
          <Card style={styles.statCard}>
            <Ionicons name="star" size={24} color="#F4B740" />
            <Text style={styles.statVal}>New</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </Card>
        </View>
        {/* Demo incoming request card trigger */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Incoming Consultation Requests</Text>
        </View>
        
        {loading ? (
          <ActivityIndicator size="small" color={colors.primary} style={{ marginBottom: 20 }} />
        ) : incomingRequests.length === 0 ? (
          <Text style={{ color: colors.textSecondary, marginBottom: 20, fontStyle: 'italic' }}>No pending requests at the moment.</Text>
        ) : (
          incomingRequests.map((req, index) => (
            <TouchableOpacity
              key={req.id || index}
              style={styles.alertCard}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('IncomingRequest', { request: req })}
            >
              <View style={styles.alertLeft}>
                <Avatar uri={req.patient?.avatar} size={44} />
                <View style={styles.alertText}>
                  <Text style={styles.alertName}>{req.patient?.name || 'Patient'}</Text>
                  <Text style={styles.alertDetail} numberOfLines={1}>{req.reason || 'No specific reason provided'}</Text>
                </View>
              </View>
              <View style={styles.alertAction}>
                <Text style={styles.alertActionText}>Review</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.white} />
              </View>
            </TouchableOpacity>
          ))
        )}
        {/* Today's schedule list */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Schedule</Text>
        </View>
        {loading ? (
          <ActivityIndicator size="small" color={colors.primary} style={{ marginBottom: 20 }} />
        ) : todaysSchedule.length === 0 ? (
           <Text style={{ color: colors.textSecondary, marginBottom: 20, fontStyle: 'italic' }}>No appointments scheduled for today.</Text>
        ) : (
          <Card style={styles.scheduleCard}>
            {todaysSchedule.map((appt, index) => (
              <React.Fragment key={appt.id || index}>
                <View style={styles.schedRow}>
                  <View style={styles.timeCol}>
                    <Text style={styles.schedTime}>{formatTime(appt.time)}</Text>
                    <Text style={[styles.schedType, { textTransform: 'capitalize' }]}>{appt.type}</Text>
                  </View>
                  <View style={styles.dividerCol} />
                  <View style={styles.patientCol}>
                    <Text style={styles.schedPatient}>{appt.patient?.name || 'Patient'}</Text>
                    <Text style={[styles.schedStatus, { textTransform: 'capitalize' }]}>{appt.status}</Text>
                  </View>
                  <TouchableOpacity style={styles.chatIconBtn} onPress={() => navigation.navigate('PatientChat', { appointment: appt })}>
                    <Ionicons name="chatbubble-ellipses-outline" size={20} color={colors.primary} />
                  </TouchableOpacity>
                </View>
                {index < todaysSchedule.length - 1 && <View style={styles.horizontalDivider} />}
              </React.Fragment>
            ))}
          </Card>
        )}
        {/* Quick Actions */}
        <View style={[styles.sectionHeader, { marginTop: 24 }]}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
        </View>
        <TouchableOpacity
          style={styles.actionCard}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('BlogEditor')}
        >
          <View style={styles.actionLeft}>
            <View style={styles.actionIconContainer}>
              <Ionicons name="create-outline" size={22} color={colors.primary} />
            </View>
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>Publish Health Article</Text>
              <Text style={styles.actionSubtitle}>Write blogs to educate patients</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
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
    paddingVertical: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  greeting: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24
  },
  statCard: {
    width: '31%',
    alignItems: 'center',
    paddingVertical: 16
  },
  statVal: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 10
  },
  statLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 4
  },
  sectionHeader: {
    marginBottom: 12
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary
  },
  alertCard: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    boxShadow: '0px 4px 8px rgba(0,0,0,0.1)',
    elevation: 2
  },
  alertLeft: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  alertText: {
    marginLeft: 12
  },
  alertName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.white
  },
  alertDetail: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2
  },
  alertAction: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8
  },
  alertActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.white,
    marginRight: 4
  },
  scheduleCard: {
    paddingVertical: 8
  },
  schedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16
  },
  timeCol: {
    width: 70
  },
  schedTime: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary
  },
  schedType: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '600',
    marginTop: 2
  },
  dividerCol: {
    width: 1,
    height: 36,
    backgroundColor: colors.divider,
    marginHorizontal: 16
  },
  patientCol: {
    flex: 1
  },
  schedPatient: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary
  },
  schedStatus: {
    fontSize: 12,
    color: colors.success,
    fontWeight: '600',
    marginTop: 2
  },
  chatIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryFaded,
    alignItems: 'center',
    justifyContent: 'center'
  },
  horizontalDivider: {
    height: 1,
    backgroundColor: colors.divider,
    marginHorizontal: 16
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
    boxShadow: '0px 4px 8px rgba(0,0,0,0.1)',
    elevation: 4
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  actionIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryFaded,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14
  },
  actionTextContainer: {
    justifyContent: 'center'
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary
  },
  actionSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2
  }
});
export default DoctorHomeScreen;