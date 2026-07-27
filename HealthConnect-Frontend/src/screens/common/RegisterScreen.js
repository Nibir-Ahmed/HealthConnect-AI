import React, { useState } from 'react';
import { View, Text, StyleSheet,  TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/Input';
import Button from '../../components/Button';
import colors from '../../utils/colors';
import { Ionicons } from '@expo/vector-icons';
const RegisterScreen = ({ route, navigation }) => {
  const { height: windowHeight } = useWindowDimensions();
  const { register } = useAuth();
  const role = route.params?.role || 'patient';
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Patient specific
  const [phone, setPhone] = useState('');
  
  // Doctor specific
  const [specialty, setSpecialty] = useState('');
  const [university, setUniversity] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const getRoleColor = () => {
    if (role === 'doctor') return colors.info;
    if (role === 'admin') return colors.warning;
    return colors.primary;
  };
  const handleRegister = async () => {
    // Basic validation
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all required fields');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (role === 'patient' && !phone) {
      setError('Phone number is required');
      return;
    }
    if (role === 'doctor' && (!specialty || !university || !licenseNumber)) {
      setError('Please fill in all doctor details');
      return;
    }
    setError('');
    setLoading(true);
    
    const userData = {
      name,
      email,
      password,
      role,
      ...(role === 'patient' && { phone }),
      ...(role === 'doctor' && { specialty, university, licenseNumber, phone }) // Include phone for doctor too if needed, but our UI currently doesn't collect phone for doctors in register screen unless we add it
    };
    const result = await register(userData);
    setLoading(false);
    if (result.success) {
      Alert.alert(
        'Registration Success',
        `Welcome to HealthConnect! Logged in as ${name}.`
      );
    } else {
      setError(result.message);
    }
  };
  if (role === 'admin') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.adminBlock}>
          <Ionicons name="shield-checkmark" size={64} color={colors.warning} />
          <Text style={styles.title}>Admin Registration</Text>
          <Text style={[styles.subtitle, { marginTop: 16 }]}>
            Admin accounts cannot be self-registered for security reasons. Please contact an existing administrator to create your account.
          </Text>
          <Button 
            title="Go Back" 
            onPress={() => navigation.goBack()} 
            style={[styles.registerBtn, { backgroundColor: colors.warning, marginTop: 32 }]} 
          />
        </View>
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join HealthConnect as a {role}</Text>
          </View>
          <View style={styles.form}>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            <Input
              label="Full Name *"
              placeholder="Enter your name"
              icon="person-outline"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
            <Input
              label="Email Address *"
              placeholder="Enter your email"
              icon="mail-outline"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {role === 'patient' && (
              <Input
                label="Phone Number *"
                placeholder="Enter your phone number"
                icon="call-outline"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            )}
            {role === 'doctor' && (
              <>
                <Input
                  label="Specialty *"
                  placeholder="e.g. Cardiologist"
                  icon="medical-outline"
                  value={specialty}
                  onChangeText={setSpecialty}
                />
                <Input
                  label="Medical University *"
                  placeholder="e.g. Dhaka Medical College"
                  icon="school-outline"
                  value={university}
                  onChangeText={setUniversity}
                />
                <Input
                  label="License Number *"
                  placeholder="Enter medical license ID"
                  icon="id-card-outline"
                  value={licenseNumber}
                  onChangeText={setLicenseNumber}
                />
              </>
            )}
            <Input
              label="Password *"
              placeholder="Create a password"
              icon="lock-closed-outline"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />
            <Input
              label="Confirm Password *"
              placeholder="Repeat your password"
              icon="lock-closed-outline"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              autoCapitalize="none"
            />
            <Button
              title={loading ? 'Creating...' : "Create Account"}
              onPress={handleRegister}
              style={[styles.registerBtn, { backgroundColor: getRoleColor() }]}
              disabled={loading}
            />
            <View style={styles.loginRow}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login', { role })}>
                <Text style={[styles.loginLink, { color: getRoleColor() }]}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 20
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    marginBottom: 20
  },
  header: {
    alignItems: 'center',
    marginBottom: 24
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 8
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    textTransform: 'capitalize'
  },
  form: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    boxShadow: '0px 4px 8px rgba(0,0,0,0.1)',
    elevation: 2
  },
  errorText: {
    color: colors.emergency,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16
  },
  registerBtn: {
    marginTop: 10,
    marginBottom: 16
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8
  },
  loginText: {
    fontSize: 14,
    color: colors.textSecondary
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '700'
  },
  adminBlock: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32
  }
});
export default RegisterScreen;