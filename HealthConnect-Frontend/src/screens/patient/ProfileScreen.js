import React from 'react';
import { View, Text, StyleSheet,  ScrollView, TouchableOpacity, Alert, Platform, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../../components/Avatar';
import Card from '../../components/Card';
import colors from '../../utils/colors';

const ProfileScreen = ({ navigation }) => {
  const { height: windowHeight } = useWindowDimensions();
  const { user, logout, switchRole } = useAuth();

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to sign out of HealthConnect?')) {
        logout();
      }
    } else {
      Alert.alert('Sign Out', 'Are you sure you want to sign out of HealthConnect?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: () => logout() }
      ]);
    }
  };



  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Profile</Text>
      </View>

      <View style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
        {/* User Info card */}
        <View style={styles.profileCard}>
          <Avatar uri={user.avatar} size={80} />
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.email}>{user.email}</Text>
          <View style={styles.badgeRow}>
            <View style={styles.pill}>
              <Text style={styles.pillText}>Blood Type: {user.bloodType || 'N/A'}</Text>
            </View>
            <View style={styles.pill}>
              <Text style={styles.pillText}>Age: {user.age || 'N/A'}</Text>
            </View>
          </View>
        </View>

        {/* Options List */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Account Settings</Text>

          <Card style={styles.listCard}>
            <TouchableOpacity style={styles.optionRow} onPress={() => navigation.navigate('EditProfile')}>
              <View style={styles.optionLeft}>
                <View style={[styles.iconCircle, { backgroundColor: 'rgba(42, 157, 143, 0.1)' }]}>
                  <Ionicons name="person-outline" size={20} color={colors.primary} />
                </View>
                <Text style={styles.optionLabel}>Edit Profile</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.optionRow}>
              <View style={styles.optionLeft}>
                <View style={[styles.iconCircle, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
                  <Ionicons name="notifications-outline" size={20} color="#3B82F6" />
                </View>
                <Text style={styles.optionLabel}>Notifications</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.optionRow} onPress={() => navigation.navigate('PrivacyPolicy')}>
              <View style={styles.optionLeft}>
                <View style={[styles.iconCircle, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
                  <Ionicons name="shield-checkmark-outline" size={20} color="#F59E0B" />
                </View>
                <Text style={styles.optionLabel}>Privacy Policy</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.optionRow} onPress={() => navigation.navigate('MedicalCard')}>
              <View style={styles.optionLeft}>
                <View style={[styles.iconCircle, { backgroundColor: 'rgba(139, 92, 246, 0.1)' }]}>
                  <Ionicons name="card-outline" size={20} color="#8B92F6" />
                </View>
                <Text style={styles.optionLabel}>Emergency Medical ID</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
            </TouchableOpacity>
          </Card>
        </View>



        {/* Support Section */}
        <View style={[styles.settingsSection, { marginTop: 12 }]}>
          <Card style={styles.listCard}>
            <TouchableOpacity style={styles.optionRow}>
              <View style={styles.optionLeft}>
                <View style={[styles.iconCircle, { backgroundColor: 'rgba(107, 114, 128, 0.1)' }]}>
                  <Ionicons name="help-circle-outline" size={20} color={colors.textSecondary} />
                </View>
                <Text style={styles.optionLabel}>Help & Support</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.optionRow} onPress={handleLogout}>
              <View style={styles.optionLeft}>
                <View style={[styles.iconCircle, { backgroundColor: colors.emergencyFaded }]}>
                  <Ionicons name="log-out-outline" size={20} color={colors.emergency} />
                </View>
                <Text style={[styles.optionLabel, { color: colors.emergency }]}>Logout</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
            </TouchableOpacity>
          </Card>
        </View>
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
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary
  },
  devBtn: {
    padding: 4
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40
  },
  profileCard: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 24
  },
  name: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 14
  },
  email: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4
  },
  badgeRow: {
    flexDirection: 'row',
    marginTop: 14,
    gap: 10
  },
  pill: {
    backgroundColor: colors.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border
  },
  pillText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary
  },
  settingsSection: {
    marginBottom: 16
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 10,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  listCard: {
    padding: 0,
    overflow: 'hidden',
    borderRadius: 16
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginHorizontal: 16
  },
  devCardInline: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 20,
    marginTop: 16
  },
  devHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  devTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginLeft: 8
  },
  devButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8
  },
  devBtnInline: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border
  },
  devBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  devBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary
  },
  devBtnTextActive: {
    color: colors.white
  }
});

export default ProfileScreen;
