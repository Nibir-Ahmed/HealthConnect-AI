import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';

// Navigators
import AuthNavigator from './AuthNavigator';
import PatientTabs from './PatientTabs';
import DoctorTabs from './DoctorTabs';
import AdminTabs from './AdminTabs';

// Patient Screens
import HomeScreen from '../screens/patient/HomeScreen';
import EmergencyChatScreen from '../screens/patient/EmergencyChatScreen';
import DoctorListScreen from '../screens/patient/DoctorListScreen';
import DoctorProfileScreen from '../screens/patient/DoctorProfileScreen';
import AppointmentConfirmScreen from '../screens/patient/AppointmentConfirmScreen';
import MyAppointmentsScreen from '../screens/patient/MyAppointmentsScreen';
import DoctorChatScreen from '../screens/patient/DoctorChatScreen';
import MedicalCardScreen from '../screens/patient/MedicalCardScreen';
import BMICalculatorScreen from '../screens/patient/BMICalculatorScreen';
import SavedBlogsScreen from '../screens/patient/SavedBlogsScreen';
import BlogFeedScreen from '../screens/patient/BlogFeedScreen';
import BlogDetailScreen from '../screens/patient/BlogDetailScreen';
import MedicineReminderScreen from '../screens/patient/MedicineReminderScreen';
import HealthRecordsScreen from '../screens/patient/HealthRecordsScreen';
import NearestHospitalScreen from '../screens/patient/NearestHospitalScreen';
import PrescriptionDetailScreen from '../screens/patient/PrescriptionDetailScreen';
import EditProfileScreen from '../screens/patient/EditProfileScreen';
import PrivacyPolicyScreen from '../screens/patient/PrivacyPolicyScreen';
import ProfileScreen from '../screens/patient/ProfileScreen';

// Doctor Screens
import IncomingRequestScreen from '../screens/doctor/IncomingRequestScreen';
import PatientChatScreen from '../screens/doctor/PatientChatScreen';
import PrescriptionScreen from '../screens/doctor/PrescriptionScreen';
import PatientVaultScreen from '../screens/doctor/PatientVaultScreen';
import SetAvailabilityScreen from '../screens/doctor/SetAvailabilityScreen';
import ConsultationSettingsScreen from '../screens/doctor/ConsultationSettingsScreen';
import DoctorProfileSettingsScreen from '../screens/doctor/DoctorProfileSettingsScreen';

// Admin Screens
import BlogEditorScreen from '../screens/admin/BlogEditorScreen';
import PatientDirectoryScreen from '../screens/admin/PatientDirectoryScreen';
import DoctorVerificationScreen from '../screens/admin/DoctorVerificationScreen';
import AdminSettingsScreen from '../screens/admin/AdminSettingsScreen';

import { Platform } from 'react-native';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const { user } = useAuth();

  if (!user) {
    return <AuthNavigator />;
  }

  // Choose the root tab view based on role
  const getRootComponent = () => {
    switch (user.role) {
      case 'doctor':
        return DoctorTabs;
      case 'admin':
        return AdminTabs;
      case 'patient':
      default:
        return PatientTabs;
    }
  };

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animationEnabled: Platform.OS !== 'web' }}>
      {/* Root Tab Screen */}
      <Stack.Screen name="MainTabs" component={getRootComponent()} />

      {/* Shared & Patient Screens */}
      <Stack.Screen name="EmergencyChat" component={EmergencyChatScreen} />
      <Stack.Screen name="DoctorList" component={DoctorListScreen} />
      <Stack.Screen name="DoctorProfile" component={DoctorProfileScreen} />
      <Stack.Screen name="AppointmentConfirm" component={AppointmentConfirmScreen} />
      <Stack.Screen name="MyAppointments" component={MyAppointmentsScreen} />
      <Stack.Screen name="DoctorChat" component={DoctorChatScreen} />
      <Stack.Screen name="MedicalCard" component={MedicalCardScreen} options={{ headerShown: false }} />
      <Stack.Screen name="HealthRecords" component={HealthRecordsScreen} />
      <Stack.Screen name="MedicineReminder" component={MedicineReminderScreen} />
      <Stack.Screen name="BMICalculator" component={BMICalculatorScreen} />
      <Stack.Screen name="SavedBlogs" component={SavedBlogsScreen} />
      <Stack.Screen name="NearestHospital" component={NearestHospitalScreen} />
      <Stack.Screen name="BlogFeed" component={BlogFeedScreen} />
      <Stack.Screen name="BlogDetail" component={BlogDetailScreen} />
      <Stack.Screen name="PrescriptionDetail" component={PrescriptionDetailScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ headerShown: false }} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Profile" component={ProfileScreen} />

      {/* Doctor Screens */}
      <Stack.Screen name="IncomingRequest" component={IncomingRequestScreen} options={{ headerShown: false }} />
      <Stack.Screen name="PatientChat" component={PatientChatScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Prescription" component={PrescriptionScreen} />
      <Stack.Screen name="PatientVault" component={PatientVaultScreen} options={{ headerShown: false }} />
      <Stack.Screen name="SetAvailability" component={SetAvailabilityScreen} />
      <Stack.Screen name="ConsultationSettings" component={ConsultationSettingsScreen} />
      <Stack.Screen name="DoctorProfileSettings" component={DoctorProfileSettingsScreen} />

      {/* Admin Screens */}
      <Stack.Screen name="BlogEditor" component={BlogEditorScreen} />
      <Stack.Screen name="PatientDirectory" component={PatientDirectoryScreen} />
      <Stack.Screen name="DoctorVerification" component={DoctorVerificationScreen} />
      <Stack.Screen name="AdminSettings" component={AdminSettingsScreen} />
    </Stack.Navigator>
  );
};

export default AppNavigator;
