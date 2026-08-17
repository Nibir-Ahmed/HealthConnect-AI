import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../screens/patient/HomeScreen';
import EmergencyChatScreen from '../screens/patient/EmergencyChatScreen';
import BlogFeedScreen from '../screens/patient/BlogFeedScreen';
import MyAppointmentsScreen from '../screens/patient/MyAppointmentsScreen';
import MessagesScreen from '../screens/common/MessagesScreen';
import ProfileScreen from '../screens/patient/ProfileScreen';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../utils/colors';

const Tab = createBottomTabNavigator();

const PatientTabs = () => {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, Platform.OS === 'ios' ? 24 : 12);
  const tabHeight = 56 + bottomPadding;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopWidth: 1,
          borderTopColor: 'rgba(0,0,0,0.06)',
          height: tabHeight,
          paddingBottom: bottomPadding,
          paddingTop: 6,
          boxShadow: '0px -2px 10px rgba(0,0,0,0.06)',
          elevation: 8
        },
        tabBarItemStyle: {
          paddingHorizontal: 0,
          paddingVertical: 2,
        },
        tabBarLabelStyle: {
          fontSize: 10.5,
          fontWeight: '600',
          marginTop: 2,
          letterSpacing: -0.2,
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