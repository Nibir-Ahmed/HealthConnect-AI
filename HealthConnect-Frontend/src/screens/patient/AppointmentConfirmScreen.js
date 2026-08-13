import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Avatar from '../../components/Avatar';
import colors from '../../utils/colors';
import api from '../../services/api';
const AppointmentConfirmScreen = ({ route, navigation }) => {
  const { doctor, date, time } = route.params;
  const [loading, setLoading] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  // Convert the ISO date string back to Date object for display
  const dateObj = new Date(date);
  const displayDate = dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  const handleConfirm = async () => {
    try {
      setLoading(true);
      
      // We convert 02:00 PM to HH:mm for the backend
      const [timeStr, modifier] = time.split(' ');
      let [hours, minutes] = timeStr.split(':');
      if (hours === '12') {
        hours = '00';
      }
      if (modifier === 'PM') {
        hours = parseInt(hours, 10) + 12;
      }
      const timeFormatted = `${hours}:${minutes}:00`;
      
      await api.post('/appointments', {
        doctorId: doctor.id,
        date: dateObj.toISOString().split('T')[0], // YYYY-MM-DD
        time: timeFormatted,
        type: 'chat',
        reason: 'General Consultation'
      });
      
      setIsConfirmed(true);
    } catch (error) {
      console.error('Booking error:', error);
      Alert.alert('Booking Failed', 'There was a problem booking your appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  if (!isConfirmed) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Confirm Booking</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.content}>
          <Text style={styles.title}>Review Details</Text>
          <Text style={styles.subtitle}>Please review your consultation details before confirming.</Text>
          <Card style={styles.detailsCard}>
            <View style={styles.doctorInfo}>
              <Avatar uri={doctor.User?.avatar || doctor.avatar} size={50} />
              <View style={styles.doctorText}>
                <Text style={styles.doctorName}>{doctor.User?.name || doctor.name}</Text>
                <Text style={styles.doctorSpecialty}>{doctor.specialty}</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Ionicons name="calendar" size={16} color={colors.primary} />
                <Text style={styles.metaText}>{displayDate}</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="time" size={16} color={colors.primary} />
                <Text style={styles.metaText}>{time}</Text>
              </View>
            </View>
            
            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Ionicons name="card" size={16} color={colors.primary} />
                <Text style={styles.metaText}>Fee: ${doctor.consultationFee}</Text>
              </View>
            </View>
          </Card>
        </View>
        <View style={styles.footer}>
          <Button
            title={loading ? "Processing..." : "Confirm Booking"}
            onPress={handleConfirm}
            disabled={loading}
          />
        </View>
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Success Icon */}
        <View style={styles.successIconCircle}>
          <Ionicons name="checkmark" size={60} color={colors.white} />
        </View>
        <Text style={styles.title}>Appointment Confirmed!</Text>
        <Text style={styles.subtitle}>Your chat consultation slot has been booked.</Text>
        {/* Details Card */}
        <Card style={styles.detailsCard}>
          <View style={styles.doctorInfo}>
            <Avatar uri={doctor.User?.avatar || doctor.avatar} size={50} />
            <View style={styles.doctorText}>
              <Text style={styles.doctorName}>{doctor.User?.name || doctor.name}</Text>
              <Text style={styles.doctorSpecialty}>{doctor.specialty}</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="calendar" size={16} color={colors.primary} />
              <Text style={styles.metaText}>{displayDate}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="time" size={16} color={colors.primary} />
              <Text style={styles.metaText}>{time}</Text>
            </View>
          </View>
          <View style={styles.notesRow}>
            <Ionicons name="information-circle-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.notesText}>You will be able to chat with your doctor at the scheduled time.</Text>
          </View>
        </Card>
      </View>
      <View style={styles.footer}>
        <Button
          title="View Appointments"
          onPress={() => navigation.replace('MainTabs', { screen: 'Appointments' })}
          style={styles.viewBtn}
        />
        <Button
          title="Go to Home"
          variant="outline"
          onPress={() => navigation.replace('MainTabs', { screen: 'Home' })}
        />
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
    justifyContent: 'center',
    paddingHorizontal: 24
  },
  successIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    boxShadow: '0px 4px 8px rgba(0,0,0,0.1)',
    elevation: 4
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 8
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32
  },
  detailsCard: {
    width: '100%',
    padding: 20
  },
  doctorInfo: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  doctorText: {
    marginLeft: 14
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary
  },
  doctorSpecialty: {
    fontSize: 13,
    color: colors.primary,
    marginTop: 2
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: 16
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  metaText: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '600',
    marginLeft: 8
  },
  notesRow: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 10,
    alignItems: 'center'
  },
  notesText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 8,
    flex: 1,
    lineHeight: 16
  },
  footer: {
    padding: 20
  },
  viewBtn: {
    marginBottom: 12
  }
});
export default AppointmentConfirmScreen;