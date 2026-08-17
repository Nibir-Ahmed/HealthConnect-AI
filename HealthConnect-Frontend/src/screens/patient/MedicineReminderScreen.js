import React, { useState } from 'react';
import { View, Text, StyleSheet,  FlatList, TouchableOpacity, ScrollView, Alert, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import MedicineCard from '../../components/MedicineCard';
import Input from '../../components/Input';
import Button from '../../components/Button';
import colors from '../../utils/colors';
import { useAuth } from '../../context/AuthContext';
import { sendNotification } from '../../services/notificationService';

const INITIAL_REMINDERS = [
  { id: '1', name: 'Metformin 500mg', dosage: '1 Tablet', frequency: 'After meals', time: '08:30 AM', isActive: true, colorIndex: 0 },
  { id: '2', name: 'Atorvastatin 10mg', dosage: '1 Tablet', frequency: 'At bedtime', time: '10:00 PM', isActive: true, colorIndex: 1 },
  { id: '3', name: 'Vitamin D3', dosage: '1 Capsule', frequency: 'Once weekly', time: '12:00 PM', isActive: false, colorIndex: 2 }
];
const MedicineReminderScreen = ({ navigation }) => {
  const { height: windowHeight } = useWindowDimensions();
  const { user } = useAuth();
  const [reminders, setReminders] = useState(INITIAL_REMINDERS);
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [time, setTime] = useState('');
  const [frequency, setFrequency] = useState('');
  const handleToggle = (id, val) => {
    setReminders((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isActive: val } : item))
    );
  };
  const handleDelete = (id) => {
    setReminders((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAdd = async () => {
    if (!name || !dosage || !time || !frequency) {
      Alert.alert('Form Error', 'Please complete all fields to set a reminder.');
      return;
    }
    const newReminder = {
      id: Math.random().toString(),
      name,
      dosage,
      frequency,
      time,
      isActive: true,
      colorIndex: reminders.length
    };
    setReminders((prev) => [...prev, newReminder]);

    // Send in-app notification
    await sendNotification({
      userId: user?.id || user?.uid,
      title: 'Medicine Reminder Set! 💊',
      body: `Reminder active for ${name} (${dosage}) - ${frequency} at ${time}.`,
      type: 'medicine',
      route: 'MedicineReminder'
    });

    setName('');
    setDosage('');
    setTime('');
    setFrequency('');
    setIsAdding(false);
    Alert.alert('Success', 'Reminder added and scheduled successfully!');
  };
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Medicine Reminders</Text>
        <View style={{ width: 40 }} />
      </View>
      <View style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled" style={{ flex: 1 }}>
        {isAdding ? (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Add New Reminder</Text>
            <Input label="Medicine Name" placeholder="e.g. Metformin 500mg" value={name} onChangeText={setName} icon="medkit-outline" />
            <Input label="Dosage" placeholder="e.g. 1 Tablet" value={dosage} onChangeText={setDosage} icon="flask-outline" />
            <Input label="Frequency" placeholder="e.g. After meals" value={frequency} onChangeText={setFrequency} icon="repeat-outline" />
            <Input label="Time" placeholder="e.g. 08:30 AM" value={time} onChangeText={setTime} icon="time-outline" />
            <View style={styles.formActions}>
              <Button title="Save Reminder" onPress={handleAdd} style={styles.saveBtn} />
              <Button title="Cancel" variant="outline" onPress={() => setIsAdding(false)} />
            </View>
          </View>
        ) : (
          <View style={styles.listSection}>
            <View style={styles.listHeader}>
              <Text style={styles.sectionTitle}>Active Reminders</Text>
              <TouchableOpacity style={styles.addIconBtn} onPress={() => setIsAdding(true)}>
                <Ionicons name="add" size={24} color={colors.primary} />
              </TouchableOpacity>
            </View>
            {reminders.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="notifications-off-outline" size={48} color={colors.textLight} />
                <Text style={styles.emptyText}>No reminders set</Text>
              </View>
            ) : (
              reminders.map((item) => (
                <MedicineCard
                  key={item.id}
                  medicine={item}
                  onToggle={(val) => handleToggle(item.id, val)}
                  onDelete={() => handleDelete(item.id)}
                />
              ))
            )}
          </View>
        )}
      </ScrollView>
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
    padding: 20
  },
  formCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    boxShadow: '0px 4px 8px rgba(0,0,0,0.1)',
    elevation: 2
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 16
  },
  formActions: {
    marginTop: 8,
    gap: 10
  },
  saveBtn: {
    marginBottom: 2
  },
  listSection: {
    width: '100%'
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary
  },
  addIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryFaded,
    alignItems: 'center',
    justifyContent: 'center'
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textLight,
    marginTop: 10
  }
});
export default MedicineReminderScreen;