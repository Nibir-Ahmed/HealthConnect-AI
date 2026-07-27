import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import colors from '../utils/colors';
const Card = ({ children, style, onPress }) => {
  const Container = onPress ? TouchableOpacity : View;
  return (
    <Container style={[styles.card, style]} onPress={onPress} activeOpacity={onPress ? 0.7 : 1}>
      {children}
    </Container>
  );
};
const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    boxShadow: '0px 4px 8px rgba(0,0,0,0.1)',
    elevation: 4
  }
});
export default Card;