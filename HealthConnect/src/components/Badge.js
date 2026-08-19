import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '../utils/colors';

const VARIANT_STYLES = {
  success: { backgroundColor: colors.success + '18', color: colors.success },
  warning: { backgroundColor: colors.warning + '18', color: colors.warning },
  info: { backgroundColor: colors.info + '18', color: colors.info },
  emergency: { backgroundColor: colors.emergencyFaded || colors.emergency + '18', color: colors.emergency },
  primary: { backgroundColor: colors.primaryFaded || colors.primary + '18', color: colors.primary }
};

const Badge = ({ text, variant = 'info', style }) => {
  const variantStyle = VARIANT_STYLES[variant] || VARIANT_STYLES.info;
  return (
    <View style={[styles.badge, { backgroundColor: variantStyle.backgroundColor }, style]}>
      <Text style={[styles.text, { color: variantStyle.color }]}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start'
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.2
  }
});

export default Badge;
