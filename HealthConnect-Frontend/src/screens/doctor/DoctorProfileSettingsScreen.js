import React from 'react';
import { View, Text, StyleSheet,  ScrollView, TouchableOpacity, Alert, Platform, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../../components/Avatar';
import Card from '../../components/Card';
import colors from '../../utils/colors';

const DoctorProfileSettingsScreen = () => {
  const { height: windowHeight } = useWindowDimensions();
  const navigation = useNavigation();
  const { logout, switchRole, user } = useAuth();

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      logout();
    } else {
      Alert.alert('Sign Out', 'Sign out of Doctor Portal?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: () => logout() }
      ]);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Doctor Profile</Text>
      </View>

      <View style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
        {/* Doctor Info Card */}
        <View style={styles.profileCard}>
          <Avatar uri={user?.avatar} name={user?.name || 'Doctor'} size={80} />
          <Text style={styles.name}>{user?.name || 'Doctor Name'}</Text>
          <Text style={styles.specialty}>{user?.specialty || 'General Physician'}</Text>
          <Text style={styles.hospital}>{user?.university || 'HealthConnect Medical'}</Text>
        </View>

        {/* Options List */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Preferences</Text>

          <Card style={styles.listCard}>
            <TouchableOpacity 
              style={styles.optionRow}
              onPress={() => navigation.navigate('SetAvailability')}
            >
              <View style={styles.optionLeft}>
                <View style={[styles.iconCircle, { backgroundColor: 'rgba(42, 157, 143, 0.1)' }]}>
                  <Ionicons name="time-outline" size={20} color={colors.primary} />
                </View>
                <Text style={styles.optionLabel}>Set Availability Slots</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity 
              style={styles.optionRow}
              onPress={() => navigation.navigate('ConsultationSettings')}
            >
              <View style={styles.optionLeft}>
                <View style={[styles.iconCircle, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
                  <Ionicons name="settings-outline" size={20} color="#3B82F6" />
                </View>
                <Text style={styles.optionLabel}>Consultation Settings</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
            </TouchableOpacity>
          </Card>
        </View>



        {/* Actions */}
        <View style={styles.settingsSection}>
          <Card style={styles.listCard}>
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
  specialty: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    marginTop: 4
  },
  hospital: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4
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
    marginBottom: 20
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

export default DoctorProfileSettingsScreen;
