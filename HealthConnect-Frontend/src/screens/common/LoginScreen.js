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
import { GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult } from 'firebase/auth';
const LoginScreen = ({ route, navigation }) => {
  const { height: windowHeight } = useWindowDimensions();
  const { login, googleLogin } = useAuth();
  const role = route.params?.role || 'patient';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
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
    setError('');
    setLoading(true);
    try {
      if (Platform.OS === 'web') {
        const provider = new GoogleAuthProvider();
        try {
          const result = await signInWithPopup(auth, provider);
          const user = result.user;
          
          const googleUserData = {
            email: user.email,
            name: user.displayName,
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
        setError('Google Login is currently only supported on Web.');
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
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
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
  }
});
export default LoginScreen;