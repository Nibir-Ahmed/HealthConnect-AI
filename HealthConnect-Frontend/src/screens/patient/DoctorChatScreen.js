import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet,  ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Avatar from '../../components/Avatar';
import ChatBubble from '../../components/ChatBubble';
import HealthVaultModal from '../../components/HealthVaultModal';
import colors from '../../utils/colors';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../../services/firebase';
import { collection, query, where, onSnapshot, addDoc } from 'firebase/firestore';


const DoctorChatScreen = ({ route, navigation }) => {
  const { height: windowHeight } = useWindowDimensions();
  const { user } = useAuth();
  const appointment = route.params?.appointment;
  const doctor = appointment?.doctor || route.params?.doctor;
  
  const doctorName = doctor?.User?.name || doctor?.name || 'Dr. Unknown';
  const doctorSpecialty = doctor?.specialty || 'Specialist';
  const doctorAvatar = doctor?.User?.avatar || doctor?.avatar || require('../../../assets/images/doc_1.jpg');
  const partnerId = doctor?.User?.id || doctor?.userId || doctor?.id;
  
  const userRoomId = `chat_${Math.min(user?.id || 0, partnerId || 0)}_${Math.max(user?.id || 0, partnerId || 0)}`;
  const apptRoomId = appointment?.id ? `appt_${appointment.id}` : null;

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [vaultModalVisible, setVaultModalVisible] = useState(false);
  const scrollViewRef = useRef();
  const socketRef = useRef(null);

  const updateMessages = (updater) => {
    setMessages((prev) => {
      const updated = typeof updater === 'function' ? updater(prev) : [...prev, updater];
      if (partnerId && user?.id) {
        const cacheKey = `chat_cache_${user.id}_${partnerId}`;
        AsyncStorage.setItem(cacheKey, JSON.stringify(updated)).catch(() => {});
      }
      return updated;
    });
  };

  useEffect(() => {
    const cacheKey = `chat_cache_${user?.id}_${partnerId}`;

    const loadCachedMessages = async () => {
      if (!partnerId || !user?.id) return;
      try {
        const cached = await AsyncStorage.getItem(cacheKey);
        if (cached) {
          setMessages(JSON.parse(cached));
        }
      } catch (e) {}
    };
    loadCachedMessages();

    // Real-time Firestore Chat Listener
    const messagesRef = collection(db, 'messages');
    const q = query(messagesRef, where('roomId', '==', userRoomId));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const formatted = snapshot.docs.map((docSnap) => {
        const msg = docSnap.data();
        const isMe = String(msg.senderId) === String(user?.id);
        return {
          id: docSnap.id,
          senderId: String(msg.senderId),
          senderName: isMe ? user?.name : doctorName,
          text: msg.text || msg.content || '',
          attachmentUrl: msg.attachmentUrl || null,
          attachmentType: msg.attachmentType || null,
          timestamp: msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isMe: isMe
        };
      });
      setMessages(formatted);
    });

    return () => unsubscribe();
  }, [partnerId, userRoomId, user?.id, doctorName]);

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const textToSend = inputText;
    setInputText('');

    try {
      await addDoc(collection(db, 'messages'), {
        roomId: userRoomId,
        senderId: String(user.id || user.uid),
        receiverId: String(partnerId),
        text: textToSend,
        isRead: false,
        createdAt: new Date().toISOString()
      });
    } catch (err) {
      console.error('Error sending message to Firestore:', err);
    }

    // Send to backend
    try {
      await api.post('/chat/send', {
        receiverId: partnerId,
        content: textToSend,
        appointmentId: appointment?.id
      });

      // Emit via socket
      if (socketRef.current) {
        socketRef.current.emit('send_message', {
          senderId: user.id,
          receiverId: partnerId,
          content: textToSend,
          roomId: userRoomId
        });
        if (apptRoomId) {
          socketRef.current.emit('send_message', {
            senderId: user.id,
            receiverId: partnerId,
            content: textToSend,
            roomId: apptRoomId
          });
        }
      }
    } catch (err) {
      console.error('Error sending message to backend:', err);
    }
  };

  const handleSelectRecord = async (record) => {
    setVaultModalVisible(false);
    if (!record) return;

    // Send the record as an attachment
    const textToSend = `Attached Report: ${record.title}`;
    
    const userMsg = {
      id: Math.random().toString(),
      senderId: user.id.toString(),
      senderName: user.name,
      text: textToSend,
      attachmentUrl: record.fileUrl,
      attachmentType: record.fileType,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true
    };
    setMessages((prev) => [...prev, userMsg]);

    try {
      await api.post('/chat/send', {
        receiverId: partnerId,
        content: textToSend,
        attachmentUrl: record.fileUrl,
        attachmentType: record.fileType,
        appointmentId: appointment?.id
      });

      if (socketRef.current) {
        socketRef.current.emit('send_message', {
          senderId: user.id,
          receiverId: partnerId,
          content: textToSend,
          attachmentUrl: record.fileUrl,
          attachmentType: record.fileType,
          roomId: userRoomId
        });
        if (apptRoomId) {
          socketRef.current.emit('send_message', {
            senderId: user.id,
            receiverId: partnerId,
            content: textToSend,
            attachmentUrl: record.fileUrl,
            attachmentType: record.fileType,
            roomId: apptRoomId
          });
        }
      }
    } catch (error) {
      console.error('Error sharing report:', error);
    }
  };

  const handleAttach = () => {
    setVaultModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Avatar uri={doctorAvatar} name={doctorName} size={40} />
        <View style={styles.headerText}>
          <Text style={styles.docName} numberOfLines={1}>{doctorName}</Text>
          <Text style={styles.docSpecialty}>{doctorSpecialty}</Text>
        </View>
        <TouchableOpacity style={styles.callIcon} onPress={() => Alert.alert('Voice Call', 'Calling doctor...')}>
          <Ionicons name="call" size={22} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        enabled={Platform.OS === 'ios'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={{ flex: 1 }}>
        <ScrollView
          ref={scrollViewRef}
          style={{ flex: 1 }}
          contentContainerStyle={styles.chatArea}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {/* Mini info notice */}
          <View style={styles.infoNotice}>
            <Ionicons name="shield-checkmark" size={16} color={colors.primary} />
            <Text style={styles.infoNoticeText}>This clinical chat is encrypted and fully private.</Text>
          </View>

          {messages.map((msg) => (
            <ChatBubble key={msg.id} message={msg} />
          ))}
        </ScrollView>
      </View>

        {/* Input Bar */}
        <View style={styles.inputBar}>
          <TouchableOpacity style={styles.attachBtn} onPress={handleAttach}>
            <Ionicons name="add-circle-outline" size={24} color={colors.primary} />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            placeholder="Type your message here..."
            placeholderTextColor={colors.textLight}
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={handleSend}
            onKeyPress={(e) => {
              if (Platform.OS === 'web' && e.nativeEvent.key === 'Enter' && !e.nativeEvent.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
            <Ionicons name="send" size={20} color={colors.white} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <HealthVaultModal 
        visible={vaultModalVisible} 
        onClose={() => setVaultModalVisible(false)} 
        onSelect={handleSelectRecord} 
      />
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  backBtn: {
    marginRight: 12,
    padding: 4
  },
  headerText: {
    flex: 1,
    marginLeft: 12
  },
  docName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary
  },
  docSpecialty: {
    fontSize: 12,
    color: colors.primary,
    marginTop: 2
  },
  callIcon: {
    padding: 8
  },
  chatArea: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexGrow: 1
  },
  infoNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryFaded,
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
    justifyContent: 'center'
  },
  infoNoticeText: {
    fontSize: 12,
    color: colors.primaryDark,
    marginLeft: 6,
    fontWeight: '500'
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border
  },
  attachBtn: {
    marginRight: 12,
    padding: 4
  },
  input: {
    flex: 1,
    height: 44,
    backgroundColor: colors.background,
    borderRadius: 22,
    paddingHorizontal: 16,
    fontSize: 15,
    color: colors.textPrimary,
    marginRight: 12
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center'
  }
});

export default DoctorChatScreen;
