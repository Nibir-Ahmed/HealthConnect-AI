import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Avatar from './Avatar';
import colors from '../utils/colors';
const DoctorCard = ({ doctor, onPress }) => {
  const name = doctor.User?.name || doctor.name || 'Unknown Doctor';
  const avatar = doctor.User?.avatar || doctor.avatar;
  const isOnline = doctor.User?.isOnline || doctor.isOnline;
  const { specialty, rating, reviews, experience } = doctor;
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.topRow}>
        <Avatar uri={avatar} size={56} online={isOnline} />
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>{name}</Text>
          <Text style={styles.specialty} numberOfLines={1}>{specialty}</Text>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={14} color="#F4B740" />
            <Text style={styles.ratingText}>{rating}</Text>
            <Text style={styles.reviewsText}>({reviews} reviews)</Text>
          </View>
        </View>
      </View>
      <View style={styles.bottomRow}>
        <View style={styles.experienceRow}>
          <Ionicons name="briefcase-outline" size={14} color={colors.textSecondary} />
          <Text style={styles.experienceText}>{experience} exp</Text>
        </View>
        <TouchableOpacity style={styles.bookButton} onPress={onPress} activeOpacity={0.7}>
          <Text style={styles.bookText}>Book</Text>
        </TouchableOpacity>
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
    marginLeft: 14
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary
  },
  specialty: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    marginLeft: 4
  },
  reviewsText: {
    fontSize: 12,
    color: colors.textLight,
    marginLeft: 4
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.divider
  },
  experienceRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  experienceText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginLeft: 6
  },
  bookButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8
  },
  bookText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textWhite
  }
});
export default DoctorCard;