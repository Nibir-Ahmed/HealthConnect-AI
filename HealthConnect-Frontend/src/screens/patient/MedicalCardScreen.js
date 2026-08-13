import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Share, Alert, ScrollView, Platform, useWindowDimensions } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../../components/Avatar';
import Card from '../../components/Card';
import colors from '../../utils/colors';
const MedicalCardScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { height: windowHeight } = useWindowDimensions();
  const generateHtml = () => `
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; background-color: #f5f7fa; color: #102a43; }
          .card { background: linear-gradient(135deg, #0B3B60 0%, #1A5F7A 100%); border-radius: 16px; padding: 30px; color: white; max-width: 600px; margin: 0 auto; box-shadow: 0 10px 25px rgba(0,0,0,0.2); }
          .header { border-bottom: 1px solid rgba(255,255,255,0.2); padding-bottom: 15px; margin-bottom: 25px; display: flex; justify-content: space-between; align-items: center; }
          .brand { font-size: 24px; font-weight: bold; margin: 0; }
          .label { font-size: 12px; font-weight: bold; letter-spacing: 1px; color: rgba(255,255,255,0.8); }
          .title { font-size: 32px; font-weight: bold; margin-bottom: 5px; margin-top: 0; }
          .subtitle { font-size: 14px; color: rgba(255,255,255,0.8); margin-bottom: 25px; }
          .grid { display: flex; gap: 40px; margin-bottom: 25px; }
          .item-label { font-size: 11px; font-weight: bold; color: rgba(255,255,255,0.6); margin-bottom: 5px; }
          .item-value { font-size: 20px; font-weight: bold; margin: 0; }
          .footer { border-top: 1px solid rgba(255,255,255,0.2); padding-top: 20px; display: flex; gap: 40px; }
          .footer-value { font-size: 16px; font-weight: bold; margin-top: 5px; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <h2 class="brand">HealthConnect</h2>
            <span class="label">EMERGENCY MEDICAL ID</span>
          </div>
          <h1 class="title">${user.name}</h1>
          <div class="subtitle">ID: HC-9824-716</div>
          
          <div class="grid">
            <div>
              <div class="item-label">BLOOD TYPE</div>
              <p class="item-value">${user.bloodType || 'N/A'}</p>
            </div>
            <div>
              <div class="item-label">AGE</div>
              <p class="item-value">${user.age || 'N/A'}</p>
            </div>
          </div>
          
          <div class="footer">
            <div>
              <div class="item-label">ALLERGIES & ALERTS</div>
              <div class="footer-value">${user.allergies && user.allergies.length > 0 ? user.allergies.join(', ') : 'None specified'}</div>
            </div>
            <div>
              <div class="item-label">EMERGENCY CONTACT</div>
              <div class="footer-value">${user.emergencyContact ? `${user.emergencyContact.name} (${user.emergencyContact.relation})<br/>${user.emergencyContact.phone}` : 'Not provided'}</div>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
  const handleDownload = async () => {
    try {
      if (Platform.OS === 'web') {
        // On web, just open print dialog
        window.print();
        return;
      }
      
      const { uri } = await Print.printToFileAsync({ html: generateHtml() });
      const isAvailable = await Sharing.isAvailableAsync();
      
      if (isAvailable) {
        await Sharing.shareAsync(uri, {
          UTI: '.pdf',
          mimeType: 'application/pdf',
          dialogTitle: 'Download Medical ID PDF'
        });
      } else {
        Alert.alert('Success', 'PDF generated, but sharing is not available on this device.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Could not generate PDF.');
    }
  };
  const handleShare = async () => {
    try {
      const message = `HealthConnect Medical ID Card\nPatient: ${user.name}\nAge: ${user.age || 'N/A'}\nBlood Type: ${user.bloodType || 'N/A'}\nAllergies: ${user.allergies && user.allergies.length > 0 ? user.allergies.join(', ') : 'None'}`;
      
      await Share.share({
        message: message,
        title: 'Emergency Medical ID'
      });
    } catch (error) {
      Alert.alert('Error', 'Could not complete share action.');
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Digital Medical ID</Text>
        <View style={{ width: 40 }} />
      </View>
      <View style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content} showsVerticalScrollIndicator={true}>
        {/* Wallet Medical ID Card */}
        <View style={styles.medicalCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <View style={styles.pulseIconContainer}>
                <Ionicons name="heart" size={20} color={colors.white} />
              </View>
              <Text style={styles.cardBrandName}>HealthConnect</Text>
            </View>
            <Text style={styles.cardLabel}>EMERGENCY MEDICAL ID</Text>
          </View>
          <View style={styles.cardBody}>
            <Avatar uri={user.avatar} size={70} />
            <View style={styles.cardBodyRight}>
              <Text style={styles.cardName}>{user.name}</Text>
              <Text style={styles.cardId}>ID: HC-9824-716</Text>
              <View style={styles.vitalGrid}>
                <View style={styles.vitalItem}>
                  <Text style={styles.vitalLabel}>BLOOD TYPE</Text>
                  <Text style={styles.vitalValue}>{user.bloodType || 'N/A'}</Text>
                </View>
                <View style={styles.vitalItem}>
                  <Text style={styles.vitalLabel}>AGE</Text>
                  <Text style={styles.vitalValue}>{user.age || 'N/A'}</Text>
                </View>
              </View>
            </View>
          </View>
          <View style={styles.cardDivider} />
          <View style={styles.cardFooter}>
            <View style={styles.footerSection}>
              <Text style={styles.footerLabel}>ALLERGIES & ALERTS</Text>
              <Text style={styles.footerValue} numberOfLines={1}>{user.allergies ? user.allergies.join(', ') : 'None specified'}</Text>
            </View>
            <View style={styles.footerSection}>
              <Text style={styles.footerLabel}>EMERGENCY CONTACT</Text>
              <Text style={styles.footerValue} numberOfLines={1}>
                {user.emergencyContact ? `${user.emergencyContact.name} (${user.emergencyContact.relation})` : 'Not provided'}
              </Text>
            </View>
          </View>
        </View>
        {/* Action Buttons */}
        <Text style={styles.actionsTitle}>Card Actions</Text>
        <View style={styles.actionGrid}>
          <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7} onPress={handleShare}>
            <View style={styles.actionIconCircle}>
              <Ionicons name="share-social" size={24} color={colors.primary} />
            </View>
            <Text style={styles.actionLabel}>Share Medical ID</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7} onPress={handleDownload}>
            <View style={styles.actionIconCircle}>
              <Ionicons name="download" size={24} color={colors.primary} />
            </View>
            <Text style={styles.actionLabel}>Download PDF</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7} onPress={() => navigation.navigate('EditProfile')}>
            <View style={styles.actionIconCircle}>
              <Ionicons name="create" size={24} color={colors.primary} />
            </View>
            <Text style={styles.actionLabel}>Edit Details</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.emergencyNotice}>
          <Ionicons name="alert-circle" size={20} color={colors.emergency} />
          <Text style={styles.noticeText}>
            Show this card to paramedics or medical staff in case of an emergency.
          </Text>
        </View>
      </ScrollView>
      </View>
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
    paddingVertical: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  backBtn: {
    padding: 4
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary
  },
  content: {
    flexGrow: 1,
    padding: 20
  },
  medicalCard: {
    width: '100%',
    backgroundColor: colors.primaryDark,
    borderRadius: 16,
    padding: 20,
    boxShadow: '0px 4px 8px rgba(0,0,0,0.1)',
    elevation: 5,
    marginBottom: 32
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  pulseIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10
  },
  cardBrandName: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: 0.5
  },
  cardLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.8)',
    letterSpacing: 0.5
  },
  cardBody: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20
  },
  cardBodyRight: {
    marginLeft: 18,
    flex: 1
  },
  cardName: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.white
  },
  cardId: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 4
  },
  vitalGrid: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 20
  },
  vitalItem: {
    alignItems: 'flex-start'
  },
  vitalLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.6)'
  },
  vitalValue: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.white,
    marginTop: 2
  },
  cardDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    marginBottom: 16
  },
  cardFooter: {
    gap: 12
  },
  footerSection: {
    alignItems: 'flex-start'
  },
  footerLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.6)'
  },
  footerValue: {
    fontSize: 13,
    color: colors.white,
    marginTop: 2,
    fontWeight: '600'
  },
  actionsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 16
  },
  actionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32
  },
  actionBtn: {
    width: '30%',
    backgroundColor: colors.white,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border
  },
  actionIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryFaded,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center'
  },
  emergencyNotice: {
    flexDirection: 'row',
    backgroundColor: colors.emergencyFaded,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center'
  },
  noticeText: {
    fontSize: 13,
    color: colors.emergency,
    marginLeft: 10,
    flex: 1,
    lineHeight: 18,
    fontWeight: '500'
  }
});
export default MedicalCardScreen;