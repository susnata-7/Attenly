import React from 'react';
import { Text, View, StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { designSystem } from './designSystem';

interface TypographyStyle {
  fontSize: number;
  fontWeight: string;
  letterSpacing?: number;
}

interface Theme {
  background: string;
  surface: string;
  surfaceContainerLow: string;
  surfaceContainer: string;
  surfaceContainerHigh: string;
  surfaceContainerHighest: string;
  surfaceContainerLowest: string;
  primary: string;
  primaryContainer: string;
  onPrimaryContainer: string;
  textMain: string;
  onSurface: string;
  secondary: string;
  textDim: string;
  borderMuted: string;
  success: string;
  error: string;
  danger: string;
  cancelled: {
    bg: string;
    text: string;
    border: string;
  };
  present: {
    bg: string;
    text: string;
    border: string;
  };
  absent: {
    bg: string;
    text: string;
    border: string;
  };
}

interface Spacing {
  xs: number;
  sm: number;
  unit: number;
  md: number;
  lg: number;
  xl: number;
  screenHorizontal: number;
}

interface BorderRadius {
  default: number;
  lg: number;
  xl: number;
  full: number;
}

const getTheme = (mode: 'light' | 'dark' = 'dark'): Theme => {
  return designSystem.themes[mode];
};

const getTypography = (key: keyof typeof designSystem.typography): TextStyle => {
  return designSystem.typography[key];
};

const getSpacing = (key: keyof typeof designSystem.spacing): number => {
  return designSystem.spacing[key];
};

export const theme = designSystem.themes.dark;
export const typography = designSystem.typography;
export const spacing = designSystem.spacing;
export const borderRadius = designSystem.borderRadius;

export const applyTheme = (element: any, themeType: 'light' | 'dark' = 'dark') => {
  element.setNativeProps ? element.setNativeProps({ style: getTheme(themeType) }) : null;
};