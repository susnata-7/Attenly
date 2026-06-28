import React from 'react';
import { Text, View, StyleSheet, Pressable, PressableProps } from 'react-native';
import { designSystem } from '../designSystem';

interface ButtonProps extends PressableProps {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  style?: any;
}

export const Button = ({ 
  variant = 'primary', 
  size = 'md', 
  children, 
  style, 
  ...props 
}: ButtonProps) => {
  const getVariantStyle = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: designSystem.themes.dark.primaryContainer,
          borderColor: designSystem.themes.dark.primaryContainer,
        };
      case 'secondary':
        return {
          backgroundColor: 'transparent',
          borderColor: designSystem.themes.dark.borderMuted,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderColor: designSystem.themes.dark.primaryContainer,
        };
      default:
        return { backgroundColor: designSystem.themes.dark.primaryContainer };
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'sm':
        return {
          paddingVertical: designSystem.spacing.xs,
          paddingHorizontal: designSystem.spacing.sm,
          borderRadius: designSystem.borderRadius.default,
        };
      case 'lg':
        return {
          paddingVertical: designSystem.spacing.md,
          paddingHorizontal: designSystem.spacing.lg,
          borderRadius: designSystem.borderRadius.lg,
        };
      default:
        return {
          paddingVertical: designSystem.spacing.sm,
          paddingHorizontal: designSystem.spacing.md,
          borderRadius: designSystem.borderRadius.default,
        };
    }
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.base,
        getVariantStyle(),
        getSizeStyle(),
        styles.buttonText,
        pressed && styles.pressed,
        style,
      ]}
      {...props}
    >
      <Text style={styles.text}>{children}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    borderWidth: 1,
  },
  buttonText: {
    textTransform: 'uppercase',
    fontWeight: '500',
    letterSpacing: 0.05,
  },
  text: {
    color: designSystem.themes.dark.onPrimaryContainer,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
});