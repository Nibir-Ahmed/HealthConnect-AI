import React, { useState, useEffect } from 'react';
import { View, Image, StyleSheet, Platform } from 'react-native';
import colors from '../utils/colors';

const getInitialsAvatar = (name) => {
  const cleanName = name && typeof name === 'string' && name.trim().length > 0 ? name.trim() : 'User';
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanName)}&background=00A896&color=fff&bold=true`;
};

const Avatar = ({ uri, name, size = 48, online }) => {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [uri]);

  const dotSize = Math.max(12, size * 0.25);
  const borderSize = Math.max(2, dotSize * 0.2);

  let finalSource = { uri: getInitialsAvatar(name) };

  if (uri && !imgError) {
    if (typeof uri === 'number' || typeof uri === 'object') {
      finalSource = uri;
    } else if (typeof uri === 'string' && uri.trim().length > 0) {
      if (!uri.includes('doc_') && !uri.includes('sara.png')) {
        let remoteUri = uri;
        if (Platform.OS === 'android' && uri.startsWith('http') && !uri.includes('googleusercontent.com') && !uri.match(/\.(jpeg|jpg|gif|png)$/i)) {
          remoteUri = uri + '#.png';
        }
        finalSource = { uri: remoteUri };
      }
    }
  }

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {Platform.OS === 'web' && typeof finalSource === 'object' && finalSource.uri ? (
        <img 
          src={finalSource.uri} 
          style={{ width: size, height: size, borderRadius: size / 2, objectFit: 'cover', backgroundColor: colors.background }}
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
          alt="Avatar"
        />
      ) : (
        <Image
          source={finalSource}
          style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]}
          onError={() => setImgError(true)}
        />
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
  statusDot: {
    position: 'absolute',
    borderColor: colors.white
  }
});

export default Avatar;
