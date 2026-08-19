import React, { useState } from 'react';
import { View, Text, StyleSheet,  TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Input from '../../components/Input';
import Button from '../../components/Button';
import colors from '../../utils/colors';
import { Ionicons } from '@expo/vector-icons';
const ForgotPasswordScreen = ({ navigation }) => {
  const { height: windowHeight } = useWindowDimensions();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const handleResetPassword = () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    setError('');
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 1500);
  };
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        enabled={Platform.OS === 'ios'}
      >
        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <Ionicons name="key-outline" size={40} color={colors.primary} />
            </View>
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.subtitle}>
              Enter the email associated with your account and we'll send an email with instructions to reset your password.
            </Text>
          </View>
          <View style={styles.form}>
            {success ? (
              <View style={styles.successContainer}>
                <Ionicons name="checkmark-circle" size={60} color={colors.success} />
                <Text style={styles.successTitle}>Check your email</Text>
                <Text style={styles.successText}>
                  We have sent password recovery instructions to {email}
                </Text>
                <Button
                  title="Back to Login"
                  onPress={() => navigation.goBack()}
                  style={styles.submitBtn}
                />
              </View>
            ) : (
              <>
                {error ? <Text style={styles.errorText}>{error}</Text> : null}
                <Input
                  label="Email Address"
                  placeholder="Enter your email"
                  icon="mail-outline"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <Button
                  title={loading ? 'Sending...' : 'Send Instructions'}
                  onPress={handleResetPassword}
                  style={styles.submitBtn}
                  disabled={loading}
                />
              </>
            )}
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
    marginBottom: 32
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primaryFaded,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 8
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22
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
  submitBtn: {
    marginTop: 8
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 20
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 16,
    marginBottom: 8
  },
  successText: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22
  }
});
export default ForgotPasswordScreen;