import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { designSystem } from './designSystem';

export const AppContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <View style={styles.container}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: designSystem.themes.dark.background,
  },
});