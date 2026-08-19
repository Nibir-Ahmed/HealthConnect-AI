import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Platform, TextInput, Modal, useWindowDimensions } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../../components/Avatar';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import colors from '../../utils/colors';
import { db } from '../../services/firebase';
import { doc, updateDoc } from 'firebase/firestore';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const MedicalCardScreen = ({ navigation }) => {
  const { user, updateUser } = useAuth();
  const { height: windowHeight } = useWindowDimensions();

  // Saved values from user profile (NO fake demo data)
  const savedBloodType = user?.bloodType || '';
  const savedAge = user?.age ? String(user.age) : '';
  const savedAllergies = user?.allergies ? (Array.isArray(user.allergies) ? user.allergies.join(', ') : user.allergies) : '';
  const savedContactName = user?.emergencyContact?.name || '';
  const savedContactPhone = user?.emergencyContact?.phone || user?.phone || '';
  const savedContactRelation = user?.emergencyContact?.relation || '';

  // Edit Modal Draft Form State (isolated from saved state)
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [formBloodType, setFormBloodType] = useState('');
  const [formAge, setFormAge] = useState('');
  const [formAllergies, setFormAllergies] = useState('');
  const [formContactName, setFormContactName] = useState('');
  const [formContactPhone, setFormContactPhone] = useState('');
  const [formContactRelation, setFormContactRelation] = useState('');
  const [saving, setSaving] = useState(false);

  // Open modal and load current saved data into draft form
  const handleOpenEditModal = () => {
    setFormBloodType(savedBloodType);
    setFormAge(savedAge);
    setFormAllergies(savedAllergies);
    setFormContactName(savedContactName);
    setFormContactPhone(savedContactPhone);
    setFormContactRelation(savedContactRelation);
    setEditModalVisible(true);
  };

  // Close modal without saving (discards draft changes)
  const handleCloseModal = () => {
    setEditModalVisible(false);
  };

  const handleSaveVitals = async () => {
    try {
      setSaving(true);
      const allergyArr = formAllergies.split(',').map(s => s.trim()).filter(Boolean);
      const updatePayload = {
        bloodType: formBloodType,
        age: formAge.trim(),
        allergies: allergyArr,
        emergencyContact: {
          name: formContactName.trim(),
          phone: formContactPhone.trim(),
          relation: formContactRelation.trim()
        }
      };

      if (updateUser) {
        await updateUser(updatePayload);
      } else if (user?.uid || user?.id) {
        await updateDoc(doc(db, 'users', user.uid || user.id), updatePayload);
      }

      setEditModalVisible(false);
      if (Platform.OS === 'web') window.alert('Medical ID updated successfully!');
      else Alert.alert('Success', 'Medical ID updated successfully!');
    } catch (e) {
      console.error('Error saving medical ID:', e);
      if (Platform.OS === 'web') window.alert('Failed to update Medical ID: ' + e.message);
      else Alert.alert('Error', 'Failed to update Medical ID: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  const generateHtml = () => `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 40px; background-color: #f5f7fa; color: #102a43; margin: 0; }
          .card { background: linear-gradient(135deg, #0B3B60 0%, #1A5F7A 100%); border-radius: 18px; padding: 32px; color: white; max-width: 550px; margin: 0 auto; box-shadow: 0 15px 30px rgba(0,0,0,0.25); border: 2px solid rgba(255,255,255,0.15); }
          .header { border-bottom: 1px solid rgba(255,255,255,0.25); padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; }
          .brand { font-size: 24px; font-weight: 900; margin: 0; letter-spacing: -0.5px; }
          .label { font-size: 11px; font-weight: 800; letter-spacing: 1.5px; color: #ff6b6b; background: rgba(255,107,107,0.2); padding: 4px 10px; border-radius: 6px; }
          .title { font-size: 28px; font-weight: 800; margin: 0 0 4px 0; }
          .subtitle { font-size: 13px; color: rgba(255,255,255,0.7); margin-bottom: 24px; }
          .grid { display: flex; gap: 40px; margin-bottom: 24px; background: rgba(255,255,255,0.08); padding: 16px 20px; border-radius: 12px; }
          .item-label { font-size: 10px; font-weight: 800; color: rgba(255,255,255,0.6); letter-spacing: 1px; margin-bottom: 4px; }
          .item-value { font-size: 22px; font-weight: 900; margin: 0; color: #ff6b6b; }
          .footer { border-top: 1px solid rgba(255,255,255,0.2); padding-top: 18px; display: flex; flex-direction: column; gap: 14px; }
          .footer-section { background: rgba(0,0,0,0.2); padding: 12px 16px; border-radius: 10px; }
          .footer-value { font-size: 14px; font-weight: 600; margin-top: 2px; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <h2 class="brand">HealthConnect</h2>
            <span class="label">EMERGENCY MEDICAL ID</span>
          </div>
          <h1 class="title">${user?.name || 'Patient'}</h1>
          <div class="subtitle">Card ID: HC-9824-${String(user?.uid || '716').slice(0, 4).toUpperCase()}</div>
          
          <div class="grid">
            <div>
              <div class="item-label">BLOOD GROUP</div>
              <p class="item-value">${savedBloodType || 'Not set'}</p>
            </div>
            <div>
              <div class="item-label">AGE</div>
              <p class="item-value" style="color: #fff;">${savedAge ? `${savedAge} yrs` : 'Not set'}</p>
            </div>
            <div>
              <div class="item-label">STATUS</div>
              <p class="item-value" style="color: #4ade80; font-size: 16px;">ACTIVE</p>
            </div>
          </div>
          
          <div class="footer">
            <div class="footer-section">
              <div class="item-label">CRITICAL ALLERGIES & ALERTS</div>
              <div class="footer-value" style="color: #ffc9c9;">${savedAllergies || 'None reported'}</div>
            </div>
            <div class="footer-section">
              <div class="item-label">PRIMARY EMERGENCY CONTACT</div>
              <div class="footer-value">${savedContactName ? `${savedContactName} ${savedContactRelation ? `(${savedContactRelation})` : ''} • ${savedContactPhone}` : 'Not configured'}</div>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  const handleDownload = async () => {
    try {
      if (Platform.OS === 'web') {
        await Print.printAsync({ html: generateHtml() });
        return;
      }
      const file = await Print.printToFileAsync({ html: generateHtml() });
      if (file && file.uri) {
        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
          await Sharing.shareAsync(file.uri, {
            UTI: '.pdf',
            mimeType: 'application/pdf',
            dialogTitle: 'Download Emergency Medical ID PDF'
          });
        } else {
          Alert.alert('Success', 'PDF generated successfully.');
        }
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Could not generate PDF.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Digital Medical ID</Text>
        <TouchableOpacity style={styles.editHeaderBtn} onPress={handleOpenEditModal}>
          <Ionicons name="create-outline" size={22} color={colors.primary} />
        </TouchableOpacity>
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
              <View style={styles.sosBadge}>
                <Text style={styles.sosText}>EMERGENCY MEDICAL ID</Text>
              </View>
            </View>

            <View style={styles.cardBody}>
              <Avatar uri={user?.avatar} name={user?.name || 'Patient'} size={65} />
              <View style={styles.cardBodyRight}>
                <Text style={styles.cardName}>{user?.name || 'Patient'}</Text>
                <Text style={styles.cardId}>ID: HC-9824-{String(user?.uid || '716').slice(0, 4).toUpperCase()}</Text>
                
                <View style={styles.vitalGrid}>
                  <View style={styles.vitalItem}>
                    <Text style={styles.vitalLabel}>BLOOD GROUP</Text>
                    <Text style={[styles.vitalValue, { color: savedBloodType ? '#ff6b6b' : 'rgba(255,255,255,0.4)' }]}>
                      {savedBloodType || '--'}
                    </Text>
                  </View>
                  <View style={styles.vitalItem}>
                    <Text style={styles.vitalLabel}>AGE</Text>
                    <Text style={[styles.vitalValue, { color: savedAge ? colors.white : 'rgba(255,255,255,0.4)' }]}>
                      {savedAge ? `${savedAge} yrs` : '--'}
                    </Text>
                  </View>
                  <View style={styles.vitalItem}>
                    <Text style={styles.vitalLabel}>STATUS</Text>
                    <Text style={[styles.vitalValue, { color: '#4ade80', fontSize: 13 }]}>ACTIVE</Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.cardFooter}>
              <View style={styles.alertBox}>
                <View style={styles.alertHeader}>
                  <Ionicons name="warning" size={14} color="#ff6b6b" />
                  <Text style={styles.alertTitle}>CRITICAL ALLERGIES & ALERTS</Text>
                </View>
                <Text style={styles.alertContent}>
                  {savedAllergies || 'No known drug allergies reported (Tap Edit to add)'}
                </Text>
              </View>

              <View style={[styles.alertBox, { marginTop: 10 }]}>
                <View style={styles.alertHeader}>
                  <Ionicons name="call" size={14} color="#4ade80" />
                  <Text style={[styles.alertTitle, { color: '#4ade80' }]}>PRIMARY EMERGENCY CONTACT</Text>
                </View>
                <Text style={styles.alertContent}>
                  {savedContactName
                    ? `${savedContactName} ${savedContactRelation ? `(${savedContactRelation})` : ''} • ${savedContactPhone}`
                    : 'No emergency contact set (Tap Edit to add)'}
                </Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.actionBtn} onPress={handleOpenEditModal}>
              <Ionicons name="pencil" size={18} color={colors.primary} />
              <Text style={styles.actionBtnText}>Edit Details</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionBtn, styles.downloadBtn]} onPress={handleDownload}>
              <Ionicons name="print" size={18} color={colors.white} />
              <Text style={[styles.actionBtnText, { color: colors.white }]}>Print ID PDF</Text>
            </TouchableOpacity>
          </View>

          {/* Clinical Advice Note */}
          <Card style={styles.noteCard}>
            <View style={styles.noteHeader}>
              <Ionicons name="shield-checkmark" size={20} color={colors.primary} />
              <Text style={styles.noteTitle}>Paramedic & First Responder Protocol</Text>
            </View>
            <Text style={styles.noteText}>
              In an emergency, show this Digital ID or tap "Print ID PDF" to generate a physical wallet card. Verified medical first responders use this card to identify blood type and avoid allergic drug administration.
            </Text>
          </Card>
        </ScrollView>
      </View>

      {/* Edit Medical ID Modal */}
      <Modal visible={editModalVisible} animationType="slide" transparent={true} onRequestClose={handleCloseModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Medical ID Vitals</Text>
              <TouchableOpacity onPress={handleCloseModal}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>Blood Group</Text>
              <View style={styles.bloodGrid}>
                {BLOOD_GROUPS.map((bg) => (
                  <TouchableOpacity
                    key={bg}
                    style={[styles.bloodChip, formBloodType === bg && styles.bloodChipActive]}
                    onPress={() => setFormBloodType(formBloodType === bg ? '' : bg)}
                  >
                    <Text style={[styles.bloodText, formBloodType === bg && styles.bloodTextActive]}>{bg}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Input label="Age" placeholder="e.g. 26" value={formAge} onChangeText={setFormAge} keyboardType="numeric" icon="calendar-outline" />
              <Input label="Known Allergies" placeholder="e.g. Dust, Penicillin (comma separated)" value={formAllergies} onChangeText={setFormAllergies} icon="alert-circle-outline" />
              <Input label="Emergency Contact Name" placeholder="e.g. Relative / Friend Name" value={formContactName} onChangeText={setFormContactName} icon="person-outline" />
              <Input label="Relationship" placeholder="e.g. Spouse / Parent / Sibling" value={formContactRelation} onChangeText={setFormContactRelation} icon="people-outline" />
              <Input label="Emergency Phone" placeholder="e.g. +880 1711-XXXXXX" value={formContactPhone} onChangeText={setFormContactPhone} keyboardType="phone-pad" icon="call-outline" />

              <Button title="Save Medical ID" onPress={handleSaveVitals} loading={saving} style={{ marginTop: 16 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
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
    padding: 4
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary
  },
  editHeaderBtn: {
    padding: 6
  },
  content: {
    padding: 20,
    paddingBottom: 40
  },
  medicalCard: {
    backgroundColor: '#0B3B60',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    boxShadow: '0px 10px 25px rgba(11, 59, 96, 0.35)',
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)'
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.15)',
    paddingBottom: 12,
    marginBottom: 16
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  pulseIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ff6b6b',
    alignItems: 'center',
    justifyContent: 'center'
  },
  cardBrandName: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.white
  },
  sosBadge: {
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  sosText: {
    color: '#ff6b6b',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8
  },
  cardBody: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  cardBodyRight: {
    marginLeft: 14,
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
    marginTop: 2
  },
  vitalGrid: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 16
  },
  vitalItem: {
    alignItems: 'flex-start'
  },
  vitalLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: 'rgba(255, 255, 255, 0.6)',
    letterSpacing: 0.8
  },
  vitalValue: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.white,
    marginTop: 2
  },
  cardFooter: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.15)',
    paddingTop: 14
  },
  alertBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    padding: 10,
    borderRadius: 10
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2
  },
  alertTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#ff6b6b',
    letterSpacing: 0.5
  },
  alertContent: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.white
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8
  },
  downloadBtn: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary
  },
  noteCard: {
    padding: 16,
    borderRadius: 14
  },
  noteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8
  },
  noteTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary
  },
  noteText: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 19
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end'
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '85%'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8
  },
  bloodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16
  },
  bloodChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border
  },
  bloodChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  bloodText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary
  },
  bloodTextActive: {
    color: colors.white
  }
});

export default MedicalCardScreen;