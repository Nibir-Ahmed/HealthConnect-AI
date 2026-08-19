import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../utils/colors';

import Markdown from 'react-native-markdown-display';

const ChatBubble = ({ message }) => {
  const { text, isMe, timestamp, attachmentUrl, attachmentType } = message;

  const handleOpenAttachment = () => {
    if (attachmentUrl) {
      Linking.openURL(attachmentUrl).catch(err => console.error("Couldn't open link", err));
    }
  };

  const markdownStyles = {
    body: {
      color: isMe ? colors.textWhite : colors.textPrimary,
      fontSize: 15,
      lineHeight: 21,
    },
    heading1: {
      color: isMe ? colors.textWhite : colors.textPrimary,
    },
    heading2: {
      color: isMe ? colors.textWhite : colors.textPrimary,
    },
    heading3: {
      color: isMe ? colors.textWhite : colors.textPrimary,
    },
    strong: {
      color: isMe ? colors.textWhite : colors.textPrimary,
      fontWeight: 'bold',
    },
  };

  return (
    <View style={[styles.wrapper, isMe ? styles.wrapperRight : styles.wrapperLeft]}>
      <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleOther]}>
        
        {attachmentUrl && (
          <TouchableOpacity 
            style={[styles.attachmentBox, isMe ? styles.attachmentBoxMe : styles.attachmentBoxOther]}
            onPress={handleOpenAttachment}
          >
            {attachmentType === 'image' || attachmentUrl.match(/\.(jpeg|jpg|gif|png)$/) ? (
              <Image source={{ uri: attachmentUrl.startsWith('/') ? `${SERVER_URL}${attachmentUrl}` : attachmentUrl }} style={styles.attachmentImage} resizeMode="cover" />
            ) : (
              <>
                <Ionicons name="document-text" size={32} color={isMe ? colors.white : colors.primary} />
                <Text style={[styles.attachmentText, isMe ? styles.textMe : styles.textOther]} numberOfLines={1}>
                  {text || 'Attached Document'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {!!text && !attachmentUrl && (
          <Markdown style={markdownStyles}>
            {text}
          </Markdown>
        )}
        
      </View>
      <Text style={[styles.timestamp, isMe ? styles.timestampRight : styles.timestampLeft]}>{timestamp}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 4,
    maxWidth: '78%'
  },
  wrapperRight: {
    alignSelf: 'flex-end'
  },
  wrapperLeft: {
    alignSelf: 'flex-start'
  },
  bubble: {
    paddingHorizontal: 14,
    paddingVertical: 10
  },
  bubbleMe: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    borderBottomRightRadius: 4
  },
  bubbleOther: {
    backgroundColor: '#F0F2F5',
    borderRadius: 16,
    borderBottomLeftRadius: 4
  },
  text: {
    fontSize: 15,
    lineHeight: 21
  },
  textMe: {
    color: colors.textWhite
  },
  textOther: {
    color: colors.textPrimary
  },
  timestamp: {
    fontSize: 11,
    color: colors.textLight,
    marginTop: 4
  },
  timestampRight: {
    textAlign: 'right'
  },
  timestampLeft: {
    textAlign: 'left'
  },
  attachmentBox: {
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
    width: 200,
  },
  attachmentBoxMe: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  attachmentBoxOther: {
    backgroundColor: 'rgba(59,130,246,0.1)',
  },
  attachmentImage: {
    width: 200,
    height: 150,
    borderRadius: 8
  },
  attachmentText: {
    fontSize: 13,
    marginTop: 8,
    textAlign: 'center'
  }
});

export default ChatBubble;
