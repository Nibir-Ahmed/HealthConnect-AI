import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import DoctorVerificationScreen from '../screens/admin/DoctorVerificationScreen';
import PatientDirectoryScreen from '../screens/admin/PatientDirectoryScreen';
import AdminSettingsScreen from '../screens/admin/AdminSettingsScreen';
import colors from '../utils/colors';
const Tab = createBottomTabNavigator();
const AdminTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopWidth: 0,
          height: 80,
          paddingBottom: 12,
          paddingTop: 8,
          boxShadow: '0px 4px 8px rgba(0,0,0,0.1)',
          elevation: 10
        },
        tabBarLabelStyle: {
          fontSize: 13,
          fontWeight: '600',
          marginTop: 4
        }
      }}
    >
      <Tab.Screen
        name="AdminDashboard"
        component={AdminDashboardScreen}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'analytics' : 'analytics-outline'} size={24} color={color} />
          )
        }}
      />
      <Tab.Screen
        name="AdminVerification"
        component={DoctorVerificationScreen}
        options={{
          tabBarLabel: 'Verify',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'checkbox' : 'checkbox-outline'} size={24} color={color} />
          )
        }}
      />
      <Tab.Screen
        name="AdminPatients"
        component={PatientDirectoryScreen}
        options={{
          tabBarLabel: 'Patients',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'people' : 'people-outline'} size={24} color={color} />
          )
        }}
      />
      <Tab.Screen
        name="AdminSettings"
        component={AdminSettingsScreen}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'settings' : 'settings-outline'} size={24} color={color} />
          )
        }}
      />
    </Tab.Navigator>
  );
};
export default AdminTabs;