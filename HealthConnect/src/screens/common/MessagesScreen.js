import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Avatar from '../../components/Avatar';
import colors from '../../utils/colors';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

const MessagesScreen = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const { user } = useAuth();
  const myId = String(user?.uid || user?.id || 'user');

  useEffect(() => {
    if (!myId) return;

    const messagesRef = collection(db, 'messages');
    const q = query(messagesRef, where('participants', 'array-contains', myId));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const convMap = {};

      snapshot.docs.forEach((docSnap) => {
        const msg = docSnap.data();
        const roomId = msg.roomId || docSnap.id;
        const isMe = String(msg.senderId) === myId;
        const partnerId = isMe ? msg.receiverId : msg.senderId;
        const partnerName = isMe ? (msg.receiverName || 'User') : (msg.senderName || 'User');
        const partnerAvatar = isMe ? msg.receiverAvatar : msg.senderAvatar;

        const msgDate = new Date(msg.createdAt || Date.now());

        if (!convMap[roomId] || new Date(convMap[roomId].lastMessage.createdAt) < msgDate) {
          convMap[roomId] = {
            id: roomId,
            partner: {
              id: partnerId,
              name: partnerName,
              avatar: partnerAvatar,
              role: user?.role === 'doctor' ? 'patient' : 'doctor'
            },
            lastMessage: {
              content: msg.text || msg.content || '',
              senderId: msg.senderId,
              createdAt: msg.createdAt || new Date().toISOString()
            },
            unreadCount: (!isMe && !msg.isRead) ? 1 : 0
          };
        }
      });

      const convList = Object.values(convMap).sort((a, b) => 
        new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt)
      );

      setConversations(convList);
      setLoading(false);
    }, (err) => {
      console.error('Error listening to messages inbox:', err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [myId, user?.role]);

  const navigateToChat = (partner) => {
    if (user?.role === 'doctor') {
      navigation.navigate('PatientChat', {
        patient: {
          id: partner.id,
          name: partner.name,
          avatar: partner.avatar
        }
      });
    } else {
      navigation.navigate('DoctorChat', {
        doctor: {
          id: partner.id,
          name: partner.name,
          avatar: partner.avatar,
          specialty: 'Medical Specialist'
        }
      });
    }
  };

  const renderItem = ({ item }) => {
    const { partner, lastMessage, unreadCount } = item;
    const isMe = String(lastMessage.senderId) === myId;

    const date = new Date(lastMessage.createdAt);
    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
      <TouchableOpacity 
        style={styles.chatRow} 
        onPress={() => navigateToChat(partner)}
        activeOpacity={0.7}
      >
        <Avatar uri={partner.avatar} size={50} name={partner.name} />
        <View style={styles.chatInfo}>
          <View style={styles.topLine}>
            <Text style={styles.name} numberOfLines={1}>{partner.name}</Text>
            <Text style={styles.time}>{timeStr}</Text>
          </View>
          <View style={styles.bottomLine}>
            <Text style={[styles.lastMessage, unreadCount > 0 && styles.unreadMessageText]} numberOfLines={1}>
              {isMe ? 'You: ' : ''}{lastMessage.content}
            </Text>
            {unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>{unreadCount}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
      </View>
      
      {conversations.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="chatbubbles-outline" size={64} color={colors.textLight} />
          <Text style={styles.emptyText}>No messages yet</Text>
          <Text style={styles.emptySubText}>
            {user?.role === 'doctor' 
              ? 'Incoming messages and consultations from patients will appear here.'
              : 'Messages from your consultations with doctors will appear here.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 16
  },
  emptySubText: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 19
  },
  listContent: {
    paddingVertical: 8
  },
  chatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  chatInfo: {
    flex: 1,
    marginLeft: 14
  },
  topLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    flex: 1,
    marginRight: 8
  },
  time: {
    fontSize: 12,
    color: colors.textLight
  },
  bottomLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  lastMessage: {
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
    marginRight: 8
  },
  unreadMessageText: {
    fontWeight: '700',
    color: colors.textPrimary
  },
  unreadBadge: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2
  },
  unreadText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '800'
  }
});

export default MessagesScreen;
