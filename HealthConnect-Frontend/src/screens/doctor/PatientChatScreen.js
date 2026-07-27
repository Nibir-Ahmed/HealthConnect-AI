import React, { useState, useRef, useEffect, useContext } from 'react';
import { View, Text, StyleSheet,  ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Avatar from '../../components/Avatar';
import ChatBubble from '../../components/ChatBubble';
import colors from '../../utils/colors';
import api from '../../services/api';
import { io } from 'socket.io-client';
import { AuthContext } from '../../context/AuthContext';

const PatientChatScreen = ({ route, navigation }) => {
  const { height: windowHeight } = useWindowDimensions();
  const { user } = useContext(AuthContext);
  const appointment = route.params?.appointment;
  
  const patient = appointment?.patient;
  const patientName = patient?.name || 'Patient';
  const patientAvatar = patient?.avatar || require('../../../assets/images/sara.png');
  const partnerId = patient?.id;
  
  const roomId = appointment ? `appt_${appointment.id}` : `chat_${Math.min(user?.id || 0, partnerId || 0)}_${Math.max(user?.id || 0, partnerId || 0)}`;

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const scrollViewRef = useRef();
  const socketRef = useRef(null);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!partnerId) return;
      try {
        const response = await api.get(`/chat/${partnerId}`);
        const formatted = response.data.map(msg => ({
          id: msg.id.toString(),
          senderId: msg.senderId.toString(),
          senderName: msg.senderId === user.id ? `Dr. ${user.name}` : patientName,
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
          senderName: patientName,
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
  }, [partnerId, roomId, user.id, patientName]);

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const textToSend = inputText;
    setInputText('');

    const docMsg = {
      id: Math.random().toString(),
      senderId: user.id.toString(),
      senderName: `Dr. ${user.name}`,
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true
    };
    setMessages((prev) => [...prev, docMsg]);

    try {
      await api.post('/chat/send', {
        receiverId: partnerId,
        content: textToSend,
        appointmentId: appointment?.id
      });

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

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Avatar uri={patientAvatar} size={40} />
        <View style={styles.headerText}>
          <Text style={styles.patientName} numberOfLines={1}>{patientName}</Text>
          <Text style={styles.patientAge}>Active Consultation</Text>
        </View>
        <TouchableOpacity 
          style={[styles.headerActionBtn, { marginRight: 8 }]} 
          onPress={() => navigation.navigate('PatientVault', { patientId: partnerId, patientName: patientName })}
        >
          <Ionicons name="folder-open" size={20} color={colors.primary} />
          <Text style={styles.headerActionBtnText}>Vault</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.headerActionBtn} 
          onPress={() => navigation.navigate('Prescription', { patientName: patientName, patientId: partnerId, appointmentId: appointment?.id })}
        >
          <Ionicons name="document-text" size={20} color={colors.primary} />
          <Text style={styles.headerActionBtnText}>Rx</Text>
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
          {messages.map((msg) => (
            <ChatBubble key={msg.id} message={msg} />
          ))}
        </ScrollView>
      </View>

        {/* Input Bar */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            placeholder="Type clinical advice..."
            placeholderTextColor={colors.textLight}
            value={inputText}
            onChangeText={setInputText}
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
            <Ionicons name="send" size={20} color={colors.white} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
  patientName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary
  },
  patientAge: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2
  },
  headerActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryFaded,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8
  },
  headerActionBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primaryDark,
    marginLeft: 4
  },
  chatArea: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexGrow: 1
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

export default PatientChatScreen;
