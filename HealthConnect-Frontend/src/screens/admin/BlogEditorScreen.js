import React, { useState } from 'react';
import { View, Text, StyleSheet,  ScrollView, Alert, TouchableOpacity, useWindowDimensions, Image, Platform, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import Input from '../../components/Input';
import Button from '../../components/Button';
import colors from '../../utils/colors';
import api from '../../services/api';

const BlogEditorScreen = ({ navigation }) => {
  const { height: windowHeight } = useWindowDimensions();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [body, setBody] = useState('');
  const [readTime, setReadTime] = useState('');
  const [image, setImage] = useState(null);

  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'image/*',
        copyToCacheDirectory: true
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImage(result.assets[0]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
    }
  };

  const publishToApi = async () => {
    try {
      setLoading(true);
      
      if (image) {
        const tags = JSON.stringify([category, readTime]);
        const formData = new FormData();
        formData.append('title', title);
        formData.append('content', body);
        formData.append('tags', tags);

        const filename = image.name || 'image.jpg';
        const type = image.mimeType || 'image/jpeg';
        
        let imageAppended = false;
        if (Platform.OS === 'web') {
          if (image.file) {
            formData.append('image', image.file, filename);
            imageAppended = true;
          } else if (image.uri) {
            try {
              const res = await fetch(image.uri);
              const blob = await res.blob();
              formData.append('image', blob, filename);
              imageAppended = true;
            } catch (e) {
              console.log('Blob fetch fallback:', e);
            }
          }
        } else {
          formData.append('image', {
            uri: image.uri,
            name: filename,
            type: type,
          });
          imageAppended = true;
        }

        if (imageAppended) {
          const headers = Platform.OS === 'web' 
            ? {} 
            : { 'Content-Type': 'multipart/form-data' };
          await api.post('/blogs', formData, { headers });
        } else {
          await api.post('/blogs', {
            title,
            content: body,
            tags: [category, readTime],
            coverImage: image.uri && (image.uri.startsWith('data:') || image.uri.startsWith('http')) ? image.uri : null
          });
        }
      } else {
        // Send as JSON if no image is selected
        await api.post('/blogs', {
          title,
          content: body,
          tags: [category, readTime]
        });
      }

      if (Platform.OS === 'web') {
        window.alert('Article published successfully!');
        navigation.goBack();
      } else {
        Alert.alert('Success', 'Article published successfully!', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      }
    } catch (error) {
      console.error('Error creating blog:', error.response?.data || error.message);
      const errMsg = error.response?.data?.message || 'Failed to publish article.';
      if (Platform.OS === 'web') {
        window.alert(errMsg);
      } else {
        Alert.alert('Error', errMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = () => {
    if (!title || !category || !body || !readTime) {
      if (Platform.OS === 'web') {
        window.alert('Please complete all fields to publish this article.');
      } else {
        Alert.alert('Form Error', 'Please complete all fields to publish this article.');
      }
      return;
    }

    if (Platform.OS === 'web') {
      const confirm = window.confirm('Are you sure you want to publish this health article to the public library?');
      if (confirm) {
        publishToApi();
      }
    } else {
      Alert.alert(
        'Publish Article',
        'Are you sure you want to publish this health article to the public library?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Publish',
            onPress: publishToApi
          }
        ]
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Write Health Article</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        enabled={Platform.OS === 'ios'}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled" style={{ flex: 1 }}>
        <View style={styles.formSection}>
          <Text style={styles.inputLabel}>Cover Image</Text>
          <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
            {image ? (
              <Image source={{ uri: image.uri }} style={styles.previewImage} resizeMode="cover" />
            ) : (
              <View style={styles.placeholderContainer}>
                <Ionicons name="image-outline" size={32} color={colors.textLight} />
                <Text style={styles.placeholderText}>Tap to upload cover image</Text>
              </View>
            )}
          </TouchableOpacity>

          <Input
            label="Article Title"
            placeholder="e.g. 10 Tips for Better sleep"
            icon="document-text-outline"
            value={title}
            onChangeText={setTitle}
          />

          <View style={styles.formRow}>
            <Input
              label="Category Tag"
              placeholder="e.g. Nutrition"
              icon="bookmark-outline"
              value={category}
              onChangeText={setCategory}
              style={{ flex: 1 }}
            />
            <View style={{ width: 12 }} />
            <Input
              label="Read Time"
              placeholder="e.g. 5 min read"
              icon="time-outline"
              value={readTime}
              onChangeText={setReadTime}
              style={{ flex: 1 }}
            />
          </View>

          <Input
            label="Article Body Content"
            placeholder="Write content here..."
            icon="reader-outline"
            value={body}
            onChangeText={setBody}
            multiline={true}
            numberOfLines={10}
          />
        </View>

        <Button title="Publish Article" onPress={handlePublish} style={styles.publishBtn} loading={loading} />
        </ScrollView>
      </KeyboardAvoidingView>
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
  scrollContainer: {
    padding: 20,
    paddingBottom: 40
  },
  formSection: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 32
  },
  formRow: {
    flexDirection: 'row',
    width: '100%'
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8
  },
  imagePicker: {
    width: '100%',
    height: 180,
    backgroundColor: colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    overflow: 'hidden',
    marginBottom: 20
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  placeholderText: {
    marginTop: 8,
    color: colors.textLight,
    fontSize: 14
  },
  previewImage: {
    width: '100%',
    height: '100%'
  },
  publishBtn: {
    marginTop: 8
  }
});

export default BlogEditorScreen;
