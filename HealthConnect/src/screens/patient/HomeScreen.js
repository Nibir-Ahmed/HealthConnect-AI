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
import { db } from '../../services/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { subscribeUserNotifications } from '../../services/notificationService';

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
  const [announcement, setAnnouncement] = useState(null);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    const unsubscribe = subscribeBlogs((data) => {
      setBlogs(data || []);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Listen to real-time notifications for unread badge
    if (!user) return;
    const unsubNotifs = onSnapshot(doc(db, 'system_config', 'global'), () => {});
    const unsubUserNotifs = subscribeUserNotifications(user?.id || user?.uid, user?.role, (data) => {
      const count = (data || []).filter(n => !n.read).length;
      setUnreadNotifications(count);
    });

    return () => {
      unsubNotifs();
      unsubUserNotifs();
    };
  }, [user]);

  useEffect(() => {
    // Listen to live system broadcast announcements from Admin
    const unsubConfig = onSnapshot(doc(db, 'system_config', 'global'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.announcement && data.announcement.active && data.announcement.text) {
          setAnnouncement(data.announcement.text);
        } else {
          setAnnouncement(null);
        }
      }
    }, (err) => console.warn('Config snapshot error:', err.message));

    return () => unsubConfig();
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
        <View style={styles.headerRightActions}>
          <TouchableOpacity 
            style={styles.notificationBellBtn} 
            onPress={() => navigation.navigate('Notifications')}
            activeOpacity={0.7}
          >
            <Ionicons name="notifications-outline" size={22} color={colors.textPrimary} />
            {unreadNotifications > 0 ? (
              <View style={styles.bellBadge}>
                <Text style={styles.bellBadgeText}>
                  {unreadNotifications > 9 ? '9+' : unreadNotifications}
                </Text>
              </View>
            ) : null}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
            <Avatar uri={user?.avatar} name={user?.name || 'User'} size={44} />
          </TouchableOpacity>
        </View>
      </View>
      <View style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
          {/* Live Admin Announcement Broadcast Banner */}
          {announcement ? (
            <View style={styles.broadcastBanner}>
              <View style={styles.broadcastIconBox}>
                <Ionicons name="megaphone" size={18} color="#D97706" />
              </View>
              <View style={styles.broadcastTextBox}>
                <Text style={styles.broadcastTag}>OFFICIAL ANNOUNCEMENT</Text>
                <Text style={styles.broadcastContent}>{announcement}</Text>
              </View>
            </View>
          ) : null}

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
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  notificationBellBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative'
  },
  bellBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: colors.emergency,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: colors.white
  },
  bellBadgeText: {
    color: colors.white,
    fontSize: 9,
    fontWeight: '800'
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
  },
  broadcastBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FCD34D',
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
    gap: 12,
    boxShadow: '0px 2px 6px rgba(245, 158, 11, 0.15)',
    elevation: 2
  },
  broadcastIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FDE68A',
    alignItems: 'center',
    justifyContent: 'center'
  },
  broadcastTextBox: {
    flex: 1
  },
  broadcastTag: {
    fontSize: 10,
    fontWeight: '800',
    color: '#B45309',
    letterSpacing: 0.6,
    marginBottom: 2
  },
  broadcastContent: {
    fontSize: 13,
    fontWeight: '600',
    color: '#78350F',
    lineHeight: 18
  }
});
export default HomeScreen;