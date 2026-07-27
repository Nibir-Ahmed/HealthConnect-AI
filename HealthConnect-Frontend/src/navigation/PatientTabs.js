import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../screens/patient/HomeScreen';
import EmergencyChatScreen from '../screens/patient/EmergencyChatScreen';
import BlogFeedScreen from '../screens/patient/BlogFeedScreen';
import MyAppointmentsScreen from '../screens/patient/MyAppointmentsScreen';
import MessagesScreen from '../screens/common/MessagesScreen';
import ProfileScreen from '../screens/patient/ProfileScreen';
import colors from '../utils/colors';
const Tab = createBottomTabNavigator();
const PatientTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
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
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={24} color={color} />
          )
        }}
      />
      <Tab.Screen
        name="Emergency"
        component={EmergencyChatScreen}
        options={{
          tabBarLabel: 'Emergency',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'alert-circle' : 'alert-circle-outline'} size={24} color={colors.emergency} />
          )
        }}
      />
      <Tab.Screen
        name="Blogs"
        component={BlogFeedScreen}
        options={{
          tabBarLabel: 'Blogs',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'book' : 'book-outline'} size={24} color={color} />
          )
        }}
      />
      <Tab.Screen
        name="Appointments"
        component={MyAppointmentsScreen}
        options={{
          tabBarLabel: 'Bookings',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'calendar' : 'calendar-outline'} size={24} color={color} />
          )
        }}
      />
      <Tab.Screen
        name="Messages"
        component={MessagesScreen}
        options={{
          tabBarLabel: 'Messages',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'chatbubbles' : 'chatbubbles-outline'} size={24} color={color} />
          )
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={24} color={color} />
          )
        }}
      />
    </Tab.Navigator>
  );
};
export default PatientTabs;