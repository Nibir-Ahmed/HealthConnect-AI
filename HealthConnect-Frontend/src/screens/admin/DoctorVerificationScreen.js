import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Avatar from '../../components/Avatar';
import Card from '../../components/Card';
import colors from '../../utils/colors';
import api from '../../services/api';

const DoctorVerificationScreen = ({ navigation }) => {
  const [pendingList, setPendingList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingDoctors();
  }, []);

  const fetchPendingDoctors = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/doctors/pending');
      setPendingList(response.data);
    } catch (error) {
      console.error('Error fetching pending doctors:', error);
      Alert.alert('Error', 'Could not load pending doctors');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = (id, name) => {
    Alert.alert(
      'Verify Doctor',
      `Do you want to verify and publish "Dr. ${name}" to the HealthConnect doctor list?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve & Verify',
          onPress: async () => {
            try {
              await api.put(`/admin/doctors/${id}/approve`);
              setPendingList((prev) => prev.filter((doc) => doc.id !== id));
              Alert.alert('Approved', `Dr. ${name} is now verified and active.`);
            } catch (error) {
              console.error('Approval failed:', error);
              Alert.alert('Error', 'Failed to approve doctor.');
            }
          }
        }
      ]
    );
  };

  const handleReject = (id, name) => {
    Alert.alert(
      'Reject Doctor',
      `Are you sure you want to reject the application of "Dr. ${name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: () => {
            // In a full implementation, you'd have an API route to delete/reject the doctor
            setPendingList((prev) => prev.filter((doc) => doc.id !== id));
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Verification Queue</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={pendingList}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => (
            <Card style={styles.docCard}>
              <View style={styles.cardHeader}>
                <Avatar uri={item.User?.avatar || require('../../../assets/images/doc_1.jpg')} size={48} />
                <View style={styles.docInfo}>
                  <Text style={styles.docName}>{item.User?.name}</Text>
                  <Text style={styles.docSpecialty}>{item.specialty} • {item.university}</Text>
                  <Text style={styles.licenseLabel}>License: {item.licenseNumber}</Text>
                </View>
              </View>

              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.declineBtn]}
                  onPress={() => handleReject(item.id, item.User?.name)}
                >
                  <Ionicons name="close-circle-outline" size={16} color={colors.emergency} />
                  <Text style={styles.declineText}>Decline</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionBtn, styles.approveBtn]}
                  onPress={() => handleApprove(item.id, item.User?.name)}
                >
                  <Ionicons name="checkmark-circle-outline" size={16} color={colors.white} />
                  <Text style={styles.approveText}>Verify Doctor</Text>
                </TouchableOpacity>
              </View>
            </Card>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="checkmark-done-circle-outline" size={48} color={colors.primary} />
              <Text style={styles.emptyText}>Verification Queue Clear</Text>
              <Text style={styles.emptySubText}>There are no pending doctor approval requests.</Text>
            </View>
          }
        />
      )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  listContainer: {
    padding: 20
  },
  docCard: {
    marginBottom: 16,
    padding: 16
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  docInfo: {
    marginLeft: 14,
    flex: 1
  },
  docName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary
  },
  docSpecialty: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2
  },
  licenseLabel: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '600',
    marginTop: 4
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    gap: 12
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8
  },
  declineBtn: {
    borderWidth: 1,
    borderColor: colors.emergency,
    backgroundColor: 'transparent'
  },
  approveBtn: {
    backgroundColor: colors.primary
  },
  declineText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.emergency,
    marginLeft: 6
  },
  approveText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.white,
    marginLeft: 6
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 12
  },
  emptySubText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: 'center'
  }
});

export default DoctorVerificationScreen;
