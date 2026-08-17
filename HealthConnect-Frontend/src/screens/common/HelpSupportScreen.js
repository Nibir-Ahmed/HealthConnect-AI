import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, TextInput, ActivityIndicator, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../utils/colors';
import Card from '../../components/Card';
import Avatar from '../../components/Avatar';
import { db } from '../../services/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';

const FAQS = [
  {
    question: 'How does the HealthConnect AI Assistant work?',
    answer: 'Our AI Assistant is powered by advanced Llama 3.3 70B models to evaluate your symptoms in real-time, assess urgency levels (Emergency, Urgent, Routine), and provide instant verified first-aid guidance.'
  },
  {
    question: 'How do I book an appointment with a doctor?',
    answer: 'Navigate to "Find Doctors" on the Home screen or Doctors tab, browse by specialty, select a doctor to view their profile and fees, choose an available date and time slot, and confirm your booking.'
  },
  {
    question: 'How do I update my Digital Medical Card?',
    answer: 'Go to "Medical Card" from your Home screen or Profile. Tap the "Edit Medical ID" button to update your blood group, allergies, medications, and emergency contact numbers. Tap Save to apply changes.'
  },
  {
    question: 'Are my health records and prescriptions secure?',
    answer: 'Yes. All health vault records, prescriptions, and medical histories are encrypted in Cloud Firestore with strict user access rules, ensuring only you and your authorized consulting doctors can access them.'
  },
  {
    question: 'How do I set up daily medicine reminders?',
    answer: 'Tap "Reminders" from the Main Services menu on your Home screen. Add your medicine name, dosage amount, and reminder times to receive automated timely alerts.'
  }
];

const HelpSupportScreen = ({ navigation }) => {
  const { user } = useAuth();

  // FAQ Accordion State
  const [expandedFaq, setExpandedFaq] = useState(0);

  // Support Message Form State
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const openLink = async (url) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported || Platform.OS === 'web') {
        await Linking.openURL(url);
      } else {
        Alert.alert('Unable to open URL', url);
      }
    } catch (e) {
      console.error('Failed to open link:', e);
    }
  };

  const handleSendSupportMessage = async () => {
    if (!subject.trim() || !message.trim()) {
      const msg = 'Please fill in both the subject and message.';
      if (Platform.OS === 'web') window.alert(msg);
      else Alert.alert('Required', msg);
      return;
    }

    try {
      setSubmitting(true);
      await addDoc(collection(db, 'support_tickets'), {
        userId: user?.id || user?.uid || 'guest',
        userName: user?.name || 'Anonymous User',
        userEmail: user?.email || 'not-provided',
        userRole: user?.role || 'patient',
        subject: subject.trim(),
        message: message.trim(),
        status: 'open',
        createdAt: new Date().toISOString()
      });

      const successMsg = 'Thank you! Your inquiry has been submitted to HealthConnect Support.';
      if (Platform.OS === 'web') window.alert(successMsg);
      else Alert.alert('Submitted', successMsg);

      setSubject('');
      setMessage('');
    } catch (e) {
      console.error('Support ticket submission error:', e);
      const errMsg = 'Failed to submit ticket. Please try again.';
      if (Platform.OS === 'web') window.alert(errMsg);
      else Alert.alert('Error', errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerTitleBox}>
          <Text style={styles.headerTitle}>Help & Support</Text>
          <Text style={styles.headerSubtitle}>24/7 Assistance & Developer Info</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* ================= MEET THE DEVELOPER CARD ================= */}
        <Card style={styles.devCard}>
          <View style={styles.devHeader}>
            <View style={styles.devBadge}>
              <Ionicons name="code-slash" size={14} color="#8B5CF6" />
              <Text style={styles.devBadgeText}>LEAD DEVELOPER & ARCHITECT</Text>
            </View>
          </View>

          <View style={styles.devProfileRow}>
            <View style={styles.devAvatarContainer}>
              <Avatar name="Md Nibir Ahmed" size={64} />
              <View style={styles.onlineBadge}>
                <Ionicons name="checkmark-circle" size={16} color="#10B981" />
              </View>
            </View>
            <View style={styles.devInfo}>
              <Text style={styles.devName}>Md. Nibir Ahmed</Text>
              <Text style={styles.devRole}>Full-Stack & Mobile App Engineer</Text>
              <Text style={styles.devBio}>
                Creator & System Architect of HealthConnect AI Platform.
              </Text>
            </View>
          </View>

          {/* Developer Social / Portfolio Action Links */}
          <View style={styles.socialButtonsRow}>
            <TouchableOpacity 
              style={[styles.socialBtn, { backgroundColor: '#24292E' }]} 
              onPress={() => openLink('https://github.com/Nibir-Ahmed')}
              activeOpacity={0.8}
            >
              <Ionicons name="logo-github" size={18} color="#FFFFFF" />
              <Text style={styles.socialBtnText}>GitHub</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.socialBtn, { backgroundColor: '#0077B5' }]} 
              onPress={() => openLink('https://www.linkedin.com/in/ahmed-nibir/')}
              activeOpacity={0.8}
            >
              <Ionicons name="logo-linkedin" size={18} color="#FFFFFF" />
              <Text style={styles.socialBtnText}>LinkedIn</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.socialBtn, { backgroundColor: '#00A896' }]} 
              onPress={() => openLink('https://md-nibir.netlify.app/')}
              activeOpacity={0.8}
            >
              <Ionicons name="globe-outline" size={18} color="#FFFFFF" />
              <Text style={styles.socialBtnText}>Portfolio</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* ================= QUICK CONTACT CHANNELS ================= */}
        <Text style={styles.sectionHeading}>Contact Support Channels</Text>
        <View style={styles.contactGrid}>
          <TouchableOpacity 
            style={styles.contactCard} 
            onPress={() => openLink('tel:911')}
            activeOpacity={0.8}
          >
            <View style={[styles.contactIconCircle, { backgroundColor: colors.emergencyFaded }]}>
              <Ionicons name="call" size={22} color={colors.emergency} />
            </View>
            <Text style={styles.contactTitle}>Emergency 24/7</Text>
            <Text style={styles.contactValue}>Dial 911 / 999</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.contactCard} 
            onPress={() => openLink('mailto:support@healthconnect.com')}
            activeOpacity={0.8}
          >
            <View style={[styles.contactIconCircle, { backgroundColor: 'rgba(0, 168, 150, 0.12)' }]}>
              <Ionicons name="mail" size={22} color={colors.primary} />
            </View>
            <Text style={styles.contactTitle}>Email Helpdesk</Text>
            <Text style={styles.contactValue}>support@healthconnect.com</Text>
          </TouchableOpacity>
        </View>

        {/* ================= FREQUENTLY ASKED QUESTIONS (FAQ) ================= */}
        <Text style={styles.sectionHeading}>Frequently Asked Questions</Text>
        <View style={styles.faqList}>
          {FAQS.map((faq, index) => {
            const isExpanded = expandedFaq === index;
            return (
              <TouchableOpacity
                key={index}
                style={styles.faqCard}
                onPress={() => setExpandedFaq(isExpanded ? -1 : index)}
                activeOpacity={0.8}
              >
                <View style={styles.faqHeader}>
                  <View style={styles.faqQuestionBox}>
                    <Ionicons name="help-circle" size={18} color={colors.primary} />
                    <Text style={styles.faqQuestionText}>{faq.question}</Text>
                  </View>
                  <Ionicons 
                    name={isExpanded ? 'chevron-up' : 'chevron-down'} 
                    size={20} 
                    color={colors.textLight} 
                  />
                </View>
                {isExpanded && (
                  <View style={styles.faqAnswerBox}>
                    <Text style={styles.faqAnswerText}>{faq.answer}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ================= SUBMIT INQUIRY TICKET ================= */}
        <Text style={styles.sectionHeading}>Send an Inquiry or Feedback</Text>
        <Card style={styles.ticketCard}>
          <Text style={styles.inputLabel}>Subject / Topic</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Appointment Reschedule, Medical Card Issue..."
            placeholderTextColor={colors.textLight}
            value={subject}
            onChangeText={setSubject}
          />

          <Text style={[styles.inputLabel, { marginTop: 14 }]}>Your Message</Text>
          <TextInput
            style={[styles.input, { height: 90, textAlignVertical: 'top' }]}
            placeholder="Describe your issue or feedback in detail..."
            placeholderTextColor={colors.textLight}
            value={message}
            onChangeText={setMessage}
            multiline
          />

          <TouchableOpacity 
            style={styles.submitBtn} 
            onPress={handleSendSupportMessage}
            disabled={submitting}
            activeOpacity={0.85}
          >
            {submitting ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <>
                <Ionicons name="paper-plane" size={18} color={colors.white} />
                <Text style={styles.submitBtnText}>Submit Support Ticket</Text>
              </>
            )}
          </TouchableOpacity>
        </Card>

        {/* Footer info */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>HealthConnect AI • Version 1.0.0</Text>
          <Text style={styles.footerSub}>Designed & Engineered by Md. Nibir Ahmed</Text>
        </View>

      </ScrollView>
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background
  },
  headerTitleBox: {
    alignItems: 'center'
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary
  },
  headerSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 40
  },
  devCard: {
    padding: 18,
    borderRadius: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.25)',
    backgroundColor: '#FFFFFF',
    boxShadow: '0px 4px 16px rgba(139, 92, 246, 0.08)',
    elevation: 3
  },
  devHeader: {
    flexDirection: 'row',
    marginBottom: 12
  },
  devBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.25)',
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 10
  },
  devBadgeText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#7C3AED',
    letterSpacing: 0.6
  },
  devProfileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16
  },
  devAvatarContainer: {
    position: 'relative'
  },
  onlineBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#FFFFFF',
    borderRadius: 10
  },
  devInfo: {
    flex: 1
  },
  devName: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 2
  },
  devRole: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 4
  },
  devBio: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16
  },
  socialButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4
  },
  socialBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    elevation: 1
  },
  socialBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '700'
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12
  },
  contactGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24
  },
  contactCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    elevation: 1
  },
  contactIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8
  },
  contactTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 2
  },
  contactValue: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center'
  },
  faqList: {
    gap: 10,
    marginBottom: 24
  },
  faqCard: {
    backgroundColor: colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    elevation: 1
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10
  },
  faqQuestionBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  faqQuestionText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: colors.textPrimary,
    flex: 1
  },
  faqAnswerBox: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border
  },
  faqAnswerText: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 19
  },
  ticketCard: {
    padding: 18,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 6
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13.5,
    color: colors.textPrimary
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: 13,
    borderRadius: 12,
    marginTop: 18,
    elevation: 2
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.white
  },
  footer: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 10
  },
  footerText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary
  },
  footerSub: {
    fontSize: 11,
    color: colors.textLight,
    marginTop: 2
  }
});

export default HelpSupportScreen;
