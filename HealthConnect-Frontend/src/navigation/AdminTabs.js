import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import DoctorVerificationScreen from '../screens/admin/DoctorVerificationScreen';
import PatientDirectoryScreen from '../screens/admin/PatientDirectoryScreen';
import AdminSettingsScreen from '../screens/admin/AdminSettingsScreen';
import { Platform } from 'react-native';
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
          borderTopWidth: 1,
          borderTopColor: 'rgba(0,0,0,0.06)',
          height: Platform.OS === 'ios' ? 84 : 66,
          paddingBottom: Platform.OS === 'ios' ? 24 : 8,
          paddingTop: 6,
          boxShadow: '0px -2px 10px rgba(0,0,0,0.06)',
          elevation: 8
        },
        tabBarItemStyle: {
          paddingHorizontal: 0,
          paddingVertical: 2,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
          letterSpacing: -0.2,
        }
      }}
    >
      <Tab.Screen
        name="AdminDashboard"
        component={AdminDashboardScreen}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'stats-chart' : 'stats-chart-outline'} size={22} color={color} />
          )
        }}
      />
      <Tab.Screen
        name="AdminVerification"
        component={DoctorVerificationScreen}
        options={{
          tabBarLabel: 'Doctors',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'shield-checkmark' : 'shield-checkmark-outline'} size={22} color={color} />
          )
        }}
      />
      <Tab.Screen
        name="AdminPatients"
        component={PatientDirectoryScreen}
        options={{
          tabBarLabel: 'Users & Roles',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'people' : 'people-outline'} size={22} color={color} />
          )
        }}
      />
      <Tab.Screen
        name="AdminSettings"
        component={AdminSettingsScreen}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'settings' : 'settings-outline'} size={22} color={color} />
          )
        }}
      />
    </Tab.Navigator>
  );
};

export default AdminTabs;