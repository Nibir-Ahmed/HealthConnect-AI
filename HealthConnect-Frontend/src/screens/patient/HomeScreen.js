import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet,  ScrollView, TouchableOpacity, Image, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../../components/Avatar';
import Card from '../../components/Card';
import { getBlogs, subscribeBlogs } from '../../services/blogsApi';
import { getBlogCoverSource } from '../../utils/blogAssets';
import colors from '../../utils/colors';

const FEATURES = [
  { label: 'HealthConnect AI', icon: 'chatbubble-ellipses-outline', route: 'EmergencyChat', color: colors.emergencyFaded, iconColor: colors.emergency },
  { label: 'Find Doctors', icon: 'people-outline', route: 'DoctorList', color: 'rgba(59, 130, 246, 0.1)', iconColor: '#3B82F6' },
  { label: 'My Bookings', icon: 'calendar-outline', route: 'MyAppointments', color: 'rgba(16, 185, 129, 0.1)', iconColor: '#10B981' },
  { label: 'Medical Card', icon: 'card-outline', route: 'MedicalCard', color: 'rgba(245, 158, 11, 0.1)', iconColor: '#F59E0B' },
  { label: 'Health Vault', icon: 'folder-open-outline', route: 'HealthRecords', color: 'rgba(139, 92, 246, 0.1)', iconColor: '#8B92F6' },
  { label: 'Reminders', icon: 'alarm-outline', route: 'MedicineReminder', color: 'rgba(236, 72, 153, 0.1)', iconColor: '#EC4899' },
  { label: 'BMI Calculator', icon: 'calculator-outline', route: 'BMICalculator', color: 'rgba(20, 184, 166, 0.1)', iconColor: '#14B8A6' },
  { label: 'Saved Blogs', icon: 'bookmark-outline', route: 'SavedBlogs', color: 'rgba(249, 115, 22, 0.1)', iconColor: '#F97316' },
  { label: 'Near Hospital', icon: 'map-outline', route: 'NearestHospital', color: 'rgba(99, 102, 241, 0.1)', iconColor: '#6366F1' }
];

const HomeScreen = ({ navigation }) => {
  const { height: windowHeight } = useWindowDimensions();
  const { user } = useAuth();
  const [blogs, setBlogs] = useState([]);

  useEffect(() => {
    const unsubscribe = subscribeBlogs((data) => {
      setBlogs(data || []);
    });
    return () => unsubscribe();
  }, []);
  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return { uri: url };
    const baseUrl = api.defaults.baseURL.replace('/api', '');
    return { uri: `${baseUrl}${url}` };
  };
  const handleFeaturePress = (route) => {
    if (route === 'EmergencyChat') {
      navigation.navigate('MainTabs', { screen: 'Emergency' });
    } else {
      navigation.navigate(route);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Hi, {user?.name ? user.name.split(' ')[0] : 'There'}</Text>
          <Text style={styles.subWelcome}>How are you feeling today?</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <Avatar uri={user?.avatar} name={user?.name || 'User'} size={48} />
        </TouchableOpacity>
      </View>
      <View style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
        {/* SOS Card */}
        <TouchableOpacity
          style={styles.sosCard}
          activeOpacity={0.9}
          onPress={() => navigation.navigate('MainTabs', { screen: 'Emergency' })}
        >
          <View style={styles.sosLeft}>
            <View style={styles.sosIconContainer}>
              <Ionicons name="alert-circle" size={32} color={colors.white} />
            </View>
            <View style={styles.sosTextContainer}>
              <Text style={styles.sosTitle}>Emergency SOS</Text>
              <Text style={styles.sosSubtitle}>Get instant AI health assessment</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={24} color={colors.white} />
        </TouchableOpacity>
        {/* Feature Grid */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Main Services</Text>
        </View>
        <View style={styles.grid}>
          {FEATURES.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.gridItem}
              activeOpacity={0.7}
              onPress={() => handleFeaturePress(item.route)}
            >
              <View style={[styles.gridIconCircle, { backgroundColor: item.color }]}>
                <Ionicons name={item.icon} size={26} color={item.iconColor} />
              </View>
              <Text style={styles.gridLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {/* Health Articles */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Daily Health Guides</Text>
          <TouchableOpacity onPress={() => navigation.navigate('MainTabs', { screen: 'Blogs' })}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.carouselContainer}
        >
          {blogs.slice(0, 4).map((blog) => (
            <TouchableOpacity
              key={blog.id}
              style={styles.carouselCard}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('BlogDetail', { blog })}
            >
              <Image 
                source={getBlogCoverSource(blog.coverImage)} 
                style={styles.carouselImage} 
              />
              <View style={styles.carouselInfo}>
                <Text style={styles.carouselCategory}>{blog.tags && blog.tags.length > 0 ? blog.tags[0] : (blog.category || 'Health')}</Text>
                <Text style={styles.carouselBlogTitle} numberOfLines={2}>{blog.title}</Text>
                <Text style={styles.carouselAuthor}>By {blog.author?.name || 'Doctor'}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary
  },
  subWelcome: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40
  },
  sosCard: {
    backgroundColor: colors.emergency,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
    boxShadow: '0px 4px 8px rgba(0,0,0,0.1)',
    elevation: 4
  },
  sosLeft: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  sosIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16
  },
  sosTextContainer: {
    justifyContent: 'center'
  },
  sosTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.white
  },
  sosSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 28,
    marginBottom: 16
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  gridItem: {
    width: '31%',
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    marginBottom: 12,
    boxShadow: '0px 4px 8px rgba(0,0,0,0.1)',
    elevation: 1
  },
  gridIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10
  },
  gridLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center'
  },
  carouselContainer: {
    paddingLeft: 4,
    paddingRight: 20
  },
  carouselCard: {
    width: 220,
    backgroundColor: colors.white,
    borderRadius: 16,
    marginRight: 16,
    overflow: 'hidden',
    boxShadow: '0px 4px 8px rgba(0,0,0,0.1)',
    elevation: 1
  },
  carouselImage: {
    width: '100%',
    height: 110
  },
  carouselInfo: {
    padding: 12
  },
  carouselCategory: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
    textTransform: 'uppercase'
  },
  carouselBlogTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 4,
    height: 36,
    lineHeight: 18
  },
  carouselAuthor: {
    fontSize: 11,
    color: colors.textLight,
    marginTop: 6
  },
  hospitalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginTop: 20,
    boxShadow: '0px 4px 8px rgba(0,0,0,0.1)',
    elevation: 1
  },
  hospitalIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryFaded,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14
  },
  hospitalText: {
    flex: 1
  },
  hospitalTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary
  },
  hospitalSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2
  }
});
export default HomeScreen;