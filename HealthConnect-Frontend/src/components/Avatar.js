import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
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

const Avatar = ({ uri, size = 48, online }) => {
  const dotSize = Math.max(12, size * 0.25);
  const borderSize = Math.max(2, dotSize * 0.2);

  let finalSource = DEFAULT_AVATAR;
  if (uri) {
    if (typeof uri === 'number' || typeof uri === 'object') {
      finalSource = uri;
    } else if (typeof uri === 'string') {
      const mapped = getLocalAvatar(uri);
      finalSource = mapped === uri ? { uri } : mapped;
    }
  }

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Image
        source={finalSource}
        style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]}
      />
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
