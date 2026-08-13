import { Platform } from 'react-native';
import Constants from 'expo-constants';

const getHostIp = () => {
  const hostUri = Constants.expoConfig?.hostUri || Constants.manifest?.debuggerHost || Constants.manifest2?.extra?.expoGo?.developer?.tool;
  if (hostUri) {
    const ip = hostUri.split(':')[0];
    if (ip && ip !== 'localhost' && ip !== '127.0.0.1') {
      return ip;
    }
  }
  if (Platform.OS === 'android') return '10.0.2.2';
  return '192.168.1.100'; // Wi-Fi LAN IP fallback
};

export const SERVER_URL = 'https://healthconnect-ai-eqcg.onrender.com';
export const API_BASE_URL = `${SERVER_URL}/api`;

export default {
  SERVER_URL,
  API_BASE_URL,
};
