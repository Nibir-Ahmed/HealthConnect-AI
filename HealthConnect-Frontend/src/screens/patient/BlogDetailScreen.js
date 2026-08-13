import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Share, Alert, useWindowDimensions, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Badge from '../../components/Badge';
import colors from '../../utils/colors';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const BlogDetailScreen = ({ route, navigation }) => {
  const { width, height: windowHeight } = useWindowDimensions();
  const { user } = useAuth();
  const isLargeScreen = width > 768;
  const { blog } = route.params;
  const [isLiked, setIsLiked] = useState(blog.isLiked || false);
  const [isSaved, setIsSaved] = useState(blog.isSaved || false);
  const [likesCount, setLikesCount] = useState(blog.likes || 0);

  const handleDelete = () => {
    const confirmMsg = 'Are you sure you want to delete this health article?';
    if (Platform.OS === 'web') {
      if (window.confirm(confirmMsg)) executeDelete();
    } else {
      Alert.alert('Delete Article', confirmMsg, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: executeDelete }
      ]);
    }
  };

  const executeDelete = async () => {
    try {
      await api.delete(`/blogs/${blog.id}`);
      if (Platform.OS === 'web') window.alert('Article deleted successfully.');
      else Alert.alert('Success', 'Article deleted successfully.');
      navigation.goBack();
    } catch (error) {
      console.error('Error deleting blog:', error);
      if (Platform.OS === 'web') window.alert('Failed to delete article.');
      else Alert.alert('Error', 'Failed to delete article.');
    }
  };

  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return { uri: url };
    const baseUrl = api.defaults.baseURL.replace('/api', '');
    return { uri: `${baseUrl}${url}` };
  };
  const renderContent = (text) => {
    if (!text) return null;
    return text.split(/(\*\*.*?\*\*)/g).map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <Text key={i} style={{ fontWeight: 'bold' }}>{part.slice(2, -2)}</Text>;
      }
      return part;
    });
  };
  const handleLike = async () => {
    // Optimistic update
    const newIsLiked = !isLiked;
    setIsLiked(newIsLiked);
    setLikesCount(newIsLiked ? likesCount + 1 : likesCount - 1);
    
    try {
      await api.post(`/blogs/${blog.id}/like`);
    } catch (error) {
      // Revert on error
      setIsLiked(!newIsLiked);
      setLikesCount(!newIsLiked ? likesCount + 1 : likesCount - 1);
      console.error('Error toggling like:', error);
    }
  };
  const handleSave = async () => {
    // Optimistic update
    const newIsSaved = !isSaved;
    setIsSaved(newIsSaved);
    try {
      await api.post(`/blogs/${blog.id}/save`);
      Alert.alert(
        newIsSaved ? 'Saved' : 'Removed',
        newIsSaved ? 'Article saved to your collection!' : 'Article removed from Saved collection.'
      );
    } catch (error) {
      // Revert on error
      setIsSaved(!newIsSaved);
      console.error('Error toggling save:', error);
      Alert.alert('Error', 'Failed to update saved status.');
    }
  };
  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this health article on HealthConnect: "${blog.title}" by ${blog.author}`
      });
    } catch (e) {
      alert('Could not complete share action.');
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Article</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          {(user?.role === 'admin' || user?.role === 'doctor') && (
            <TouchableOpacity onPress={handleDelete}>
              <Ionicons name="trash-outline" size={22} color={colors.emergency} />
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
            <Ionicons name="share-social-outline" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>
      <View style={{ flex: 1 }}>
        <ScrollView 
          style={{ flex: 1 }}
          contentContainerStyle={[styles.scrollContainer, isLargeScreen && styles.scrollContainerWeb]} 
          showsVerticalScrollIndicator={false}
        >
          <Image 
            source={getImageUrl(blog.coverImage) || require('../../../assets/images/BloodPressure.png')} 
            style={[styles.coverImage, isLargeScreen && styles.coverImageWeb]} 
          />
          <View style={styles.content}>
            <Badge text={blog.tags && blog.tags.length > 0 ? blog.tags[0] : 'Health'} variant="primary" style={styles.categoryBadge} />
            <Text style={styles.title}>{blog.title}</Text>
            {/* Author info */}
            <View style={styles.authorRow}>
              <View style={styles.authorLeft}>
                <View style={styles.authorAvatarPlaceholder}>
                  <Ionicons name="person" size={18} color={colors.primary} />
                </View>
                <View style={styles.authorText}>
                  <Text style={styles.authorName}>{blog.author?.name || 'Unknown Author'}</Text>
                  <Text style={styles.authorTitle}>Medical Specialist</Text>
                </View>
              </View>
              <Text style={styles.dateText}>{new Date(blog.createdAt).toLocaleDateString()} • {blog.readTime || '5 min'}</Text>
            </View>
            <View style={styles.divider} />
            {/* Body Content */}
            <Text style={styles.bodyText}>{renderContent(blog.content)}</Text>
          </View>
        </ScrollView>
      </View>
      {/* Interactive Footer Controls */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.footerAction} onPress={handleLike}>
          <Ionicons
            name={isLiked ? 'heart' : 'heart-outline'}
            size={24}
            color={isLiked ? colors.emergency : colors.textSecondary}
          />
          <Text style={[styles.actionLabel, isLiked && { color: colors.emergency }]}>
            {likesCount} Likes
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerAction} onPress={handleSave}>
          <Ionicons
            name={isSaved ? 'bookmark' : 'bookmark-outline'}
            size={22}
            color={isSaved ? colors.primary : colors.textSecondary}
          />
          <Text style={[styles.actionLabel, isSaved && { color: colors.primary }]}>
            {isSaved ? 'Saved' : 'Save'}
          </Text>
        </TouchableOpacity>
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
    color: colors.textPrimary,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16
  },
  shareBtn: {
    padding: 4
  },
  scrollContainer: {
    paddingBottom: 40
  },
  coverImage: {
    width: '100%',
    height: 220
  },
  content: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
    padding: 24,
    minHeight: 400,
    boxShadow: '0px 4px 8px rgba(0,0,0,0.1)',
    elevation: 8
  },
  categoryBadge: {
    marginBottom: 14
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
    lineHeight: 30,
    marginBottom: 16
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20
  },
  authorLeft: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  authorAvatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryFaded,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10
  },
  authorText: {
    justifyContent: 'center'
  },
  authorName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary
  },
  authorTitle: {
    fontSize: 11,
    color: colors.textSecondary
  },
  dateText: {
    fontSize: 12,
    color: colors.textLight
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginBottom: 20
  },
  bodyText: {
    fontSize: 15,
    color: colors.textPrimary,
    lineHeight: 24,
    textAlign: 'justify'
  },
  footer: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingVertical: 14,
    justifyContent: 'space-around'
  },
  footerAction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginLeft: 8
  },
  scrollContainerWeb: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 800,
    backgroundColor: colors.white,
    boxShadow: '0px 4px 8px rgba(0,0,0,0.1)',
    elevation: 4
  },
  coverImageWeb: {
    height: 350,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16
  }
});
export default BlogDetailScreen;