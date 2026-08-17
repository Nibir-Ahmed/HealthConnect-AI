import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../utils/colors';

const MaintenanceScreen = ({ emergencyPhone = '911', onCheckStatus, onAdminLogin }) => {
  const [checking, setChecking] = useState(false);

  const handleRefresh = async () => {
    if (onCheckStatus) {
      setChecking(true);
      await onCheckStatus();
      setTimeout(() => setChecking(false), 800);
    }
  };

  const handleCallEmergency = () => {
    const phoneUrl = `tel:${emergencyPhone || '911'}`;
    Linking.openURL(phoneUrl).catch(() => {
      if (Platform.OS === 'web') {
        window.alert(`Emergency Services: Please dial ${emergencyPhone || '911'} immediately.`);
      }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        
        {/* Animated Icon Badge */}
        <View style={styles.iconCircle}>
          <Ionicons name="construct" size={48} color={colors.warning} />
          <View style={styles.pulseDot} />
        </View>

        <View style={styles.statusBadge}>
          <Ionicons name="time-outline" size={14} color="#B45309" />
          <Text style={styles.statusText}>SCHEDULED MAINTENANCE</Text>
        </View>

        <Text style={styles.title}>System Under Upgrade</Text>
        <Text style={styles.description}>
          HealthConnect is currently undergoing scheduled platform maintenance and security upgrades to serve you better. We'll be back online shortly!
        </Text>

        {/* Emergency Assistance Notice */}
        <View style={styles.emergencyCard}>
          <View style={styles.emergencyHeader}>
            <Ionicons name="alert-circle" size={20} color={colors.emergency} />
            <Text style={styles.emergencyTitle}>Medical Emergency?</Text>
          </View>
          <Text style={styles.emergencySub}>
            If you need urgent medical care, do not wait for the platform to restore. Call emergency dispatch directly.
          </Text>
          <TouchableOpacity style={styles.emergencyBtn} onPress={handleCallEmergency} activeOpacity={0.85}>
            <Ionicons name="call" size={18} color={colors.white} />
            <Text style={styles.emergencyBtnText}>Call Emergency ({emergencyPhone || '911'})</Text>
          </TouchableOpacity>
        </View>

        {/* Check Status Button */}
        <TouchableOpacity style={styles.refreshBtn} onPress={handleRefresh} disabled={checking} activeOpacity={0.8}>
          {checking ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <>
              <Ionicons name="refresh" size={18} color={colors.primary} />
              <Text style={styles.refreshBtnText}>Check System Status</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Admin Login Bypass Option */}
        {onAdminLogin && (
          <TouchableOpacity style={styles.adminLink} onPress={onAdminLogin} activeOpacity={0.7}>
            <Ionicons name="shield-checkmark-outline" size={16} color={colors.textLight} />
            <Text style={styles.adminLinkText}>Administrator Login</Text>
          </TouchableOpacity>
        )}

      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC'
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingVertical: 20
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderWidth: 2,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    position: 'relative'
  },
  pulseDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.warning,
    borderWidth: 2,
    borderColor: '#FFFFFF'
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FCD34D',
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 14,
    marginBottom: 16
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#B45309',
    letterSpacing: 0.8
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 10
  },
  description: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
    maxWidth: 380
  },
  emergencyCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFF1F2',
    borderWidth: 1,
    borderColor: '#FECDD3',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20
  },
  emergencyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6
  },
  emergencyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#9F1239'
  },
  emergencySub: {
    fontSize: 12,
    color: '#881337',
    lineHeight: 17,
    marginBottom: 12
  },
  emergencyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.emergency,
    paddingVertical: 12,
    borderRadius: 12,
    elevation: 2
  },
  emergencyBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.white
  },
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 13,
    marginBottom: 16,
    elevation: 1
  },
  refreshBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary
  },
  adminLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12
  },
  adminLinkText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textLight
  }
});

export default MaintenanceScreen;
