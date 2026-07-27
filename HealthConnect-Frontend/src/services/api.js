import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const api = axios.create({
  baseURL: Platform.OS === 'android' ? 'http://10.0.2.2:5001/api' : 'http://127.0.0.1:5001/api',
});

// Request interceptor for adding the bearer token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
