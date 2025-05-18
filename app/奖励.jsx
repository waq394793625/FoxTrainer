import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function 奖励() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>奖励功能，敬请期待 🛠️</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff8e7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
    color: '#0a493e',
  },
});
