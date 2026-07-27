import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Badge from './Badge';
import colors from '../utils/colors';
import { toggleSaveBlog } from '../services/blogsApi';
import api from '../services/api';
const BlogCard = ({ blog, onPress, style }) => {
  const { id, coverImage, tags, title, author, readTime, likes } = blog;
  const category = tags && tags.length > 0 ? tags[0] : null;
  const authorName = author?.name || 'Unknown Author';
  
  const [saved, setSaved] = useState(blog.isSaved || false);
  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return { uri: url };
    const baseUrl = api.defaults.baseURL.replace('/api', '');
    return { uri: `${baseUrl}${url}` };
  };
  const toggleSave = async () => {
    // optimistic update
    setSaved(!saved);
    const result = await toggleSaveBlog(id);
    if (result && result.isSaved !== undefined) {
      setSaved(result.isSaved);
    }
  };
  // Sync state with global changes if blog prop updates
  React.useEffect(() => {
    if (blog.isSaved !== undefined) {
      setSaved(blog.isSaved);
    }
  }, [blog.isSaved]);
  return (
    <TouchableOpacity style={[styles.card, style]} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.imageContainer}>
        <Image 
          source={getImageUrl(coverImage) || require('../../assets/images/BloodPressure.png')} 
          style={styles.coverImage} 
          resizeMode="cover" 
        />
        {category && (
          <View style={styles.badgeOverlay}>
            <Badge text={category} variant="primary" />
          </View>
        )}
        <TouchableOpacity style={styles.bookmarkOverlay} onPress={toggleSave} activeOpacity={0.8}>
          <Ionicons 
            name={saved ? 'bookmark' : 'bookmark-outline'} 
            size={16} 
            color={saved ? colors.primary : colors.textPrimary} 
          />
        </TouchableOpacity>
      </View>
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>{title}</Text>
        <View style={styles.metaRow}>
          <View style={styles.metaLeft}>
            <Ionicons name="person-outline" size={14} color={colors.textLight} style={styles.metaIcon} />
            <Text style={styles.metaText} numberOfLines={1}>{authorName}</Text>
            <View style={styles.dot} />
            <Ionicons name="time-outline" size={14} color={colors.textLight} style={styles.metaIcon} />
            <Text style={styles.metaText}>{readTime || '5 min'}</Text>
          </View>
          <View style={styles.likesRow}>
            <Ionicons name="heart" size={14} color={colors.emergency} />
            <Text style={styles.likesText}>{likes || 0}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};
const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    boxShadow: '0px 4px 8px rgba(0,0,0,0.1)',
    elevation: 4,
    marginBottom: 16,
    overflow: 'hidden'
  },
  imageContainer: {
    position: 'relative'
  },
  coverImage: {
    width: '100%',
    height: 140
  },
  badgeOverlay: {
    position: 'absolute',
    top: 10,
    left: 10
  },
  content: {
    padding: 14
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    lineHeight: 21
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10
  },
  metaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10
  },
  metaIcon: {
    flexShrink: 0
  },
  metaText: {
    fontSize: 12,
    color: colors.textLight,
    marginLeft: 4,
    maxWidth: 90
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: colors.textLight,
    marginHorizontal: 8,
    flexShrink: 0
  },
  likesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0
  },
  likesText: {
    fontSize: 12,
    color: colors.textLight,
    marginLeft: 4
  },
  bookmarkOverlay: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 16,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 4px 8px rgba(0,0,0,0.1)',
    elevation: 2
  }
});
export default BlogCard;