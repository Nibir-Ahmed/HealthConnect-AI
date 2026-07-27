import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Avatar from './Avatar';
import Badge from './Badge';
import colors from '../utils/colors';
const STATUS_VARIANT = {
  upcoming: 'primary',
  completed: 'success',
  cancelled: 'emergency'
};
const AppointmentCard = ({ appointment, onPress }) => {
  const { doctor, date, time, status } = appointment;
  const statusLabel = status.charAt(0).toUpperCase() + status.slice(1);
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.topRow}>
        <Avatar uri={doctor?.avatar} size={48} />
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>{doctor?.name}</Text>
          <Text style={styles.specialty} numberOfLines={1}>{doctor?.specialty}</Text>
        </View>
        <Badge text={statusLabel} variant={STATUS_VARIANT[status] || 'info'} />
      </View>
      <View style={styles.dateRow}>
        <View style={styles.dateItem}>
          <Ionicons name="calendar-outline" size={16} color={colors.primary} />
          <Text style={styles.dateText}>{date}</Text>
        </View>
        <View style={styles.dateItem}>
          <Ionicons name="time-outline" size={16} color={colors.primary} />
          <Text style={styles.dateText}>{time}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};
const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    boxShadow: '0px 4px 8px rgba(0,0,0,0.1)',
    elevation: 4,
    marginBottom: 12
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  info: {
    flex: 1,
    marginLeft: 12
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary
  },
  specialty: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    gap: 20
  },
  dateItem: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  dateText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginLeft: 6
  }
});
export default AppointmentCard;