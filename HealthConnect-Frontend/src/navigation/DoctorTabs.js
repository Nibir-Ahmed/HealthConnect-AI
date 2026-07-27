import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import DoctorHomeScreen from '../screens/doctor/DoctorHomeScreen';
import DoctorAppointmentsScreen from '../screens/doctor/DoctorAppointmentsScreen';
import DoctorProfileSettingsScreen from '../screens/doctor/DoctorProfileSettingsScreen';
import MessagesScreen from '../screens/common/MessagesScreen';
import colors from '../utils/colors';
const Tab = createBottomTabNavigator();
const DoctorTabs = () => {
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
        name="DoctorHome"
        component={DoctorHomeScreen}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'grid' : 'grid-outline'} size={24} color={color} />
          )
        }}
      />
      <Tab.Screen
        name="DoctorAppointments"
        component={DoctorAppointmentsScreen}
        options={{
          tabBarLabel: 'Consults',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'chatbox-ellipses' : 'chatbox-ellipses-outline'} size={24} color={color} />
          )
        }}
      />
      <Tab.Screen
        name="Messages"
        component={MessagesScreen}
        options={{
          tabBarLabel: 'Messages',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'chatbubbles' : 'chatbubbles-outline'} size={24} color={color} />
          )
        }}
      />
      <Tab.Screen
        name="DoctorProfile"
        component={DoctorProfileSettingsScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={24} color={color} />
          )
        }}
      />
    </Tab.Navigator>
  );
};
export default DoctorTabs;