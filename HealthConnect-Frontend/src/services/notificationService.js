import { db } from './firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  doc, 
  updateDoc, 
  deleteDoc, 
  writeBatch, 
  getDocs,
  limit 
} from 'firebase/firestore';
import { Platform } from 'react-native';

// Send a new notification to a specific user, role, or global broadcast
export const sendNotification = async ({
  userId,
  userRole,
  title,
  body,
  type = 'general', // 'appointment' | 'medicine' | 'prescription' | 'chat' | 'system' | 'general'
  relatedId = null,
  route = null,
  routeParams = {}
}) => {
  try {
    const notificationData = {
      userId: userId || null,
      userRole: userRole || null,
      title: title || 'Notification',
      body: body || '',
      type,
      relatedId,
      route,
      routeParams,
      read: false,
      createdAt: new Date().toISOString()
    };

    const docRef = await addDoc(collection(db, 'notifications'), notificationData);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error sending notification:', error);
    return { success: false, error: error.message };
  }
};

// Subscribe to real-time notifications for a specific user
export const subscribeUserNotifications = (userId, userRole, callback) => {
  if (!userId) {
    callback([]);
    return () => {};
  }

  try {
    // Listen to user-specific or role/broadcast notifications
    const q = query(
      collection(db, 'notifications'),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifications = [];
      snapshot.forEach((d) => {
        const data = d.data();
        // Match user by ID, or broadcast / role matching
        const isForUser = 
          data.userId === userId || 
          (!data.userId && data.userRole === userRole) || 
          (!data.userId && !data.userRole);

        if (isForUser) {
          notifications.push({ id: d.id, ...data });
        }
      });

      callback(notifications);
    }, (error) => {
      console.warn('Notifications snapshot note:', error.message);
      callback([]);
    });

    return unsubscribe;
  } catch (error) {
    console.error('Failed to subscribe notifications:', error);
    callback([]);
    return () => {};
  }
};

// Mark a single notification as read
export const markNotificationAsRead = async (notificationId) => {
  try {
    await updateDoc(doc(db, 'notifications', notificationId), {
      read: true,
      readAt: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error('Failed to mark notification as read:', error);
    return false;
  }
};

// Mark all notifications as read for a user
export const markAllNotificationsAsRead = async (notifications) => {
  try {
    const unread = notifications.filter(n => !n.read);
    if (unread.length === 0) return true;

    const batch = writeBatch(db);
    unread.forEach((n) => {
      const ref = doc(db, 'notifications', n.id);
      batch.update(ref, { read: true, readAt: new Date().toISOString() });
    });

    await batch.commit();
    return true;
  } catch (error) {
    console.error('Failed to mark all as read:', error);
    return false;
  }
};

// Delete a notification
export const deleteNotification = async (notificationId) => {
  try {
    await deleteDoc(doc(db, 'notifications', notificationId));
    return true;
  } catch (error) {
    console.error('Failed to delete notification:', error);
    return false;
  }
};

// Auto-seed welcoming notification for new users
export const ensureWelcomeNotification = async (userId, userName) => {
  try {
    const q = query(
      collection(db, 'notifications'), 
      where('userId', '==', userId), 
      where('type', '==', 'system'),
      limit(1)
    );
    const snap = await getDocs(q);
    if (snap.empty) {
      await sendNotification({
        userId,
        title: `Welcome to HealthConnect, ${userName ? userName.split(' ')[0] : 'there'}! 👋`,
        body: 'Your intelligent digital healthcare platform is ready. Try AI Triage, find verified doctors, or set medicine reminders anytime.',
        type: 'system',
        route: 'EmergencyChat'
      });
    }
  } catch (e) {
    console.warn('Welcome note check:', e.message);
  }
};
