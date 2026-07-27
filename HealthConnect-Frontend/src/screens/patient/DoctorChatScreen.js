import React, { useState, useRef, useEffect, useContext } from 'react';
import { View, Text, StyleSheet,  ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Avatar from '../../components/Avatar';
import ChatBubble from '../../components/ChatBubble';
import HealthVaultModal from '../../components/HealthVaultModal';
import colors from '../../utils/colors';
import api from '../../services/api';
import { io } from 'socket.io-client';
import { AuthContext } from '../../context/AuthContext';

const DoctorChatScreen = ({ route, navigation }) => {
  const { height: windowHeight } = useWindowDimensions();
  const { user } = useContext(AuthContext);
  const appointment = route.params?.appointment;
  const doctor = appointment?.doctor || route.params?.doctor;
  
  const doctorName = doctor?.User?.name || doctor?.name || 'Dr. Unknown';
  const doctorSpecialty = doctor?.specialty || 'Specialist';
  const doctorAvatar = doctor?.User?.avatar || doctor?.avatar || require('../../../assets/images/doc_1.jpg');
  const partnerId = doctor?.User?.id || doctor?.userId;
  
  const roomId = appointment ? `appt_${appointment.id}` : `chat_${Math.min(user?.id || 0, partnerId || 0)}_${Math.max(user?.id || 0, partnerId || 0)}`;

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [vaultModalVisible, setVaultModalVisible] = useState(false);
  const scrollViewRef = useRef();
  const socketRef = useRef(null);

  useEffect(() => {
    // 1. Fetch History
    const fetchHistory = async () => {
      if (!partnerId) return;
      try {
        const response = await api.get(`/chat/${partnerId}`);
        const formatted = response.data.map(msg => ({
          id: msg.id.toString(),
          senderId: msg.senderId.toString(),
          senderName: msg.senderId === user.id ? user.name : doctorName,
          text: msg.content,
          attachmentUrl: msg.attachmentUrl,
          attachmentType: msg.attachmentType,
          timestamp: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isMe: msg.senderId === user.id
        }));
        setMessages(formatted);
      } catch (error) {
        console.error('Error fetching chat history:', error);
      }
    };
    fetchHistory();

    // 2. Setup Socket
    const BACKEND_URL = api.defaults.baseURL.replace('/api', '');
    socketRef.current = io(BACKEND_URL);

    socketRef.current.on('connect', () => {
      socketRef.current.emit('join_room', roomId);
    });

    socketRef.current.on('receive_message', (data) => {
      if (data.senderId !== user.id) {
        const newMsg = {
          id: Math.random().toString(),
          senderId: data.senderId.toString(),
          senderName: doctorName,
          text: data.content,
          attachmentUrl: data.attachmentUrl,
          attachmentType: data.attachmentType,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isMe: false
        };
        setMessages((prev) => [...prev, newMsg]);
      }
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [partnerId, roomId, user.id, doctorName]);

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const textToSend = inputText;
    setInputText('');

    // Optimistic UI update
    const userMsg = {
      id: Math.random().toString(),
      senderId: user.id.toString(),
      senderName: user.name,
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true
    };
    setMessages((prev) => [...prev, userMsg]);

    // Send to backend
    try {
      await api.post('/chat/send', {
        receiverId: partnerId,
        content: textToSend,
        appointmentId: appointment?.id
      });

      // Emit via socket
      socketRef.current.emit('send_message', {
        senderId: user.id,
        receiverId: partnerId,
        content: textToSend,
        roomId: roomId
      });
    } catch (error) {
      console.error('Send error:', error);
      Alert.alert('Error', 'Failed to send message.');
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
      attachmentType: record.fileUrl.match(/\.(jpeg|jpg|gif|png)$/) ? 'image' : 'document',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true
    };
    setMessages((prev) => [...prev, userMsg]);

    try {
      await api.post('/chat/send', {
        receiverId: partnerId,
        content: textToSend,
        attachmentUrl: record.fileUrl,
        attachmentType: record.fileUrl.match(/\.(jpeg|jpg|gif|png)$/) ? 'image' : 'document',
        appointmentId: appointment?.id
      });

      socketRef.current.emit('send_message', {
        senderId: user.id,
        receiverId: partnerId,
        content: textToSend,
        attachmentUrl: record.fileUrl,
        attachmentType: record.fileUrl.match(/\.(jpeg|jpg|gif|png)$/) ? 'image' : 'document',
        roomId: roomId
      });
    } catch (error) {
      console.error('Send attachment error:', error);
      Alert.alert('Error', 'Failed to send attachment.');
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
        <Avatar uri={doctorAvatar} size={40} online={true} />
        <View style={styles.headerText}>
          <Text style={styles.docName} numberOfLines={1}>{doctorName}</Text>
          <Text style={styles.docSpecialty}>{doctorSpecialty}</Text>
        </View>
        <TouchableOpacity style={styles.callIcon}>
          <Ionicons name="call-outline" size={22} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
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
