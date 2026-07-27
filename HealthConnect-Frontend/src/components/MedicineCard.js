import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../utils/colors';
const PILL_COLORS = [colors.primary, colors.emergency, colors.info, colors.warning, colors.success];
const MedicineCard = ({ medicine, onToggle }) => {
  const { name, dosage, frequency, time, isActive, colorIndex = 0 } = medicine;
  const pillColor = PILL_COLORS[colorIndex % PILL_COLORS.length];
  return (
    <View style={styles.card}>
      <View style={[styles.iconCircle, { backgroundColor: pillColor + '18' }]}>
        <Ionicons name="medical" size={22} color={pillColor} />
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{name}</Text>
        <Text style={styles.dosage} numberOfLines={1}>{dosage} • {frequency}</Text>
        <View style={styles.timeRow}>
          <Ionicons name="time-outline" size={13} color={colors.textLight} />
          <Text style={styles.timeText}>{time}</Text>
        </View>
      </View>
      <Switch
        value={isActive}
        onValueChange={(val) => onToggle && onToggle(val)}
        trackColor={{ false: colors.border, true: colors.primaryLight || colors.primary + '50' }}
        thumbColor={isActive ? colors.primary : colors.textLight}
        ios_backgroundColor={colors.border}
      />
    </View>
  );
};
const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    boxShadow: '0px 4px 8px rgba(0,0,0,0.1)',
    elevation: 4,
    marginBottom: 12
  },
  iconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center'
  },
  info: {
    flex: 1,
    marginLeft: 14
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary
  },
  dosage: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4
  },
  timeText: {
    fontSize: 12,
    color: colors.textLight,
    marginLeft: 4
  }
});
export default MedicineCard;