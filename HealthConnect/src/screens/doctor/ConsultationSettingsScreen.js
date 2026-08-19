import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Button from '../../components/Button';
import Card from '../../components/Card';
import colors from '../../utils/colors';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const ConsultationSettingsScreen = ({ navigation }) => {
  const { user } = useAuth();
  const doctorId = user?.uid || user?.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states
  const [specialty, setSpecialty] = useState('');
  const [university, setUniversity] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [experience, setExperience] = useState('');
  const [bio, setBio] = useState('');
  const [consultationFee, setConsultationFee] = useState('');

  useEffect(() => {
    fetchProfile();
  }, [doctorId]);

  const fetchProfile = async () => {
    try {
      if (doctorId) {
        const docRef = doc(db, 'doctors', doctorId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setSpecialty(data.specialty || '');
          setUniversity(data.university || '');
          setLicenseNumber(data.licenseNumber || '');
          setExperience(data.experience ? String(data.experience) : '');
          setBio(data.bio || '');
          setConsultationFee(data.consultationFee ? String(data.consultationFee) : '');
        }
      }
    } catch (error) {
      console.warn('Firestore fetch doctor profile note:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const updateData = {
        specialty,
        university,
        licenseNumber,
        experience: parseInt(experience, 10) || 0,
        bio,
        consultationFee: parseFloat(consultationFee) || 0,
        updatedAt: new Date().toISOString()
      };

      if (doctorId) {
        await setDoc(doc(db, 'doctors', doctorId), updateData, { merge: true });
      }
      
      Alert.alert('Success', 'Profile settings updated successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Failed to update doctor profile:', error);
      Alert.alert('Error', 'Failed to update profile settings.');
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
        <Text style={styles.headerTitle}>Consultation Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.description}>
          Update your public profile, professional credentials, and consultation fee below.
        </Text>

        <Card style={styles.card}>
          <Text style={styles.inputLabel}>Specialty</Text>
          <TextInput
            style={styles.input}
            value={specialty}
            onChangeText={setSpecialty}
            placeholder="e.g. Cardiologist"
            placeholderTextColor={colors.textLight}
          />

          <Text style={styles.inputLabel}>University / Hospital</Text>
          <TextInput
            style={styles.input}
            value={university}
            onChangeText={setUniversity}
            placeholder="e.g. HealthConnect Medical"
            placeholderTextColor={colors.textLight}
          />

          <Text style={styles.inputLabel}>License Number</Text>
          <TextInput
            style={styles.input}
            value={licenseNumber}
            onChangeText={setLicenseNumber}
            placeholder="e.g. MD1234567"
            placeholderTextColor={colors.textLight}
          />

          <Text style={styles.inputLabel}>Experience (Years)</Text>
          <TextInput
            style={styles.input}
            value={experience}
            onChangeText={setExperience}
            placeholder="e.g. 10"
            keyboardType="numeric"
            placeholderTextColor={colors.textLight}
          />

          <Text style={styles.inputLabel}>Consultation Fee ($)</Text>
          <TextInput
            style={styles.input}
            value={consultationFee}
            onChangeText={setConsultationFee}
            placeholder="e.g. 50"
            keyboardType="numeric"
            placeholderTextColor={colors.textLight}
          />

          <Text style={styles.inputLabel}>Professional Bio</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={bio}
            onChangeText={setBio}
            placeholder="Write a short bio about your expertise and services."
            placeholderTextColor={colors.textLight}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </Card>

        <Button 
          title="Save Settings" 
          onPress={handleSave} 
          loading={saving}
          style={{ marginTop: 24 }}
        />
      </ScrollView>
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
    padding: 20
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
    marginTop: 16
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 14,
    fontSize: 15,
    color: colors.textPrimary
  },
  textArea: {
    height: 100
  }
});

export default ConsultationSettingsScreen;
