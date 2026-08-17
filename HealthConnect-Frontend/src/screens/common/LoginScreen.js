import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet,  TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/Input';
import Button from '../../components/Button';
import colors from '../../utils/colors';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '../../services/firebase';
import { GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, signInWithCredential } from 'firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
const LoginScreen = ({ route, navigation }) => {
  const { height: windowHeight } = useWindowDimensions();
  const { login, googleLogin } = useAuth();
  const role = route.params?.role || 'patient';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Configure Google Sign-In for mobile
  useEffect(() => {
    if (Platform.OS !== 'web') {
      GoogleSignin.configure({
        webClientId: '710819612061-s1vqlm81lqg4jmerba7u6peshoce1481.apps.googleusercontent.com',
      });
    }
  }, []);

  useEffect(() => {
    if (Platform.OS === 'web') {
      const checkRedirect = async () => {
        try {
          const result = await getRedirectResult(auth);
          if (result && result.user) {
            setLoading(true);
            const user = result.user;
            const savedRole = await AsyncStorage.getItem('pendingGoogleLoginRole') || 'patient';
            await AsyncStorage.removeItem('pendingGoogleLoginRole');
            
            const googleUserData = {
              email: user.email,
              name: user.displayName,
              avatar: user.photoURL,
              role: savedRole
            };
            const loginResult = await googleLogin(googleUserData);
            if (!loginResult.success) {
              setError(loginResult.message);
            }
            setLoading(false);
          }
        } catch (err) {
          console.error("Redirect Result Error:", err);
          setError(err.message || 'Google Login failed');
        }
      };
      checkRedirect();
    }
  }, []);

  const handleGoogleLogin = async () => {
    if (role === 'admin') {
      setError('Admin accounts can only log in using Email and Password.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });

      if (Platform.OS === 'web') {
        try {
          const result = await signInWithPopup(auth, provider);
          const user = result.user;
          
          const googleUserData = {
            uid: user.uid,
            email: user.email,
            name: user.displayName || 'Google User',
            avatar: user.photoURL,
            role: role
          };
          const loginResult = await googleLogin(googleUserData);
          if (!loginResult.success) {
            setError(loginResult.message);
          }
        } catch (popupError) {
          console.log('Popup failed (possibly COOP blocked), falling back to redirect...', popupError);
          await AsyncStorage.setItem('pendingGoogleLoginRole', role);
          await signInWithRedirect(auth, provider);
        }
      } else {
        // Native mobile Google Sign-In
        try {
          await GoogleSignin.hasPlayServices();
          const response = await GoogleSignin.signIn();
          const idToken = response.data?.idToken;

          if (!idToken) {
            throw new Error('Failed to get ID token from Google Sign-In');
          }

          // Create Firebase credential from native Google token
          const credential = GoogleAuthProvider.credential(idToken);
          const userCredential = await signInWithCredential(auth, credential);
          const user = userCredential.user;

          const googleUserData = {
            uid: user.uid,
            email: user.email,
            name: user.displayName || 'Google User',
            avatar: user.photoURL,
            role: role
          };
          const loginResult = await googleLogin(googleUserData);
          if (!loginResult.success) {
            setError(loginResult.message);
          }
        } catch (mobileError) {
          console.error('Native Google Sign-In Error:', mobileError);
          if (mobileError.code !== 'SIGN_IN_CANCELLED') {
            setError(mobileError.message || 'Google Sign-In failed');
          }
        }
      }
    } catch (error) {
      console.error('Firebase Google Login Error:', error);
      setError(error.message || 'Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };
  const handleLogin = async () => {
    // Basic validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    setError('');
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    
    if (!result.success) {
      setError(result.message);
    }
  };
  const getRoleColor = () => {
    if (role === 'doctor') return colors.info;
    if (role === 'admin') return colors.warning;
    return colors.primary;
  };
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.header}>
            <View style={[styles.roleIcon, { backgroundColor: getRoleColor() + '1A' }]}>
              <Ionicons 
                name={role === 'doctor' ? 'medkit' : role === 'admin' ? 'shield-checkmark' : 'person'} 
                size={40} 
                color={getRoleColor()} 
              />
            </View>
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>Sign in to your {role} account</Text>
          </View>
          <View style={styles.form}>
            <Input
              label="Email Address"
              placeholder="Enter your email"
              icon="mail-outline"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              error={error && !email ? 'Email is required' : ''}
            />
            <Input
              label="Password"
              placeholder="Enter your password"
              icon="lock-closed-outline"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              error={error && !password ? 'Password is required' : ''}
            />
            <TouchableOpacity style={styles.forgotBtn} onPress={() => navigation.navigate('ForgotPassword')}>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>
            {error && email && password ? <Text style={styles.errorText}>{error}</Text> : null}
            <Button
              title={loading ? 'Logging in...' : `Login as ${role.charAt(0).toUpperCase() + role.slice(1)}`}
              onPress={handleLogin}
              style={[styles.loginBtn, { backgroundColor: getRoleColor() }]}
              disabled={loading}
            />
            
            {/* Google login is enabled ONLY for patients and doctors, NOT for admin */}
            {role !== 'admin' ? (
              <>
                <View style={styles.dividerRow}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>OR</Text>
                  <View style={styles.dividerLine} />
                </View>
                <TouchableOpacity 
                  style={styles.googleBtn} 
                  onPress={handleGoogleLogin}
                  disabled={loading}
                >
                  <Ionicons name="logo-google" size={20} color={colors.textPrimary} style={styles.googleIcon} />
                  <Text style={styles.googleBtnText}>Continue with Google</Text>
                </TouchableOpacity>

                <View style={styles.registerRow}>
                  <Text style={styles.registerText}>Don't have an account? </Text>
                  <TouchableOpacity onPress={() => navigation.navigate('Register', { role })}>
                    <Text style={[styles.registerLink, { color: getRoleColor() }]}>Sign Up</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <View style={styles.adminSecurityNote}>
                <Ionicons name="shield-checkmark" size={16} color={colors.warning} />
                <Text style={styles.adminSecurityText}>
                  Restricted Portal • Authorized Admin Credentials Only
                </Text>
              </View>
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
  roleIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
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
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: 24
  },
  forgotText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary
  },
  errorText: {
    color: colors.emergency,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16
  },
  loginBtn: {
    marginBottom: 16
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8
  },
  registerText: {
    fontSize: 14,
    color: colors.textSecondary
  },
  registerLink: {
    fontSize: 14,
    fontWeight: '700'
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 12,
    color: colors.textLight,
    fontWeight: '600'
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 14,
    marginBottom: 16
  },
  googleIcon: {
    marginRight: 10
  },
  googleBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary
  },
  adminSecurityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 8
  },
  adminSecurityText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: colors.textSecondary
  }
});
export default LoginScreen;