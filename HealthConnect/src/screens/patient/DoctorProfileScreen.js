import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Button from '../../components/Button';
import Avatar from '../../components/Avatar';
import colors from '../../utils/colors';
import { getDoctorById } from '../../services/doctorsApi';

const generateAvailableSlots = (availabilities) => {
  if (!availabilities || availabilities.length === 0) {
    // Fallback if no availabilities set
    return [
      { date: new Date(), day: 'Today', times: ['10:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'] },
      { date: new Date(Date.now() + 86400000), day: 'Tomorrow', times: ['09:00 AM', '01:00 PM', '03:00 PM'] }
    ];
  }

  const daysMap = {
    'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3,
    'Thursday': 4, 'Friday': 5, 'Saturday': 6
  };

  const slots = [];
  const today = new Date();
  
  // Look ahead 14 days
  for (let i = 0; i < 14; i++) {
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + i);
    const dayName = targetDate.toLocaleDateString('en-US', { weekday: 'long' });
    
    const dayAvail = availabilities.find(a => a.dayOfWeek === dayName);
    if (dayAvail) {
      // Generate 30 min slots between startTime and endTime
      const times = [];
      let [startH, startM] = dayAvail.startTime.split(':').map(Number);
      const [endH, endM] = dayAvail.endTime.split(':').map(Number);
      
      let currentMinutes = startH * 60 + startM;
      const endMinutes = endH * 60 + endM;

      while (currentMinutes + 30 <= endMinutes) {
        const h = Math.floor(currentMinutes / 60);
        const m = currentMinutes % 60;
        const ampm = h >= 12 ? 'PM' : 'AM';
        const displayH = h % 12 || 12;
        times.push(`${displayH.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${ampm}`);
        currentMinutes += 30;
      }

      let displayDay = dayName;
      if (i === 0) displayDay = 'Today';
      else if (i === 1) displayDay = 'Tomorrow';

      slots.push({
        date: targetDate,
        day: displayDay,
        times
      });
    }
  }

  return slots;
};

const DoctorProfileScreen = ({ route, navigation }) => {
  const { height: windowHeight } = useWindowDimensions();
  const { doctor: initialDoctor } = route.params;
  const [doctor, setDoctor] = useState(initialDoctor);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [selectedTimeIndex, setSelectedTimeIndex] = useState(-1);

  useEffect(() => {
    const fetchFullDoctor = async () => {
      try {
        const fullDoctor = await getDoctorById(initialDoctor.id);
        if (fullDoctor) {
          // Merge initial list data with full details
          setDoctor({
             ...initialDoctor,
             availabilities: fullDoctor.availabilities || [],
             bio: fullDoctor.bio,
             experience: fullDoctor.experience,
             consultationFee: fullDoctor.consultationFee
          });
        }
      } catch (error) {
        console.error('Failed to fetch full doctor profile', error);
      }
    };
    fetchFullDoctor();
  }, [initialDoctor.id]);

  const availableSlots = useMemo(() => generateAvailableSlots(doctor.availabilities), [doctor.availabilities]);
  const activeDay = availableSlots[selectedDayIndex];

  const handleBook = () => {
    let chosenTime = activeDay?.times?.[selectedTimeIndex];
    if (!chosenTime && activeDay?.times?.length > 0) {
      chosenTime = activeDay.times[0];
    }
    if (!activeDay || !chosenTime) {
      Alert.alert('Booking Error', 'Please select a consultation time slot.');
      return;
    }
    navigation.navigate('AppointmentConfirm', {
      doctor,
      date: activeDay.date.toISOString(), 
      time: chosenTime
    });
  };

  const isOnline = doctor.User?.isOnline !== false && doctor.isOnline !== false;

  const handleDirectChat = async () => {
    try {
      await api.post('/appointments', {
        doctorId: doctor.id,
        date: new Date().toISOString().split('T')[0],
        time: '10:00:00',
        type: 'chat',
        reason: 'Direct Chat Consultation'
      });
    } catch (e) {
      console.log('Background appointment sync:', e.message);
    }
    navigation.navigate('DoctorChat', { doctor });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Doctor Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={{ flex: 1 }}>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          {/* Doctor Info Card */}
          <View style={styles.profileCard}>
            <Avatar uri={doctor.User?.avatar || doctor.avatar} size={100} online={isOnline} />
            <Text style={[styles.name, { marginTop: 16 }]}>{doctor.User?.name || doctor.name}</Text>
            <Text style={styles.specialty}>{doctor.specialty}</Text>
            <View style={[styles.onlinePill, { backgroundColor: isOnline ? 'rgba(34, 197, 94, 0.12)' : 'rgba(156, 163, 175, 0.12)' }]}>
              <View style={[styles.onlineDot, { backgroundColor: isOnline ? '#22C55E' : '#9CA3AF' }]} />
              <Text style={[styles.onlineText, { color: isOnline ? '#15803D' : '#6B7280' }]}>
                {isOnline ? 'Online • Available Now' : 'Offline'}
              </Text>
            </View>
            <Text style={styles.university}>{doctor.university}</Text>

            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statVal}>{doctor.experience}y</Text>
                <Text style={styles.statLabel}>Experience</Text>
              </View>
              <View style={[styles.statBox, styles.statBorder]}>
                <Text style={styles.statVal}>{doctor.rating} ★</Text>
                <Text style={styles.statLabel}>Rating</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statVal}>${doctor.consultationFee}</Text>
                <Text style={styles.statLabel}>Fee</Text>
              </View>
            </View>
          </View>

          {/* Bio */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Biography</Text>
            <Text style={styles.bioText}>{doctor.bio || 'Providing premium clinical consults and patient-centered treatment schemes.'}</Text>
          </View>

          {/* Available Dates */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Available Days</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dayScroll}>
              {availableSlots.length > 0 ? availableSlots.map((slot, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dayChip,
                    selectedDayIndex === index && styles.activeDayChip
                  ]}
                  onPress={() => {
                    setSelectedDayIndex(index);
                    setSelectedTimeIndex(-1); // Reset selected time
                  }}
                >
                  <Text style={[
                    styles.dayText,
                    selectedDayIndex === index && styles.activeDayText
                  ]}>
                    {slot.day.slice(0, 3)}
                  </Text>
                  <Text style={{ fontSize: 10, color: selectedDayIndex === index ? colors.white : colors.textSecondary, marginTop: 4 }}>
                    {slot.date.getDate()}/{slot.date.getMonth() + 1}
                  </Text>
                </TouchableOpacity>
              )) : (
                <Text style={{ color: colors.textSecondary }}>No available days</Text>
              )}
            </ScrollView>
          </View>

          {/* Available Times */}
          {activeDay && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Available Slots ({activeDay.day})</Text>
              <View style={styles.timeGrid}>
                {activeDay.times.length > 0 ? activeDay.times.map((time, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.timeChip,
                      selectedTimeIndex === index && styles.activeTimeChip
                    ]}
                    onPress={() => setSelectedTimeIndex(index)}
                  >
                    <Text style={[
                      styles.timeText,
                      selectedTimeIndex === index && styles.activeTimeText
                    ]}>
                      {time}
                    </Text>
                  </TouchableOpacity>
                )) : (
                  <Text style={{ color: colors.textSecondary }}>No slots available</Text>
                )}
              </View>
            </View>
          )}
        </ScrollView>
      </View>

      {/* Booking & Direct Chat Action */}
      <View style={styles.footerRow}>
        <TouchableOpacity style={styles.directChatBtn} onPress={handleDirectChat}>
          <Ionicons name="chatbubble-ellipses" size={20} color={colors.white} />
          <Text style={styles.directChatBtnText}>Start Direct Chat</Text>
        </TouchableOpacity>
        <Button title="Book Consultation" onPress={handleBook} style={{ flex: 1 }} />
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
  scrollContainer: {
    paddingBottom: 40
  },
  profileCard: {
    backgroundColor: colors.white,
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
    backgroundColor: colors.background
  },
  name: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary
  },
  specialty: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
    marginTop: 4
  },
  onlinePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    marginTop: 8,
    alignSelf: 'center'
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginRight: 6
  },
  onlineText: {
    fontSize: 12,
    fontWeight: '700'
  },
  university: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 20,
    width: '100%',
    justifyContent: 'space-between'
  },
  statBox: {
    flex: 1,
    alignItems: 'center'
  },
  statBorder: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: colors.divider
  },
  statVal: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 24
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12
  },
  bioText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20
  },
  dayScroll: {
    paddingRight: 20
  },
  dayChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: colors.white,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.border
  },
  activeDayChip: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  dayText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary
  },
  activeDayText: {
    color: colors.white
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  timeChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: '22%',
    alignItems: 'center'
  },
  activeTimeChip: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  timeText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary
  },
  activeTimeText: {
    color: colors.white
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 12
  },
  directChatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8
  },
  directChatBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.white
  },
  footer: {
    backgroundColor: colors.white,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border
  }
});

export default DoctorProfileScreen;
