import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet,  ScrollView, TouchableOpacity, ActivityIndicator, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Card from '../../components/Card';
import colors from '../../utils/colors';
import api from '../../services/api';

const AdminDashboardScreen = ({ navigation }) => {
  const { height: windowHeight } = useWindowDimensions();
  const [stats, setStats] = useState({ patients: 0, doctors: 0, appointments: 0, blogs: 0 });
  const [pendingDoctors, setPendingDoctors] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [statsRes, pendingRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/doctors/pending')
      ]);
      setStats(statsRes.data);
      setPendingDoctors(pendingRes.data.length);
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Admin Control Center</Text>
          <Text style={styles.headerSubtitle}>System Health & Audits</Text>
        </View>
        <Ionicons name="shield" size={28} color={colors.primary} />
      </View>

      <View style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
        {/* Core Metrics */}
        <View style={styles.metricsGrid}>
          <Card style={styles.metricCard}>
            <View style={[styles.iconBox, { backgroundColor: 'rgba(42, 157, 143, 0.1)' }]}>
              <Ionicons name="people" size={24} color={colors.primary} />
            </View>
            <Text style={styles.metricVal}>{stats.patients}</Text>
            <Text style={styles.metricLabel}>Total Patients</Text>
          </Card>

          <Card style={styles.metricCard}>
            <View style={[styles.iconBox, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
              <Ionicons name="medical" size={24} color="#3B82F6" />
            </View>
            <Text style={styles.metricVal}>{stats.doctors}</Text>
            <Text style={styles.metricLabel}>Active Doctors</Text>
          </Card>

          <Card style={styles.metricCard}>
            <View style={[styles.iconBox, { backgroundColor: colors.emergencyFaded }]}>
              <Ionicons name="alert-circle" size={24} color={colors.emergency} />
            </View>
            <Text style={styles.metricVal}>{pendingDoctors}</Text>
            <Text style={styles.metricLabel}>Pending Reviews</Text>
          </Card>

          <Card style={styles.metricCard}>
            <View style={[styles.iconBox, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
              <Ionicons name="book" size={24} color="#F59E0B" />
            </View>
            <Text style={styles.metricVal}>{stats.blogs}</Text>
            <Text style={styles.metricLabel}>Health Blogs</Text>
          </Card>
        </View>

        {/* Quick Admin Actions */}
        <Text style={styles.sectionTitle}>Administrative Services</Text>

        <TouchableOpacity
          style={styles.actionCard}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('DoctorVerification')}
        >
          <View style={styles.actionLeft}>
            <Ionicons name="checkbox-outline" size={22} color={colors.primary} />
            <Text style={styles.actionText}>Doctor Approvals</Text>
          </View>
          {pendingDoctors > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{pendingDoctors} Pending</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('PatientDirectory')}
        >
          <View style={styles.actionLeft}>
            <Ionicons name="search" size={22} color={colors.primary} />
            <Text style={styles.actionText}>Patient Database Explorer</Text>
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
  scrollContainer: {
    padding: 20,
    paddingBottom: 40
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 28
  },
  metricCard: {
    width: '47%',
    padding: 16,
    alignItems: 'center',
    marginBottom: 4
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12
  },
  metricVal: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary
  },
  metricLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 16
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  actionText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    marginLeft: 12
  },
  badge: {
    backgroundColor: colors.emergencyFaded,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.emergency
  }
});

export default AdminDashboardScreen;
