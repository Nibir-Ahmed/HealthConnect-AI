import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, Animated, Easing, Platform } from 'react-native';
import colors from '../../utils/colors';
const SplashScreen = ({ navigation }) => {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: false,
      }),
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.05,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        })
      ])
    ]).start();
    const timer = setTimeout(() => {
      navigation.replace('Onboarding');
    }, 3000);
    return () => clearTimeout(timer);
  }, []);
  return (
    <View style={styles.container}>
      <Animated.View style={[styles.logoContainer, { opacity: opacityAnim, transform: [{ scale: scaleAnim }] }]}>
        <View style={styles.iconCircle}>
          <Image source={require('../../../assets/splash-icon.png')} style={styles.logoImage} resizeMode="contain" />
        </View>
        <Text style={styles.appName}>HealthConnect</Text>
        <Text style={styles.appTagline}>Your Digital Health Companion</Text>
      </Animated.View>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A', // Deep dark-mode inspired background
    alignItems: 'center',
    justifyContent: 'center'
  },
  logoContainer: {
    alignItems: 'center'
  },
  iconCircle: {
    width: 140,
    height: 140,
    borderRadius: 32,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    ...Platform.select({
      web: {
        boxShadow: '0px 0px 20px rgba(0, 201, 255, 0.5)',
      },
      default: {
        boxShadow: '0px 4px 8px rgba(0,0,0,0.1)',
        elevation: 10,
      }
    }),
    overflow: 'hidden'
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  appName: {
    fontSize: 34,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: 1
  },
  appTagline: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 8,
    fontWeight: '500'
  }
});
export default SplashScreen;