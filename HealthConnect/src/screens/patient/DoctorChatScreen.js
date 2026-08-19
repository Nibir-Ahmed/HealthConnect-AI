import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Keyboard, useWindowDimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Avatar from '../../components/Avatar';
import ChatBubble from '../../components/ChatBubble';
import HealthVaultModal from '../../components/HealthVaultModal';
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

const DoctorChatScreen = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const { user } = useAuth();
  const appointment = route.params?.appointment;
  const doctor = appointment?.doctor || route.params?.doctor;
  
  const doctorName = doctor?.User?.name || doctor?.name || 'Dr. Fahim Ahmed';
  const doctorSpecialty = doctor?.specialty || 'General Practitioner';
  const doctorAvatar = doctor?.User?.avatar || doctor?.avatar;
  const doctorId = String(doctor?.User?.id || doctor?.userId || doctor?.id || 'doc_cardiology_1');
  const myId = String(user?.uid || user?.id || 'patient_user');
  
  const roomId = getRoomId(myId, doctorId);

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [vaultModalVisible, setVaultModalVisible] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const scrollViewRef = useRef();

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
        setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
      }
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardVisible(false)
    );

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

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
          senderName: isMe ? (user?.name || 'You') : doctorName,
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
  }, [roomId, myId, doctorName]);

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const textToSend = inputText.trim();
    setInputText('');

    try {
      await addDoc(collection(db, 'messages'), {
        roomId: roomId,
        participants: [myId, doctorId],
        senderId: myId,
        senderName: user?.name || 'Patient',
        senderAvatar: user?.avatar || '',
        receiverId: doctorId,
        receiverName: doctorName,
        receiverAvatar: doctorAvatar || '',
        text: textToSend,
        isRead: false,
        createdAt: new Date().toISOString()
      });

      // Send live notification to doctor
      if (doctorId) {
        await sendNotification({
          userId: String(doctorId),
          userRole: 'doctor',
          title: `New Message from ${user?.name || 'Patient'} 💬`,
          body: textToSend.length > 60 ? `${textToSend.slice(0, 57)}...` : textToSend,
          type: 'chat',
          route: 'PatientChat',
          routeParams: { patient: { id: myId, name: user?.name || 'Patient', avatar: user?.avatar } }
        });
      }

      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const handleSelectVaultItem = async (item) => {
    setVaultModalVisible(false);
    try {
      await addDoc(collection(db, 'messages'), {
        roomId: roomId,
        participants: [myId, doctorId],
        senderId: myId,
        senderName: user?.name || 'Patient',
        senderAvatar: user?.avatar || '',
        receiverId: doctorId,
        receiverName: doctorName,
        receiverAvatar: doctorAvatar || '',
        text: `Shared Document: ${item.title}`,
        attachmentUrl: item.fileUrl,
        attachmentType: item.type || 'document',
        isRead: false,
        createdAt: new Date().toISOString()
      });
    } catch (err) {
      console.error('Error sharing vault item:', err);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.doctorInfo}
          onPress={() => navigation.navigate('DoctorProfile', { doctor })}
        >
          <Avatar uri={doctorAvatar} size={42} name={doctorName} />
          <View style={styles.headerText}>
            <Text style={styles.doctorName} numberOfLines={1}>{doctorName}</Text>
            <Text style={styles.doctorSpecialty} numberOfLines={1}>{doctorSpecialty}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.callBtn} onPress={() => alert('Starting Secure Tele-Consultation Voice Link...')}>
          <Ionicons name="call" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.encryptedBanner}>
        <Ionicons name="shield-checkmark" size={16} color={colors.primary} />
        <Text style={styles.encryptedText}>This clinical chat is encrypted and fully private.</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
      >
        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messageList}
          contentContainerStyle={styles.messageContent}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubbles-outline" size={48} color={colors.textLight} />
              <Text style={styles.emptyText}>Start Consultation with {doctorName}</Text>
              <Text style={styles.emptySubText}>Send a message, describe your symptoms, or share reports anytime.</Text>
            </View>
          ) : (
            messages.map((item) => (
              <ChatBubble
                key={item.id}
                message={item}
                isMe={item.isMe}
                avatar={item.isMe ? user?.avatar : doctorAvatar}
              />
            ))
          )}
        </ScrollView>

        {/* Input */}
        <View style={[styles.inputContainer, { paddingBottom: keyboardVisible ? 8 : Math.max(insets.bottom, 10) }]}>
          <TouchableOpacity 
            style={styles.attachBtn} 
            onPress={() => setVaultModalVisible(true)}
          >
            <Ionicons name="add-circle-outline" size={26} color={colors.primary} />
          </TouchableOpacity>

          <TextInput
            style={styles.textInput}
            placeholder="Type your message here..."
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

      <HealthVaultModal
        visible={vaultModalVisible}
        onClose={() => setVaultModalVisible(false)}
        onSelect={handleSelectVaultItem}
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
    padding: 6,
    marginRight: 6
  },
  doctorInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center'
  },
  headerText: {
    marginLeft: 10,
    flex: 1
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary
  },
  doctorSpecialty: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
    marginTop: 1
  },
  callBtn: {
    padding: 8
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
  attachBtn: {
    padding: 6,
    marginRight: 4
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

export default DoctorChatScreen;
