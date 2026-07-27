import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Switch, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Button from '../../components/Button';
import Card from '../../components/Card';
import colors from '../../utils/colors';
import api from '../../services/api';

const DAYS_OF_WEEK = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
];

const SetAvailabilityScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [schedule, setSchedule] = useState(
    DAYS_OF_WEEK.map(day => ({
      dayOfWeek: day,
      enabled: false,
      startTime: '09:00',
      endTime: '17:00'
    }))
  );

  useEffect(() => {
    fetchAvailability();
  }, []);

  const fetchAvailability = async () => {
    try {
      const response = await api.get('/doctors/profile/me');
      const availabilities = response.data.availabilities || [];
      
      const newSchedule = schedule.map(day => {
        const found = availabilities.find(a => a.dayOfWeek === day.dayOfWeek);
        if (found) {
          return {
            ...day,
            enabled: true,
            startTime: found.startTime.substring(0, 5), // '09:00:00' -> '09:00'
            endTime: found.endTime.substring(0, 5)
          };
        }
        return day;
      });
      setSchedule(newSchedule);
    } catch (error) {
      console.error('Failed to fetch availability:', error);
      Alert.alert('Error', 'Failed to load your current schedule.');
    } finally {
      setLoading(false);
    }
  };

  const toggleDay = (index) => {
    const newSchedule = [...schedule];
    newSchedule[index].enabled = !newSchedule[index].enabled;
    setSchedule(newSchedule);
  };

  const updateTime = (index, field, value) => {
    const newSchedule = [...schedule];
    newSchedule[index][field] = value;
    setSchedule(newSchedule);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      // Filter out only enabled days
      const activeAvailabilities = schedule
        .filter(d => d.enabled)
        .map(d => ({
          dayOfWeek: d.dayOfWeek,
          startTime: d.startTime,
          endTime: d.endTime
        }));

      await api.post('/doctors/availability', {
        availabilities: activeAvailabilities
      });
      
      Alert.alert('Success', 'Availability schedule updated successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Failed to update availability:', error);
      Alert.alert('Error', 'Could not save your schedule.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="arrow-back" size={24} color={colors.textPrimary} onPress={() => navigation.goBack()} />
        <Text style={styles.headerTitle}>Availability Slots</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView style={{ flex: 1 }} contentContainerStyle={[styles.content, { flexGrow: 1 }]}>
          <Text style={styles.description}>
            Set your working days and consultation hours. These slots will be visible to patients booking an appointment.
          </Text>

          <Card style={styles.card}>
            {schedule.map((item, index) => (
              <View key={item.dayOfWeek} style={styles.dayRow}>
                <View style={styles.dayHeader}>
                  <Text style={styles.dayText}>{item.dayOfWeek}</Text>
                  <Switch
                    value={item.enabled}
                    onValueChange={() => toggleDay(index)}
                    trackColor={{ false: colors.border, true: colors.primary }}
                  />
                </View>

                {item.enabled && (
                  <View style={styles.timeInputsRow}>
                    <View style={styles.timeInputBox}>
                      <Text style={styles.timeLabel}>Start</Text>
                      <TextInput
                        style={styles.timeInput}
                        value={item.startTime}
                        onChangeText={(val) => updateTime(index, 'startTime', val)}
                        placeholder="HH:MM"
                      />
                    </View>
                    <Text style={styles.toText}>to</Text>
                    <View style={styles.timeInputBox}>
                      <Text style={styles.timeLabel}>End</Text>
                      <TextInput
                        style={styles.timeInput}
                        value={item.endTime}
                        onChangeText={(val) => updateTime(index, 'endTime', val)}
                        placeholder="HH:MM"
                      />
                    </View>
                  </View>
                )}
              </View>
            ))}
          </Card>

          <Button 
            title="Save Schedule" 
            onPress={handleSave} 
            loading={saving}
            style={{ marginTop: 24 }}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary
  },
  content: {
    padding: 20,
    paddingBottom: 40
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 20,
    lineHeight: 20
  },
  card: {
    padding: 0,
    overflow: 'hidden'
  },
  dayRow: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    padding: 16
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  dayText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary
  },
  timeInputsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16
  },
  timeInputBox: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 6,
    fontWeight: '500'
  },
  timeInput: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    color: colors.textPrimary,
    textAlign: 'center'
  },
  toText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 20
  }
});

export default SetAvailabilityScreen;
