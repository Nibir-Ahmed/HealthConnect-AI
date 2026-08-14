import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, ScrollView, TouchableOpacity, useWindowDimensions, ActivityIndicator, Platform } from 'react-native';;
import { Ionicons } from '@expo/vector-icons';
import { getBlogs, subscribeBlogs } from '../../services/blogsApi';
import BlogCard from '../../components/BlogCard';
import colors from '../../utils/colors';
import { useAuth } from '../../context/AuthContext';

const CATEGORIES = ['All', 'My Articles', 'First Aid', 'Nutrition', 'Mental Health', 'Disease Awareness'];

const BlogFeedScreen = ({ route, navigation }) => {
  const { width, height: windowHeight } = useWindowDimensions();
  const { user } = useAuth();
  const isLargeScreen = width > 768;
  const initialCategory = route.params?.filter === 'my' ? 'My Articles' : 'All';
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (route.params?.filter === 'my') {
      setSelectedCategory('My Articles');
    }
  }, [route.params?.filter]);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeBlogs((data) => {
      const formatted = (data || []).map((blog) => {
        const category = blog.tags && blog.tags.length > 0 ? blog.tags[0] : (blog.category || 'Health');
        return {
          ...blog,
          id: String(blog.id),
          category,
          author: blog.author || { name: 'Health Professional' },
          coverImage: blog.coverImage || 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=500',
          readTime: '5 min read',
          likes: blog.likes || 0,
          isSaved: blog.isSaved || false
        };
      });
      setBlogs(formatted);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);


  const categoriesToDisplay = (user?.role === 'doctor' || user?.role === 'admin')
    ? CATEGORIES
    : CATEGORIES.filter(c => c !== 'My Articles');

  const filteredBlogs = blogs.filter((blog) => {
    const matchesSearch = blog.title?.toLowerCase().includes(search.toLowerCase()) || 
                          (blog.content && blog.content.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || selectedCategory === 'My Articles' || blog.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {navigation.canGoBack() && (
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
          )}
          <Text style={styles.headerTitle}>Health Library</Text>
        </View>
        <TouchableOpacity style={styles.saveHeaderIcon} onPress={() => navigation.navigate('SavedBlogs')}>
          <Ionicons name="bookmark-outline" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color={colors.textLight} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search health topics, articles..."
            placeholderTextColor={colors.textLight}
            value={search}
            onChangeText={setSearch}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
      {/* Category Chips */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipScroll}>
          {categoriesToDisplay.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.chip,
                selectedCategory === cat && styles.activeChip
              ]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text style={[
                styles.chipText,
                selectedCategory === cat && styles.activeChipText
              ]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      {loading ? (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <View style={{ flex: 1 }}>
        <FlatList
          key={isLargeScreen ? 'double' : 'single'}
          data={filteredBlogs}
          numColumns={isLargeScreen ? 2 : 1}
          columnWrapperStyle={isLargeScreen ? styles.columnWrapper : null}
          keyExtractor={(item) => item.id}
          style={{ flex: 1 }}
          renderItem={({ item }) => (
            <BlogCard
              blog={item}
              onPress={() => navigation.navigate('BlogDetail', { blog: item })}
              style={isLargeScreen ? styles.cardResponsive : null}
            />
          )}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="book-outline" size={48} color={colors.textLight} />
              <Text style={styles.emptyText}>No articles found</Text>
              <Text style={styles.emptySubText}>Try searching other keywords or change the filter</Text>
            </View>
          }
        />
        </View>
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
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary
  },
  backBtn: {
    marginRight: 12,
    padding: 4
  },
  saveHeaderIcon: {
    padding: 4
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: colors.white
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
    boxShadow: '0px 4px 8px rgba(0,0,0,0.1)',
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.border
  },
  searchIcon: {
    marginRight: 8
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: colors.textPrimary,
    outlineStyle: 'none'
  },
  filterContainer: {
    backgroundColor: colors.white,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  chipScroll: {
    paddingHorizontal: 20
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.white,
    marginRight: 8,
    boxShadow: '0px 4px 8px rgba(0,0,0,0.1)',
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.border
  },
  activeChip: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary
  },
  activeChipText: {
    color: colors.white
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
  },
  columnWrapper: {
    justifyContent: 'space-between',
    paddingHorizontal: 2
  },
  cardResponsive: {
    flex: 1,
    marginHorizontal: 8,
    maxWidth: '48%'
  }
});
export default BlogFeedScreen;