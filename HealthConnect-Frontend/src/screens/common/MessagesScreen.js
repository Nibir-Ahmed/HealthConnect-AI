import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Avatar from '../../components/Avatar';
import colors from '../../utils/colors';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const MessagesScreen = () => {
  const [inbox, setInbox] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const { user } = useAuth();

  useFocusEffect(
    React.useCallback(() => {
      fetchInbox();
    }, [])
  );

  const fetchInbox = async () => {
    try {
      const response = await api.get('/chat/inbox');
      setInbox(response.data);
    } catch (error) {
      console.error('Error fetching inbox:', error);
    } finally {
      setLoading(false);
    }
  };

  const navigateToChat = (partner) => {
    if (user.role === 'patient') {
      const doctorData = {
        id: partner.id, 
        User: partner,
        name: partner.name,
      };
      navigation.navigate('DoctorChat', { doctor: doctorData });
    } else {
      const patientData = {
        id: partner.id,
        User: partner,
        name: partner.name,
      };
      navigation.navigate('PatientChat', { patient: patientData });
    }
  };

  const renderItem = ({ item }) => {
    const { partner, lastMessage, unreadCount } = item;
    const isMe = lastMessage.senderId === user.id;

    const date = new Date(lastMessage.createdAt);
    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
      <TouchableOpacity 
        style={styles.chatRow} 
        onPress={() => navigateToChat(partner)}
        activeOpacity={0.7}
      >
        <Avatar uri={partner.avatar} size={50} online={partner.isOnline} />
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
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
      </View>
      
      {inbox.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="chatbubbles-outline" size={64} color={colors.border} />
          <Text style={styles.emptyText}>No messages yet.</Text>
        </View>
      ) : (
        <FlatList
          data={inbox}
          keyExtractor={(item) => item.partner.id.toString()}
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
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
  },
  listContent: {
    paddingBottom: 24,
  },
  chatRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    alignItems: 'center',
  },
  chatInfo: {
    flex: 1,
    marginLeft: 14,
  },
  topLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    flex: 1,
    marginRight: 8,
  },
  time: {
    fontSize: 12,
    color: colors.textLight,
  },
  bottomLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  lastMessage: {
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
    marginRight: 16,
  },
  unreadMessageText: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  unreadBadge: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '700',
  }
});

export default MessagesScreen;
