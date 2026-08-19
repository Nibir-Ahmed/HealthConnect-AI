import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, useWindowDimensions, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Card from '../../components/Card';
import colors from '../../utils/colors';
import { db } from '../../services/firebase';
import { collection, onSnapshot, query, getDocs } from 'firebase/firestore';

const AdminDashboardScreen = ({ navigation }) => {
  const { height: windowHeight } = useWindowDimensions();
  const [stats, setStats] = useState({
    patients: 0,
    doctors: 0,
    appointments: 0,
    blogs: 0,
    admins: 0,
    pendingDoctors: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Real-time Firestore subscriptions for live admin counters
    const unsubUsers = onSnapshot(collection(db, 'users'), (snap) => {
      let pCount = 0;
      let aCount = 0;
      snap.forEach((doc) => {
        const data = doc.data();
        if (data.role === 'admin') aCount++;
        else if (data.role === 'patient' || !data.role) pCount++;
      });
      setStats((prev) => ({ ...prev, patients: pCount, admins: aCount }));
      setLoading(false);
    }, (err) => console.error('Error listening to users:', err));

    const unsubDoctors = onSnapshot(collection(db, 'doctors'), (snap) => {
      let dCount = 0;
      let pendingCount = 0;
      snap.forEach((doc) => {
        dCount++;
        const data = doc.data();
        if (data.isVerified === false) {
          pendingCount++;
        }
      });
      setStats((prev) => ({ ...prev, doctors: dCount, pendingDoctors: pendingCount }));
    }, (err) => console.error('Error listening to doctors:', err));

    const unsubBlogs = onSnapshot(collection(db, 'blogs'), (snap) => {
      setStats((prev) => ({ ...prev, blogs: snap.size }));
    }, (err) => console.error('Error listening to blogs:', err));

    const unsubAppointments = onSnapshot(collection(db, 'appointments'), (snap) => {
      setStats((prev) => ({ ...prev, appointments: snap.size }));
    }, (err) => console.error('Error listening to appointments:', err));

    return () => {
      unsubUsers();
      unsubDoctors();
      unsubBlogs();
      unsubAppointments();
    };
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const [uSnap, dSnap, bSnap, aSnap] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'doctors')),
        getDocs(collection(db, 'blogs')),
        getDocs(collection(db, 'appointments'))
      ]);
      let pCount = 0;
      let aCount = 0;
      uSnap.forEach((doc) => {
        if (doc.data().role === 'admin') aCount++;
        else pCount++;
      });
      let pending = 0;
      dSnap.forEach((doc) => {
        if (doc.data().isVerified === false) pending++;
      });
      setStats({
        patients: pCount,
        doctors: dSnap.size,
        blogs: bSnap.size,
        appointments: aSnap.size,
        admins: aCount,
        pendingDoctors: pending
      });
    } catch (e) {
      console.error('Refresh error:', e);
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 12, color: colors.textSecondary, fontWeight: '600' }}>Connecting to Cloud Firestore...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Admin Control Center</Text>
          <Text style={styles.headerSubtitle}>Real-time Platform Management</Text>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.liveIndicator}>
            <View style={styles.livePulse} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
          <Ionicons name="shield-checkmark" size={26} color={colors.primary} style={{ marginLeft: 8 }} />
        </View>
      </View>

      <View style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          style={{ flex: 1 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
        >
          {/* Core Metrics Grid - Interactive Clickable Buttons */}
          <View style={styles.metricsGrid}>
            <TouchableOpacity
              style={styles.metricCardTouchable}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('AdminPatients', { initialFilter: 'patient' })}
            >
              <Card style={styles.metricCard}>
                <View style={[styles.iconBox, { backgroundColor: 'rgba(42, 157, 143, 0.1)' }]}>
                  <Ionicons name="people" size={22} color={colors.primary} />
                </View>
                <Text style={styles.metricVal}>{stats.patients}</Text>
                <Text style={styles.metricLabel}>Total Patients</Text>
                <View style={styles.cardArrowRow}>
                  <Text style={styles.viewText}>View List</Text>
                  <Ionicons name="chevron-forward" size={12} color={colors.primary} />
                </View>
              </Card>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.metricCardTouchable}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('AdminVerification', { initialFilter: 'verified' })}
            >
              <Card style={styles.metricCard}>
                <View style={[styles.iconBox, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
                  <Ionicons name="medical" size={22} color="#3B82F6" />
                </View>
                <Text style={styles.metricVal}>{stats.doctors}</Text>
                <Text style={styles.metricLabel}>Active Doctors</Text>
                <View style={styles.cardArrowRow}>
                  <Text style={[styles.viewText, { color: '#3B82F6' }]}>Manage</Text>
                  <Ionicons name="chevron-forward" size={12} color="#3B82F6" />
                </View>
              </Card>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.metricCardTouchable}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('AdminVerification', { initialFilter: 'pending' })}
            >
              <Card style={styles.metricCard}>
                <View style={[styles.iconBox, { backgroundColor: stats.pendingDoctors > 0 ? colors.emergencyFaded : 'rgba(16, 185, 129, 0.1)' }]}>
                  <Ionicons
                    name={stats.pendingDoctors > 0 ? "alert-circle" : "checkmark-circle"}
                    size={22}
                    color={stats.pendingDoctors > 0 ? colors.emergency : "#10B981"}
                  />
                </View>
                <Text style={[styles.metricVal, stats.pendingDoctors > 0 && { color: colors.emergency }]}>
                  {stats.pendingDoctors}
                </Text>
                <Text style={styles.metricLabel}>Pending Reviews</Text>
                <View style={styles.cardArrowRow}>
                  <Text style={[styles.viewText, { color: stats.pendingDoctors > 0 ? colors.emergency : '#10B981' }]}>
                    {stats.pendingDoctors > 0 ? 'Review Now' : 'All Clear'}
                  </Text>
                  <Ionicons name="chevron-forward" size={12} color={stats.pendingDoctors > 0 ? colors.emergency : '#10B981'} />
                </View>
              </Card>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.metricCardTouchable}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('BlogFeed')}
            >
              <Card style={styles.metricCard}>
                <View style={[styles.iconBox, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
                  <Ionicons name="book" size={22} color="#F59E0B" />
                </View>
                <Text style={styles.metricVal}>{stats.blogs}</Text>
                <Text style={styles.metricLabel}>Health Articles</Text>
                <View style={styles.cardArrowRow}>
                  <Text style={[styles.viewText, { color: '#F59E0B' }]}>Open Feed</Text>
                  <Ionicons name="chevron-forward" size={12} color="#F59E0B" />
                </View>
              </Card>
            </TouchableOpacity>
          </View>

          {/* Interactive Platform Growth Overview */}
          <Card style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <View>
                <Text style={styles.chartTitle}>Platform Activity Overview</Text>
                <Text style={styles.chartSubtitle}>Real-time Database Telemetry</Text>
              </View>
              <View style={styles.chartBadge}>
                <Text style={styles.chartBadgeText}>Firestore Cloud</Text>
              </View>
            </View>

            {/* Metrics Breakdown */}
            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
                <Text style={styles.legendText}>Patients: {stats.patients}</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#3B82F6' }]} />
                <Text style={styles.legendText}>Doctors: {stats.doctors}</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
                <Text style={styles.legendText}>Blogs: {stats.blogs}</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#8B5CF6' }]} />
                <Text style={styles.legendText}>Bookings: {stats.appointments}</Text>
              </View>
            </View>

            {/* Visual Progress Bars */}
            <View style={styles.progressSection}>
              <View style={styles.progressRow}>
                <Text style={styles.progressLabel}>Patient Accounts</Text>
                <Text style={styles.progressValue}>{stats.patients}</Text>
              </View>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${Math.min(100, (stats.patients / Math.max(1, stats.patients + stats.doctors)) * 100)}%`, backgroundColor: colors.primary }]} />
              </View>

              <View style={styles.progressRow}>
                <Text style={styles.progressLabel}>Registered Doctors</Text>
                <Text style={styles.progressValue}>{stats.doctors}</Text>
              </View>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${Math.min(100, (stats.doctors / Math.max(1, stats.patients + stats.doctors)) * 100)}%`, backgroundColor: '#3B82F6' }]} />
              </View>

              <View style={styles.progressRow}>
                <Text style={styles.progressLabel}>Published Articles</Text>
                <Text style={styles.progressValue}>{stats.blogs}</Text>
              </View>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${Math.min(100, stats.blogs * 10)}%`, backgroundColor: '#F59E0B' }]} />
              </View>
            </View>
          </Card>

          {/* Administrative Control Hub */}
          <Text style={styles.sectionTitle}>Administrative Control Center</Text>

          <TouchableOpacity
            style={styles.actionCard}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('DoctorVerification')}
          >
            <View style={styles.actionLeft}>
              <View style={[styles.actionIconBox, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
                <Ionicons name="shield-checkmark" size={20} color="#3B82F6" />
              </View>
              <View>
                <Text style={styles.actionText}>Doctor Approvals & Management</Text>
                <Text style={styles.actionSubtext}>Verify, edit fees, specialty, or delete doctors</Text>
              </View>
            </View>
            {stats.pendingDoctors > 0 ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{stats.pendingDoctors} Pending</Text>
              </View>
            ) : (
              <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('PatientDirectory')}
          >
            <View style={styles.actionLeft}>
              <View style={[styles.actionIconBox, { backgroundColor: 'rgba(42, 157, 143, 0.1)' }]}>
                <Ionicons name="people" size={20} color={colors.primary} />
              </View>
              <View>
                <Text style={styles.actionText}>User & Role Management</Text>
                <Text style={styles.actionSubtext}>View patients, change roles, manage accounts</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('BlogFeed')}
          >
            <View style={styles.actionLeft}>
              <View style={[styles.actionIconBox, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
                <Ionicons name="book" size={20} color="#F59E0B" />
              </View>
              <View>
                <Text style={styles.actionText}>Health Library Content Feed</Text>
                <Text style={styles.actionSubtext}>Inspect and moderate live published blogs</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('AdminSettings')}
          >
            <View style={styles.actionLeft}>
              <View style={[styles.actionIconBox, { backgroundColor: 'rgba(139, 92, 246, 0.1)' }]}>
                <Ionicons name="settings" size={20} color="#8B5CF6" />
              </View>
              <View>
                <Text style={styles.actionText}>System Settings & Global Banner</Text>
                <Text style={styles.actionSubtext}>Broadcast alerts, emergency numbers, maintenance</Text>
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
    paddingVertical: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary
  },
  headerSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  livePulse: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 4
  },
  liveText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#10B981'
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 24
  },
  metricCardTouchable: {
    width: '48%',
    marginBottom: 4
  },
  metricCard: {
    width: '100%',
    padding: 16,
    alignItems: 'center',
    borderRadius: 14
  },
  cardArrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 3
  },
  viewText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10
  },
  metricVal: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textPrimary
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 4
  },
  chartCard: {
    padding: 18,
    marginBottom: 24,
    borderRadius: 16
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary
  },
  chartSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2
  },
  chartBadge: {
    backgroundColor: colors.primaryFaded,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8
  },
  chartBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary
  },
  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6
  },
  legendText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary
  },
  progressSection: {
    marginTop: 6
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 4
  },
  progressLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600'
  },
  progressValue: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary
  },
  progressBarBg: {
    height: 8,
    backgroundColor: colors.background,
    borderRadius: 4,
    overflow: 'hidden'
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 14
  },
  actionCard: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10
  },
  actionIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  actionText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary
  },
  actionSubtext: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2
  },
  badge: {
    backgroundColor: colors.emergencyFaded,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12
  },
  badgeText: {
    color: colors.emergency,
    fontSize: 11,
    fontWeight: '700'
  }
});

export default AdminDashboardScreen;
