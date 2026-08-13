import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Platform, useWindowDimensions, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Avatar from '../../components/Avatar';
import colors from '../../utils/colors';
import api from '../../services/api';
const EditProfileScreen = ({ navigation }) => {
  const { height: windowHeight } = useWindowDimensions();
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [bloodType, setBloodType] = useState(user?.bloodType || '');
  const [age, setAge] = useState(user?.age ? user.age.toString() : '');
  const [allergies, setAllergies] = useState(user?.allergies?.join(', ') || '');
  const [ecName, setEcName] = useState(user?.emergencyContact?.name || '');
  const [ecPhone, setEcPhone] = useState(user?.emergencyContact?.phone || '');
  const [ecRelation, setEcRelation] = useState(user?.emergencyContact?.relation || '');
  const [loading, setLoading] = useState(false);
  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }
    try {
      setLoading(true);
      const allergiesArray = allergies.split(',').map(a => a.trim()).filter(a => a);
      const emergencyContact = ecName || ecPhone || ecRelation ? { name: ecName, phone: ecPhone, relation: ecRelation } : null;
      await api.put('/auth/profile', {
        name,
        phone,
        avatar,
        bloodType,
        age: age ? parseInt(age, 10) : null,
        allergies: allergiesArray,
        emergencyContact
      });
      
      updateUser({ 
        name, 
        phone, 
        avatar, 
        bloodType, 
        age: age ? parseInt(age, 10) : null,
        allergies: allergiesArray,
        emergencyContact
      });
      if (Platform.OS === 'web') {
        window.alert('Profile updated successfully!');
        navigation.goBack();
      } else {
        Alert.alert('Success', 'Profile updated successfully!', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 40 }} />
      </View>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        enabled={Platform.OS === 'ios'}
      >
        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={true} keyboardShouldPersistTaps="handled">
        <View style={styles.avatarSection}>
          <Avatar uri={avatar || 'https://ui-avatars.com/api/?name=User'} size={100} />
          <TouchableOpacity style={styles.editAvatarBtn} onPress={() => {
            // Simulate picking image
            setAvatar('https://ui-avatars.com/api/?name=' + name.split(' ').join('+'));
          }}>
            <Ionicons name="camera" size={20} color={colors.white} />
          </TouchableOpacity>
        </View>
        <View style={styles.form}>
          <Input
            label="Full Name"
            placeholder="Enter your full name"
            icon="person-outline"
            value={name}
            onChangeText={setName}
          />
          <Input
            label="Phone Number"
            placeholder="Enter your phone number"
            icon="call-outline"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
          <Input
            label="Avatar URL (Optional)"
            placeholder="Enter image URL"
            icon="image-outline"
            value={avatar}
            onChangeText={setAvatar}
          />
          
          <Input
            label="Blood Type"
            placeholder="e.g. O+, A-, B+"
            icon="water-outline"
            value={bloodType}
            onChangeText={setBloodType}
          />
          <Input
            label="Age"
            placeholder="Enter your age"
            icon="calendar-outline"
            value={age}
            onChangeText={setAge}
            keyboardType="number-pad"
          />
          <Input
            label="Allergies (comma separated)"
            placeholder="e.g. Peanuts, Penicillin"
            icon="medical-outline"
            value={allergies}
            onChangeText={setAllergies}
          />
          
          <Text style={styles.sectionHeading}>Emergency Contact</Text>
          
          <Input
            label="Contact Name"
            placeholder="Name"
            icon="person-outline"
            value={ecName}
            onChangeText={setEcName}
          />
          <Input
            label="Contact Phone"
            placeholder="Phone number"
            icon="call-outline"
            value={ecPhone}
            onChangeText={setEcPhone}
            keyboardType="phone-pad"
          />
          <Input
            label="Relation"
            placeholder="e.g. Spouse, Parent"
            icon="people-outline"
            value={ecRelation}
            onChangeText={setEcRelation}
          />
          
          <Button
            title={loading ? "Saving..." : "Save Changes"}
            onPress={handleSave}
            disabled={loading}
            style={[styles.saveBtn, { marginTop: 24 }]}
          />
        </View>
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary
  },
  backBtn: {
    padding: 8,
    marginLeft: -8
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 24,
    paddingBottom: 120
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 32,
    position: 'relative'
  },
  editAvatarBtn: {
    position: 'absolute',
    bottom: 0,
    right: '35%',
    backgroundColor: colors.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.background
  },
  form: {
    backgroundColor: colors.white,
    padding: 20,
    borderRadius: 16,
    boxShadow: '0px 4px 8px rgba(0,0,0,0.1)',
    elevation: 2,
    marginBottom: 24
  },
  saveBtn: {
    marginTop: 8
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 16,
    marginBottom: 12,
  }
});
export default EditProfileScreen;