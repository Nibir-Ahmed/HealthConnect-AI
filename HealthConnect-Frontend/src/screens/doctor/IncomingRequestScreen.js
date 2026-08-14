import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';;
import { Ionicons } from '@expo/vector-icons';
import Avatar from '../../components/Avatar';
import Button from '../../components/Button';
import Card from '../../components/Card';
import colors from '../../utils/colors';

import api from '../../services/api';

const IncomingRequestScreen = ({ route, navigation }) => {
  const { request } = route.params;

  const handleAccept = async () => {
    try {
      await api.put(`/appointments/${request.id}/status`, { status: 'confirmed' });
      navigation.replace('PatientChat', { appointment: { ...request, status: 'confirmed' } });
    } catch (error) {
      console.error('Error accepting request', error);
    }
  };

  const handleDecline = async () => {
    try {
      await api.put(`/appointments/${request.id}/status`, { status: 'cancelled' });
      navigation.goBack();
    } catch (error) {
      console.error('Error declining request', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Consultation Request</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        {/* Pulsing Avatar Area */}
        <View style={styles.avatarArea}>
          <View style={styles.pulseBg} />
          <Avatar uri={request.patient?.avatar} name={request.patient?.name} size={100} />
        </View>

        <Text style={styles.patientName}>{request.patient?.name || 'Unknown Patient'}</Text>
        <Text style={styles.patientMeta}>Consultation Request</Text>

        {/* Symptoms Details */}
        <Card style={styles.detailCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Reason</Text>
            <Text style={styles.infoVal}>{request.reason || 'Not specified'}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Date & Time</Text>
            <Text style={styles.infoVal}>{request.date} at {request.time}</Text>
          </View>
        </Card>
      </View>

      {/* Accept / Decline Footer */}
      <View style={styles.footer}>
        <Button title="Accept Consultation" onPress={handleAccept} style={styles.acceptBtn} />
        <Button title="Decline" variant="outline" onPress={handleDecline} />
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
    padding: 4
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary
  },
  content: {
    flex: 1,
    alignItems: 'center',
    padding: 24,
    justifyContent: 'center'
  },
  avatarArea: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20
  },
  pulseBg: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: colors.primaryFaded,
    position: 'absolute'
  },
  patientName: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary
  },
  patientMeta: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 6,
    marginBottom: 32
  },
  detailCard: {
    width: '100%',
    padding: 20
  },
  infoRow: {
    alignItems: 'flex-start'
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6
  },
  infoVal: {
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 20
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: 14,
    width: '100%'
  },
  footer: {
    backgroundColor: colors.white,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border
  },
  acceptBtn: {
    marginBottom: 12
  }
});

export default IncomingRequestScreen;
