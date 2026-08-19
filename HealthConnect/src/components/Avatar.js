import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, Platform } from 'react-native';
import colors from '../utils/colors';

export const getInitials = (name) => {
  if (!name || typeof name !== 'string') return 'HC';
  const cleanName = name.trim().replace(/^(Dr\.|Mr\.|Mrs\.|Ms\.|Prof\.)\s+/i, '');
  const parts = cleanName.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'HC';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  // First letter of first name + First letter of last name
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

export const getInitialsAvatar = (name) => {
  const initials = getInitials(name);
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=00A896&color=fff&bold=true&length=2`;
};

const Avatar = ({ uri, name, size = 48, online, style }) => {
  const [imgError, setImgError] = useState(false);
  const initials = getInitials(name);

  useEffect(() => {
    setImgError(false);
  }, [uri]);

  const dotSize = Math.max(12, size * 0.25);
  const borderSize = Math.max(2, dotSize * 0.2);
  const fontSize = Math.max(12, Math.round(size * 0.38));

  const hasCustomPhoto = uri && 
    !imgError && 
    (typeof uri === 'number' || (typeof uri === 'string' && uri.trim().length > 0 && !uri.includes('ui-avatars.com')));

  let finalSource = null;
  if (hasCustomPhoto) {
    if (typeof uri === 'number' || typeof uri === 'object') {
      finalSource = uri;
    } else if (typeof uri === 'string') {
      let remoteUri = uri;
      if (Platform.OS === 'android' && uri.startsWith('http') && !uri.includes('googleusercontent.com') && !uri.match(/\.(jpeg|jpg|gif|png)$/i)) {
        remoteUri = uri + '#.png';
      }
      finalSource = { uri: remoteUri };
    }
  }

  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      {hasCustomPhoto && finalSource ? (
        Platform.OS === 'web' && typeof finalSource === 'object' && finalSource.uri ? (
          <img 
            src={finalSource.uri} 
            style={{ width: size, height: size, borderRadius: size / 2, objectFit: 'cover', backgroundColor: colors.background }}
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            alt={name || "Avatar"}
          />
        ) : (
          <Image
            source={finalSource}
            style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]}
            onError={() => setImgError(true)}
          />
        )
      ) : (
        <View style={[styles.initialsContainer, { width: size, height: size, borderRadius: size / 2 }]}>
          <Text style={[styles.initialsText, { fontSize }]}>{initials}</Text>
        </View>
      )}

      {online !== undefined && (
        <View style={[
          styles.statusDot,
          {
            width: dotSize,
            height: dotSize,
            borderRadius: dotSize / 2,
            borderWidth: borderSize,
            backgroundColor: online ? colors.online : colors.offline,
            bottom: 0,
            right: 0
          }
        ]} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative'
  },
  image: {
    backgroundColor: colors.background
  },
  initialsContainer: {
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)'
  },
  initialsText: {
    color: colors.white,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  statusDot: {
    position: 'absolute',
    borderColor: colors.white
  }
});

export default Avatar;
