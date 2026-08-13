import React, { useState, useEffect } from 'react';
import { View, Image, StyleSheet, Platform } from 'react-native';
import colors from '../utils/colors';

const DEFAULT_AVATAR = require('../../assets/images/sara.png');

const getLocalAvatar = (uri) => {
  if (typeof uri === 'string') {
    if (uri.includes('doc_1')) return require('../../assets/images/doc_1.jpg');
    if (uri.includes('doc_2')) return require('../../assets/images/doc_2.jpg');
    if (uri.includes('doc_3')) return require('../../assets/images/doc_3.jpg');
    if (uri.includes('doc_4')) return require('../../assets/images/doc_4.jpg');
    if (uri.includes('doc_5')) return require('../../assets/images/doc_5.jpg');
    if (uri.includes('doc_6')) return require('../../assets/images/doc_6.jpg');
    if (uri.includes('doc_7')) return require('../../assets/images/doc_7.jpg');
    if (uri.includes('doc_8')) return require('../../assets/images/doc_8.jpg');
  }
  return uri;
};

const Avatar = ({ uri, name, size = 48, online }) => {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [uri]);

  const dotSize = Math.max(12, size * 0.25);
  const borderSize = Math.max(2, dotSize * 0.2);

  let finalSource = DEFAULT_AVATAR;
  if (name) {
    finalSource = { uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=00A896&color=fff` };
  }

  if (uri && !imgError) {
    if (typeof uri === 'number' || typeof uri === 'object') {
      finalSource = uri;
    } else if (typeof uri === 'string' && uri.trim().length > 0) {
      const mapped = getLocalAvatar(uri);
      if (mapped !== uri) {
        finalSource = mapped;
      } else {
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
