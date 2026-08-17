import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Avatar from '../../components/Avatar';
import ChatBubble from '../../components/ChatBubble';
import colors from '../../utils/colors';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/firebase';
import { collection, query, where, onSnapshot, addDoc } from 'firebase/firestore';
import { sendNotification } from '../../services/notificationService';

const getRoomId = (id1, id2) => {
  const s1 = String(id1 || '');
  const s2 = String(id2 || '');
  return s1 < s2 ? `chat_${s1}_${s2}` : `chat_${s2}_${s1}`;
};

const PatientChatScreen = ({ route, navigation }) => {
  const { height: windowHeight } = useWindowDimensions();
  const { user } = useAuth();
  const appointment = route.params?.appointment;
  
  const patient = appointment?.patient || route.params?.patient;
  const patientName = patient?.name || patient?.User?.name || 'Patient';
  const patientAvatar = patient?.avatar || patient?.User?.avatar;
  const patientId = String(patient?.id || patient?.userId || 'patient_user');
  const myId = String(user?.uid || user?.id || 'doc_cardiology_1');
  
  const roomId = getRoomId(myId, patientId);

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const scrollViewRef = useRef();

  useEffect(() => {
    // Real-time Firestore Chat Listener
    const messagesRef = collection(db, 'messages');
    const q = query(messagesRef, where('roomId', '==', roomId));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const formatted = snapshot.docs.map((docSnap) => {
        const msg = docSnap.data();
        const isMe = String(msg.senderId) === myId;
        return {
          id: docSnap.id,
          senderId: String(msg.senderId),
          senderName: isMe ? (user?.name || 'Dr. Fahim Ahmed') : patientName,
          text: msg.text || msg.content || '',
          attachmentUrl: msg.attachmentUrl || null,
          attachmentType: msg.attachmentType || null,
          createdAt: msg.createdAt || new Date().toISOString(),
          timestamp: msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isMe: isMe
        };
      });

      formatted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      setMessages(formatted);
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    });

    return () => unsubscribe();
  }, [roomId, myId, patientName]);

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const textToSend = inputText.trim();
    setInputText('');

    try {
      await addDoc(collection(db, 'messages'), {
        roomId: roomId,
        participants: [myId, patientId],
        senderId: myId,
        senderName: user?.name || 'Doctor',
        senderAvatar: user?.avatar || '',
        receiverId: patientId,
        receiverName: patientName,
        receiverAvatar: patientAvatar || '',
        text: textToSend,
        isRead: false,
        createdAt: new Date().toISOString()
      });

      // Send notification to patient
      if (patientId) {
        await sendNotification({
          userId: String(patientId),
          userRole: 'patient',
          title: `New Message from ${user?.name || 'Doctor'} 🩺`,
          body: textToSend.length > 60 ? `${textToSend.slice(0, 57)}...` : textToSend,
          type: 'chat',
          route: 'DoctorChat',
          routeParams: { doctor: { id: myId, name: user?.name || 'Doctor', avatar: user?.avatar } }
        });
      }

      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (err) {
      console.error('Error sending doctor message:', err);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        
        <View style={styles.patientInfo}>
          <Avatar uri={patientAvatar} size={42} name={patientName} />
          <View style={styles.headerText}>
            <Text style={styles.patientName} numberOfLines={1}>{patientName}</Text>
            <Text style={styles.statusSub}>Active Patient Consultation</Text>
          </View>
        </View>

        {/* Doctor Quick Action Tools */}
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.actionToolBtn} 
            onPress={() => navigation.navigate('PatientVault', { patientId, patientName })}
          >
            <Ionicons name="folder-open-outline" size={20} color={colors.primary} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionToolBtn, styles.rxBtn]} 
            onPress={() => navigation.navigate('Prescription', { patientId, patientName, appointmentId: appointment?.id })}
          >
            <Ionicons name="receipt-outline" size={20} color={colors.white} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.encryptedBanner}>
        <Ionicons name="shield-checkmark" size={16} color={colors.primary} />
        <Text style={styles.encryptedText}>Direct Doctor-Patient Tele-Consultation</Text>
      </View>

      {/* Messages */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messageList}
          contentContainerStyle={styles.messageContent}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubble-ellipses-outline" size={48} color={colors.textLight} />
              <Text style={styles.emptyText}>Consultation with {patientName}</Text>
              <Text style={styles.emptySubText}>You can message this patient directly anytime. Use the buttons above to review their health vault or issue digital prescriptions.</Text>
            </View>
          ) : (
            messages.map((item) => (
              <ChatBubble
                key={item.id}
                message={item}
                isMe={item.isMe}
                avatar={item.isMe ? user?.avatar : patientAvatar}
              />
            ))
          )}
        </ScrollView>

        {/* Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Type your medical advice..."
            placeholderTextColor={colors.textLight}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={1000}
          />

          <TouchableOpacity 
            style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]} 
            onPress={handleSend}
            disabled={!inputText.trim()}
          >
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
    padding: 6,
    marginRight: 6
  },
  patientInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center'
  },
  headerText: {
    marginLeft: 10,
    flex: 1
  },
  patientName: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary
  },
  statusSub: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
    marginTop: 1
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  actionToolBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(42, 157, 143, 0.1)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  rxBtn: {
    backgroundColor: colors.primary
  },
  encryptedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(42, 157, 143, 0.1)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 8,
    gap: 6
  },
  encryptedText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600'
  },
  messageList: {
    flex: 1
  },
  messageContent: {
    padding: 16,
    paddingBottom: 20
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 80,
    paddingHorizontal: 30
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 12
  },
  emptySubText: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border
  },
  textInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: colors.background,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 15,
    color: colors.textPrimary
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8
  },
  sendBtnDisabled: {
    opacity: 0.5
  }
});

export default PatientChatScreen;
