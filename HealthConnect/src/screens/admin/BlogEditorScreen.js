import React, { useState } from 'react';
import { View, Text, StyleSheet,  ScrollView, Alert, TouchableOpacity, useWindowDimensions, Image, Platform, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import Input from '../../components/Input';
import Button from '../../components/Button';
import colors from '../../utils/colors';
import { db } from '../../services/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { getBlogCoverSource } from '../../utils/blogAssets';

const BlogEditorScreen = ({ navigation }) => {
  const { height: windowHeight } = useWindowDimensions();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('First Aid');
  const [body, setBody] = useState('');
  const [readTime, setReadTime] = useState('5 min read');
  const [image, setImage] = useState(null);
  const [imageDataUrl, setImageDataUrl] = useState(null);

  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'image/*',
        copyToCacheDirectory: true
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setImage(asset);

        // Convert to persistent base64 data URL so it works across all devices & sessions
        if (Platform.OS === 'web' && asset.file) {
          const reader = new FileReader();
          reader.onload = (e) => {
            setImageDataUrl(e.target.result);
          };
          reader.readAsDataURL(asset.file);
        } else if (asset.uri) {
          setImageDataUrl(asset.uri);
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
    }
  };

  const getPreviewSource = () => {
    if (imageDataUrl) return { uri: imageDataUrl };
    if (image?.uri) return { uri: image.uri };
    if (image?.name) {
      const match = image.name.match(/image_(\d+)/i);
      if (match) return getBlogCoverSource(`image_${match[1]}`);
    }
    return null;
  };

  const publishToApi = async () => {
    try {
      setLoading(true);
      
      let coverImageValue = imageDataUrl || image?.uri || 'image_1';
      if (image && image.name) {
        const match = image.name.match(/image_(\d+)/i);
        if (match) {
          coverImageValue = `image_${match[1]}`;
        }
      }
      
      const newBlogData = {
        title: title.trim(),
        content: body.trim(),
        category: category || 'Health',
        tags: [category || 'Health', readTime || '5 min read'],
        readTime: readTime.includes('min') ? readTime : `${readTime} min read`,
        coverImage: coverImageValue,
        author: {
          id: user?.id || user?.uid || 'doctor_author',
          name: user?.name ? (user.name.startsWith('Dr.') ? user.name : `Dr. ${user.name}`) : 'Dr. Medical Specialist',
          specialty: user?.specialty || 'General Practitioner',
          avatar: user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Doctor')}&background=00A896&color=fff&bold=true`,
          role: user?.role || 'doctor'
        },
        likes: 0,
        saves: 0,
        isSaved: false,
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'blogs'), newBlogData);

      if (Platform.OS === 'web') {
        window.alert('Article published successfully!');
        navigation.goBack();
      } else {
        Alert.alert('Success', 'Article published to HealthConnect successfully!', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      }
    } catch (error) {
      console.error('Error creating blog in Firestore:', error);
      const errMsg = error.message || 'Failed to publish article.';
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
          <TouchableOpacity style={styles.imagePicker} onPress={pickImage} activeOpacity={0.85}>
            {getPreviewSource() ? (
              <View style={styles.previewWrapper}>
                <Image
                  source={getPreviewSource()}
                  style={styles.previewImage}
                  resizeMode="cover"
                />
                <View style={styles.changeOverlay}>
                  <View style={styles.changeBadge}>
                    <Ionicons name="camera-reverse" size={16} color={colors.white} />
                    <Text style={styles.changeText}>Change Image</Text>
                  </View>
                </View>
              </View>
            ) : (
              <View style={styles.placeholderContainer}>
                <Ionicons name="cloud-upload-outline" size={36} color={colors.primary} />
                <Text style={styles.placeholderText}>Tap to choose an image from your device</Text>
                <Text style={styles.placeholderSubtext}>Supports PNG, JPG, JPEG</Text>
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
    height: 190,
    backgroundColor: colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    overflow: 'hidden',
    marginBottom: 20
  },
  previewWrapper: {
    width: '100%',
    height: '100%',
    position: 'relative'
  },
  previewImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12
  },
  changeOverlay: {
    position: 'absolute',
    bottom: 10,
    right: 10
  },
  changeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6
  },
  changeText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '700'
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
  placeholderSubtext: {
    marginTop: 4,
    color: colors.textLight,
    fontSize: 12
  },
  publishBtn: {
    marginTop: 8
  }
});

export default BlogEditorScreen;
