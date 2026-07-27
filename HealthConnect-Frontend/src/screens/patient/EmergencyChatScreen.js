import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet,  ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, Linking, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';
import { Ionicons } from '@expo/vector-icons';
import Avatar from '../../components/Avatar';
import ChatBubble from '../../components/ChatBubble';
import colors from '../../utils/colors';

const SEVERE_SYMPTOMS = ['chest pain', 'heart attack', 'breathing difficulty', 'bleeding', 'stroke', 'unconscious', 'fracture', 'poisoning', 'severe burn'];

const EmergencyChatScreen = ({ navigation }) => {
  const [messages, setMessages] = useState([
    {
      id: '1',
      text: 'Hello, I am your HealthConnect AI Medical Assistant. How can I help you? Please describe your symptoms.',
      isMe: false,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isSeverityDetected, setIsSeverityDetected] = useState(false);
  const scrollViewRef = useRef();

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userMessage = {
      id: Math.random().toString(),
      text: inputText,
      isMe: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);
    const userText = inputText;
    setInputText('');

    // Check for severe symptoms
    const isSevere = SEVERE_SYMPTOMS.some((symptom) => userText.toLowerCase().includes(symptom));
    if (isSevere) {
      setIsSeverityDetected(true);
    }

    try {
      const response = await api.post('/ai/triage', {
        symptoms: userText
      });

      const aiMessage = {
        id: Math.random().toString(),
        text: response.data.reply,
        isMe: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('AI Chat Error:', error);
      const errorMessage = {
        id: Math.random().toString(),
        text: 'Sorry, I am having trouble connecting to the server. Please try again.',
        isMe: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  const callAmbulance = () => {
    Linking.openURL('tel:999');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* High Severity Banner */}
      {isSeverityDetected && (
        <View style={styles.severityBanner}>
          <View style={styles.bannerLeft}>
            <Ionicons name="warning" size={24} color={colors.white} />
            <Text style={styles.bannerText}>High Severity Detected! Call Emergency</Text>
          </View>
          <TouchableOpacity style={styles.bannerCall} onPress={callAmbulance}>
            <Ionicons name="call" size={20} color={colors.emergency} />
          </TouchableOpacity>
        </View>
      )}

      {/* Chat header */}
      <View style={styles.header}>
        <Avatar uri={require('../../../assets/images/ai_avatar.jpg')} size={40} />
        <View style={styles.headerText}>
          <Text style={styles.chatTitle}>HealthConnect AI</Text>
          <Text style={styles.chatStatus}>System bot • Active</Text>
        </View>
        <TouchableOpacity style={styles.hospitalBtn} onPress={() => navigation.navigate('NearestHospital')}>
          <Ionicons name="medical" size={16} color={colors.primary} />
          <Text style={styles.hospitalBtnText}>Hospitals</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.alertCircle} onPress={() => setIsSeverityDetected(!isSeverityDetected)}>
          <Ionicons name="warning-outline" size={22} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Fix for ScrollView cutting off in KeyboardAvoidingView */}
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
            placeholder="Type symptoms (e.g. chest pain, flu)..."
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
  severityBanner: {
    backgroundColor: colors.emergency,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  bannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  bannerText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.white,
    marginLeft: 8,
    marginRight: 10
  },
  bannerCall: {
    backgroundColor: colors.white,
    borderRadius: 8,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  headerText: {
    flex: 1,
    marginLeft: 12
  },
  chatTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary
  },
  chatStatus: {
    fontSize: 12,
    color: colors.primary,
    marginTop: 2
  },
  hospitalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryFaded,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 8
  },
  hospitalBtnText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 12,
    marginLeft: 4
  },
  alertCircle: {
    padding: 8
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

export default EmergencyChatScreen;
