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
const AppointmentCard = ({ appointment, onPress, onCancel }) => {
  const { doctor, date, time, status } = appointment;
  const statusLabel = status.charAt(0).toUpperCase() + status.slice(1);
  const isOnline = doctor?.isOnline !== false;
  const isActionable = status === 'pending' || status === 'confirmed' || status === 'upcoming';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.topRow}>
        <Avatar uri={doctor?.avatar} size={48} online={isOnline} />
        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>{doctor?.name}</Text>
            <View style={[styles.onlineBadge, { backgroundColor: isOnline ? 'rgba(34, 197, 94, 0.12)' : 'rgba(156, 163, 175, 0.12)' }]}>
              <View style={[styles.onlineDot, { backgroundColor: isOnline ? '#22C55E' : '#9CA3AF' }]} />
              <Text style={[styles.onlineText, { color: isOnline ? '#15803D' : '#6B7280' }]}>
                {isOnline ? 'Online' : 'Offline'}
              </Text>
            </View>
          </View>
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

      {/* Action Buttons */}
      {isActionable && (
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.chatBtn} onPress={onPress}>
            <Ionicons name="chatbubble-ellipses" size={16} color={colors.white} />
            <Text style={styles.chatBtnText}>Start Chat</Text>
          </TouchableOpacity>
          {onCancel && (
            <TouchableOpacity style={styles.cancelBtn} onPress={() => onCancel(appointment.id)}>
              <Ionicons name="close-circle-outline" size={16} color={colors.emergency} />
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
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
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    flex: 1
  },
  onlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 6
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 3
  },
  onlineText: {
    fontSize: 10,
    fontWeight: '700'
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
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    gap: 12
  },
  chatBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 10,
    gap: 6
  },
  chatBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.white
  },
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    gap: 4
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.emergency
  }
});
export default AppointmentCard;