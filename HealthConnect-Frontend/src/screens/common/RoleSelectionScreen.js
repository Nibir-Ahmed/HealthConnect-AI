import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../utils/colors';
const RoleCard = ({ title, description, icon, color, onPress }) => (
  <TouchableOpacity style={[styles.card, { borderColor: color }]} onPress={onPress}>
    <View style={[styles.iconContainer, { backgroundColor: color + '1A' }]}>
      <Ionicons name={icon} size={32} color={color} />
    </View>
    <View style={styles.textContainer}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardDescription}>{description}</Text>
    </View>
    <Ionicons name="chevron-forward" size={24} color={colors.textLight} />
  </TouchableOpacity>
);
const RoleSelectionScreen = ({ navigation }) => {
  const handleRoleSelect = (role) => {
    navigation.navigate('Login', { role });
  };
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Image source={require('../../../assets/splash-icon.png')} style={styles.logo} />
        <Text style={styles.title}>Welcome to HealthConnect</Text>
        <Text style={styles.subtitle}>How would you like to use the app?</Text>
      </View>
      <View style={styles.content}>
        <RoleCard 
          title="I'm a Patient" 
          description="Book consultations & manage health" 
          icon="person" 
          color={colors.primary} 
          onPress={() => handleRoleSelect('patient')}
        />
        <RoleCard 
          title="I'm a Doctor" 
          description="Manage practice & consult patients" 
          icon="medkit" 
          color={colors.info} 
          onPress={() => handleRoleSelect('doctor')}
        />
        <RoleCard 
          title="Admin Panel" 
          description="Platform management" 
          icon="shield-checkmark" 
          color={colors.warning} 
          onPress={() => handleRoleSelect('admin')}
        />
      </View>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 24,
    alignItems: 'center',
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    boxShadow: '0px 4px 8px rgba(0,0,0,0.1)',
    elevation: 2,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: colors.textSecondary,
  }
});
export default RoleSelectionScreen;