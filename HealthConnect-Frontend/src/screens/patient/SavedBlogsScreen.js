import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BlogCard from '../../components/BlogCard';
import { getSavedBlogs } from '../../services/blogsApi';
import colors from '../../utils/colors';

const SavedBlogsScreen = ({ navigation }) => {
  const [savedBlogs, setSavedBlogs] = useState([]);

  useEffect(() => {
    const fetchSavedBlogs = async () => {
      const data = await getSavedBlogs();
      setSavedBlogs(data);
    };
    fetchSavedBlogs();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Saved Articles</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={savedBlogs}
        keyExtractor={(item) => item.id}
        style={{ flex: 1 }}
        renderItem={({ item }) => (
          <BlogCard
            blog={item}
            onPress={() => navigation.navigate('BlogDetail', { blog: item })}
          />
        )}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="bookmark-outline" size={48} color={colors.textLight} />
            <Text style={styles.emptyText}>No saved articles</Text>
            <Text style={styles.emptySubText}>Bookmark interesting articles in the feed to save them here</Text>
          </View>
        }
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
  listContainer: {
    padding: 20,
    paddingBottom: 40
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60
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

export default SavedBlogsScreen;
