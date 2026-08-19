import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert, 
  Platform 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../utils/colors';
import Card from '../../components/Card';
import { useAuth } from '../../context/AuthContext';
import { 
  subscribeUserNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead, 
  deleteNotification,
  ensureWelcomeNotification
} from '../../services/notificationService';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'appointment', label: 'Appointments' },
  { key: 'medicine', label: 'Medicines' },
  { key: 'prescription', label: 'Prescriptions' },
  { key: 'system', label: 'System' }
];

const NotificationScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    if (!user) return;

    // Seed welcoming notification if empty
    ensureWelcomeNotification(user?.id || user?.uid, user?.name);

    const unsubscribe = subscribeUserNotifications(
      user?.id || user?.uid, 
      user?.role, 
      (data) => {
        setNotifications(data || []);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const handleNotificationPress = async (item) => {
    if (!item.read) {
      await markNotificationAsRead(item.id);
    }

    if (item.route) {
      navigation.navigate(item.route, item.routeParams || {});
    }
  };

  const handleSendTestNotification = async () => {
    await sendNotification({
      userId: user?.id || user?.uid,
      title: 'HealthConnect Alert Test 🔔',
      body: 'Your live notification system is working perfectly! You will receive updates for bookings, chats, and reminders.',
      type: 'system',
      route: 'EmergencyChat'
    });
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsAsRead(notifications);
  };

  const handleDelete = async (id) => {
    await deleteNotification(id);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'appointment':
        return { name: 'calendar', color: '#10B981', bg: 'rgba(16, 185, 129, 0.12)' };
      case 'medicine':
        return { name: 'alarm', color: '#EC4899', bg: 'rgba(236, 72, 153, 0.12)' };
      case 'prescription':
        return { name: 'document-text', color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.12)' };
      case 'chat':
        return { name: 'chatbubbles', color: colors.primary, bg: 'rgba(0, 168, 150, 0.12)' };
      case 'emergency':
        return { name: 'alert-circle', color: colors.emergency, bg: colors.emergencyFaded };
      case 'system':
      default:
        return { name: 'notifications', color: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.12)' };
    }
  };

  const formatTime = (isoString) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return 'Yesterday';
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (activeFilter === 'all') return true;
    return n.type === activeFilter;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerTitleBox}>
          <Text style={styles.headerTitle}>Notifications</Text>
          <Text style={styles.headerSubtitle}>
            {unreadCount > 0 ? `${unreadCount} unread alert${unreadCount > 1 ? 's' : ''}` : 'All caught up'}
          </Text>
        </View>
        {unreadCount > 0 ? (
          <TouchableOpacity style={styles.markReadBtn} onPress={handleMarkAllRead} activeOpacity={0.7}>
            <Ionicons name="checkmark-done" size={20} color={colors.primary} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterScrollBox}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterList}>
          {FILTERS.map((f) => {
            const isSelected = activeFilter === f.key;
            return (
              <TouchableOpacity
                key={f.key}
                style={[styles.filterChip, isSelected && styles.filterChipActive]}
                onPress={() => setActiveFilter(f.key)}
                activeOpacity={0.8}
              >
                <Text style={[styles.filterChipText, isSelected && styles.filterChipTextActive]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Notification List */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          {filteredNotifications.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="notifications-outline" size={44} color={colors.textLight} />
              </View>
              <Text style={styles.emptyTitle}>No Notifications</Text>
              <Text style={styles.emptySubtitle}>
                {activeFilter === 'all' 
                  ? "You have no notifications right now. Important alerts will appear here."
                  : `No ${activeFilter} notifications found.`}
              </Text>
              <TouchableOpacity 
                style={styles.testBtn} 
                onPress={handleSendTestNotification}
                activeOpacity={0.8}
              >
                <Ionicons name="flash-outline" size={16} color={colors.primary} />
                <Text style={styles.testBtnText}>Send Test Alert</Text>
              </TouchableOpacity>
            </View>
          ) : (
            filteredNotifications.map((item) => {
              const iconCfg = getNotificationIcon(item.type);
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.notificationCard, !item.read && styles.unreadCard]}
                  onPress={() => handleNotificationPress(item)}
                  activeOpacity={0.85}
                >
                  <View style={[styles.iconCircle, { backgroundColor: iconCfg.bg }]}>
                    <Ionicons name={iconCfg.name} size={22} color={iconCfg.color} />
                  </View>

                  <View style={styles.textContainer}>
                    <View style={styles.titleRow}>
                      <Text style={[styles.title, !item.read && styles.unreadTitle]} numberOfLines={1}>
                        {item.title}
                      </Text>
                      {!item.read && <View style={styles.unreadDot} />}
                    </View>
                    <Text style={styles.body}>{item.body}</Text>
                    <Text style={styles.timeText}>{formatTime(item.createdAt)}</Text>
                  </View>

                  <TouchableOpacity 
                    style={styles.deleteBtn} 
                    onPress={() => handleDelete(item.id)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons name="close" size={18} color={colors.textLight} />
                  </TouchableOpacity>
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
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
    paddingVertical: 14,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background
  },
  markReadBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 168, 150, 0.1)'
  },
  headerTitleBox: {
    alignItems: 'center'
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary
  },
  headerSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2
  },
  filterScrollBox: {
    backgroundColor: colors.white,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  filterList: {
    paddingHorizontal: 16,
    gap: 8
  },
  filterChip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary
  },
  filterChipTextActive: {
    color: colors.white
  },
  scrollContainer: {
    padding: 16,
    gap: 10
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.04)',
    elevation: 1,
    position: 'relative'
  },
  unreadCard: {
    backgroundColor: '#F0FDFA',
    borderColor: 'rgba(0, 168, 150, 0.35)',
    borderLeftWidth: 4,
    borderLeftColor: colors.primary
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  textContainer: {
    flex: 1,
    paddingRight: 8
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4
  },
  title: {
    fontSize: 14.5,
    fontWeight: '600',
    color: colors.textPrimary,
    flex: 1
  },
  unreadTitle: {
    fontWeight: '800',
    color: '#042F2E'
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary
  },
  body: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: 6
  },
  timeText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textLight
  },
  deleteBtn: {
    padding: 4
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32
  },
  emptyIconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 6
  },
  emptySubtitle: {
    fontSize: 13.5,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20
  },
  testBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginTop: 16,
    elevation: 1
  },
  testBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary
  }
});

export default NotificationScreen;
