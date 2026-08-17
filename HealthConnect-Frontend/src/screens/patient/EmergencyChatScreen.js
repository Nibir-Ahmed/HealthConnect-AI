import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Linking, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { processAITriage } from '../../services/aiService';
import { Ionicons } from '@expo/vector-icons';
import Avatar from '../../components/Avatar';
import ChatBubble from '../../components/ChatBubble';
import colors from '../../utils/colors';

const SEVERE_SYMPTOMS = ['chest pain', 'heart attack', 'breathing difficulty', 'bleeding', 'stroke', 'unconscious', 'fracture', 'poisoning', 'severe burn', 'shash nite kosto', 'chest pain'];

const INITIAL_PROMPTS = [
  "Amar 2 din dhore matha batha r jor",
  "Chest pain & shortness of breath",
  "Pet kharap r vomiting, ki korbo?",
  "Kon doctor er kache jabo?"
];

const EmergencyChatScreen = ({ navigation }) => {
  const [messages, setMessages] = useState([
    {
      id: '1',
      text: 'Hello! Ami apnar HealthConnect AI Medical Assistant. Apnar ki ki symptom ba shamosha hochhe detail-e bolun. (You can type in Banglish, English, or Bangla!)',
      isMe: false,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [suggestedPrompts, setSuggestedPrompts] = useState(INITIAL_PROMPTS);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSeverityDetected, setIsSeverityDetected] = useState(false);
  const scrollViewRef = useRef();

  const sendQueryToAI = async (userQuery) => {
    if (!userQuery.trim() || isLoading) return;

    const userMessage = {
      id: Math.random().toString(),
      text: userQuery,
      isMe: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputText('');
    setIsLoading(true);

    // Local severe symptom check
    const isLocalSevere = SEVERE_SYMPTOMS.some((symptom) => userQuery.toLowerCase().includes(symptom));
    if (isLocalSevere) {
      setIsSeverityDetected(true);
    }

    // Format chat history for multi-turn AI context
    const historyPayload = updatedMessages.map(m => ({
      role: m.isMe ? 'user' : 'assistant',
      content: m.text
    }));

    try {
      const response = await processAITriage(userQuery, historyPayload);
      const { reply, severity, suggestedPrompts: newPrompts } = response;

      if (severity === 'critical' || severity === 'high') {
        setIsSeverityDetected(true);
      }

      if (Array.isArray(newPrompts) && newPrompts.length > 0) {
        setSuggestedPrompts(newPrompts);
      }

      const aiMessage = {
        id: Math.random().toString(),
        text: reply || 'Symptom gulo detail-e bolun, ami shahajjo korchhi.',
        isMe: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('AI Chat Error:', error);
      const errorMessage = {
        id: Math.random().toString(),
        text: 'Dukkhto, AI response generate korte shamosha hoyeche. Please try again.',
        isMe: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = () => {
    sendQueryToAI(inputText);
  };

  const handleSelectPrompt = (promptText) => {
    sendQueryToAI(promptText);
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
            <Text style={styles.bannerText}>High Severity Detected! Call Emergency (999)</Text>
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
          <Text style={styles.chatStatus}>Banglish AI Assistant • Online</Text>
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
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      >
        <View style={{ flex: 1 }}>
          <ScrollView
            ref={scrollViewRef}
            style={{ flex: 1 }}
            contentContainerStyle={styles.chatArea}
            keyboardShouldPersistTaps="handled"
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          >
            {messages.map((msg) => (
              <ChatBubble key={msg.id} message={msg} />
            ))}

            {isLoading && (
              <View style={styles.loadingBubble}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.loadingText}>HealthConnect AI typing...</Text>
              </View>
            )}
          </ScrollView>
        </View>

        {/* Suggested Prompts Section */}
        {suggestedPrompts.length > 0 && !isLoading && (
          <View style={styles.promptSection}>
            <Text style={styles.promptHeader}>
              <Ionicons name="sparkles" size={14} color={colors.primary} /> Suggested Prompts:
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.promptScroll}>
              {suggestedPrompts.map((prompt, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.promptChip}
                  onPress={() => handleSelectPrompt(prompt)}
                >
                  <Ionicons name="chatbubble-ellipses-outline" size={14} color={colors.primary} style={{ marginRight: 6 }} />
                  <Text style={styles.promptChipText}>{prompt}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Input Bar */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            placeholder="Type symptoms in Banglish or English..."
            placeholderTextColor={colors.textLight}
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={handleSend}
            editable={!isLoading}
            onKeyPress={(e) => {
              if (Platform.OS === 'web' && e.nativeEvent.key === 'Enter' && !e.nativeEvent.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <TouchableOpacity
            style={[styles.sendButton, isLoading && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={isLoading}
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
    marginTop: 2,
    fontWeight: '600'
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
  loadingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#F0F2F5',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    marginVertical: 4
  },
  loadingText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginLeft: 8,
    fontStyle: 'italic'
  },
  promptSection: {
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingVertical: 8,
    paddingHorizontal: 16
  },
  promptHeader: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 6
  },
  promptScroll: {
    paddingRight: 10
  },
  promptChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryFaded || '#E6F7F5',
    borderWidth: 1,
    borderColor: colors.primary + '40',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8
  },
  promptChipText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '600'
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
  },
  sendButtonDisabled: {
    opacity: 0.5
  }
});

export default EmergencyChatScreen;

