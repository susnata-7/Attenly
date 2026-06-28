import React from 'react';
import { Text, View, StyleSheet, Pressable } from 'react-native';
import { designSystem } from './designSystem';

export const BottomNavigation = ({ 
  activeTab, 
  onTabPress 
}: { 
  activeTab: string; 
  onTabPress: (tab: string) => void; 
}) => {
  const tabs = [
    { id: 'Dashboard', label: 'DASHBOARD', icon: '📊' },
    { id: 'History', label: 'HISTORY', icon: '📝' },
    { id: 'Statistics', label: 'STATISTICS', icon: '📈' },
    { id: 'Settings', label: 'SETTINGS', icon: '⚙️' },
  ];

  return (
    <View style={styles.container}>
      {tabs.map((tab) => (
        <Pressable
          key={tab.id}
          style={[styles.tab, activeTab === tab.id && styles.activeTab]}
          onPress={() => onTabPress(tab.id)}
        >
          <Text style={[styles.tabText, activeTab === tab.id && styles.activeTabText]}>
            {tab.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: designSystem.themes.dark.background,
    borderTopWidth: 1,
    borderTopColor: designSystem.themes.dark.borderMuted,
    paddingVertical: designSystem.spacing.sm,
    paddingHorizontal: designSystem.spacing.md,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: designSystem.spacing.xs,
    paddingHorizontal: designSystem.spacing.sm,
    borderRadius: designSystem.borderRadius.full,
  },
  activeTab: {
    backgroundColor: designSystem.themes.dark.primaryContainer,
  },
  tabText: {
    fontSize: designSystem.typography.bodyMd.fontSize,
    fontWeight: designSystem.typography.bodyMd.fontWeight,
    color: designSystem.themes.dark.secondary,
    letterSpacing: designSystem.typography.bodyMd.letterSpacing,
    textTransform: 'uppercase',
  },
  activeTabText: {
    color: designSystem.themes.dark.onPrimaryContainer,
    fontWeight: '600',
  },
});