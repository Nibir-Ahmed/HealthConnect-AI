import React from 'react';
import { Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import DoctorHomeScreen from '../screens/doctor/DoctorHomeScreen';
import DoctorAppointmentsScreen from '../screens/doctor/DoctorAppointmentsScreen';
import DoctorProfileSettingsScreen from '../screens/doctor/DoctorProfileSettingsScreen';
import BlogEditorScreen from '../screens/admin/BlogEditorScreen';
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
            <Ionicons name={focused ? 'calendar' : 'calendar-outline'} size={24} color={color} />
          )
        }}
      />
      <Tab.Screen
        name="DoctorBlogEditor"
        component={BlogEditorScreen}
        options={{
          tabBarLabel: 'Write Blog',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'create' : 'create-outline'} size={24} color={color} />
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