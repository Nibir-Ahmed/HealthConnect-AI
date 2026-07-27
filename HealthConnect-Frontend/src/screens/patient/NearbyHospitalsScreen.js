import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Linking, Alert, useWindowDimensions, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import colors from '../../utils/colors';
const FALLBACK_HOSPITALS = [
  { id: 'fb1', name: 'Square Hospital', distance: 1.2, phone: '+880 2 8144400' },
  { id: 'fb2', name: 'Dhaka Medical College Hospital', distance: 3.4, phone: '+880 2 55165088' },
  { id: 'fb3', name: 'Evercare Hospital Dhaka', distance: 4.1, phone: '10678' },
  { id: 'fb4', name: 'United Hospital Limited', distance: 4.8, phone: '10666' },
  { id: 'fb5', name: 'Labaid Specialized Hospital', distance: 2.5, phone: '10606' },
];
const DEFAULT_DHAKA_COORDS = { latitude: 23.8103, longitude: 90.4125 };
// Haversine formula to calculate distance between two lat/lon points
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  return R * c; // Distance in km
};
const NearbyHospitalsScreen = ({ navigation }) => {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locationStatus, setLocationStatus] = useState('Requesting location...');
  useEffect(() => {
    fetchHospitals();
  }, []);
  const fetchHospitals = async () => {
    setLoading(true);
    let coords = DEFAULT_DHAKA_COORDS;
    
    try {
      setLocationStatus('Requesting location...');
      let { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Falling back to default location (Dhaka).');
      } else {
        setLocationStatus('Getting GPS coordinates...');
        let location = await Location.getCurrentPositionAsync({});
        coords = location.coords;
      }
    } catch (error) {
      console.warn("Location error:", error);
      // fallback to default
    }
    setLocationStatus('Searching for nearby hospitals...');
    try {
      // Overpass API Query: Hospitals within 5km of coords
      const overpassQuery = `
        [out:json];
        node(around:5000, ${coords.latitude}, ${coords.longitude})[amenity=hospital];
        out 15;
      `;
      
      const response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: 'data=' + encodeURIComponent(overpassQuery),
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      const data = await response.json();
      
      if (data.elements && data.elements.length > 0) {
        const parsedHospitals = data.elements.map(el => {
          const dist = calculateDistance(coords.latitude, coords.longitude, el.lat, el.lon);
          return {
            id: el.id.toString(),
            name: el.tags.name || el.tags['name:en'] || 'Unknown Hospital',
            distance: dist,
            phone: el.tags.phone || el.tags['contact:phone'] || null // 999 handled later
          };
        }).filter(h => h.name !== 'Unknown Hospital')
          .sort((a, b) => a.distance - b.distance);
        setHospitals(parsedHospitals.length > 0 ? parsedHospitals : FALLBACK_HOSPITALS);
      } else {
        // Fallback if API returns no results or times out
        setHospitals(FALLBACK_HOSPITALS);
      }
    } catch (error) {
      console.error("Overpass API error:", error);
      setHospitals(FALLBACK_HOSPITALS);
    } finally {
      setLoading(false);
    }
  };
  const handleCall = (phone) => {
    // If no phone is available from API, fallback to National Emergency
    const numberToCall = phone || '999';
    Linking.openURL(`tel:${numberToCall}`);
  };
  const renderHospital = ({ item }) => (
    <View style={styles.hospitalCard}>
      <View style={styles.cardHeader}>
        <View style={styles.hospitalInfo}>
          <Text style={styles.hospitalName} numberOfLines={2}>{item.name}</Text>
          <View style={styles.distanceRow}>
            <Ionicons name="location" size={14} color={colors.textLight} />
            <Text style={styles.distanceText}>{item.distance.toFixed(1)} km away</Text>
          </View>
        </View>
        <View style={styles.iconContainer}>
          <Ionicons name="medical" size={24} color={colors.primary} />
        </View>
      </View>
      
      <View style={styles.cardFooter}>
        <Text style={styles.phoneLabel}>
          Emergency / Ambulance: <Text style={styles.phoneNumber}>{item.phone || '999 (National Emergency)'}</Text>
        </Text>
        <TouchableOpacity style={styles.callButton} onPress={() => handleCall(item.phone)}>
          <Ionicons name="call" size={18} color={colors.white} />
          <Text style={styles.callButtonText}>Call Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nearby Hospitals</Text>
        <View style={{ width: 40 }} />
      </View>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>{locationStatus}</Text>
        </View>
      ) : (
        <FlatList
          data={hospitals}
          keyExtractor={(item) => item.id}
          renderItem={renderHospital}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No hospitals found nearby.</Text>
            </View>
          }
        />
      )}
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
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary
  },
  backBtn: {
    padding: 8,
    marginLeft: -8
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    color: colors.textSecondary
  },
  listContainer: {
    padding: 20,
    paddingBottom: 100
  },
  hospitalCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    boxShadow: '0px 4px 8px rgba(0,0,0,0.1)',
    elevation: 3
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16
  },
  hospitalInfo: {
    flex: 1,
    marginRight: 12
  },
  hospitalName: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 6
  },
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  distanceText: {
    fontSize: 13,
    color: colors.textLight,
    marginLeft: 4
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryFaded,
    justifyContent: 'center',
    alignItems: 'center'
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    paddingTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  phoneLabel: {
    flex: 1,
    fontSize: 12,
    color: colors.textSecondary,
    marginRight: 12
  },
  phoneNumber: {
    fontWeight: '700',
    color: colors.textPrimary
  },
  callButton: {
    flexDirection: 'row',
    backgroundColor: colors.emergency,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center'
  },
  callButtonText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 14,
    marginLeft: 6
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center'
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary
  }
});
export default NearbyHospitalsScreen;