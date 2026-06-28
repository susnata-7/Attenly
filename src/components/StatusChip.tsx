import React from 'react';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { designSystem } from '../designSystem';

interface StatusChipProps {
  status: 'present' | 'absent' | 'cancelled' | 'safe' | 'warn' | 'crit';
  size?: 'sm' | 'md' | 'lg';
  children?: React.ReactNode;
}

export const StatusChip = ({ 
  status, 
  size = 'md', 
  children 
}: StatusChipProps) => {
  const getStatusStyle = () => {
    switch (status) {
      case 'present':
        return {
          backgroundColor: designSystem.themes.dark.present.bg,
          borderColor: designSystem.themes.dark.present.border,
          textColor: designSystem.themes.dark.present.text,
        };
      case 'absent':
        return {
          backgroundColor: designSystem.themes.dark.absent.bg,
          borderColor: designSystem.themes.dark.absent.border,
          textColor: designSystem.themes.dark.absent.text,
        };
      case 'cancelled':
        return {
          backgroundColor: designSystem.themes.dark.cancelled.bg,
          borderColor: designSystem.themes.dark.cancelled.border,
          textColor: designSystem.themes.dark.cancelled.text,
        };
      case 'safe':
        return {
          backgroundColor: designSystem.themes.dark.success,
          borderColor: designSystem.themes.dark.success,
          textColor: designSystem.themes.dark.textMain,
        };
      case 'warn':
        return {
          backgroundColor: designSystem.themes.dark.primaryContainer,
          borderColor: designSystem.themes.dark.primaryContainer,
          textColor: designSystem.themes.dark.onPrimaryContainer,
        };
      case 'crit':
        return {
          backgroundColor: designSystem.themes.dark.error,
          borderColor: designSystem.themes.dark.error,
          textColor: designSystem.themes.dark.textMain,
        };
      default:
        return {
          backgroundColor: designSystem.themes.dark.surface,
          borderColor: designSystem.themes.dark.borderMuted,
          textColor: designSystem.themes.dark.textMain,
        };
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'lg':
        return {
          paddingVertical: designSystem.spacing.sm,
          paddingHorizontal: designSystem.spacing.md,
          borderRadius: designSystem.borderRadius.lg,
        };
      case 'sm':
        return {
          paddingVertical: designSystem.spacing.xs,
          paddingHorizontal: designSystem.spacing.sm,
          borderRadius: designSystem.borderRadius.default,
        };
      default:
        return {
          paddingVertical: designSystem.spacing.xs,
          paddingHorizontal: designSystem.spacing.sm,
          borderRadius: designSystem.borderRadius.default,
        };
    }
  };

  return (
    <View style={[styles.base, getStatusStyle(), getSizeStyle()]}>      <Text style={[styles.text, { color: getStatusStyle().textColor }]}>        {children || status.toUpperCase()}      </Text>    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    textTransform: 'uppercase',
    fontWeight: '500',
    fontSize: 10,
    letterSpacing: 0.1,
  },
});