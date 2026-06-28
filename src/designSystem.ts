const themes = {
  dark: {
    background: '#0a0a0a',
    surface: '#131313',
    surfaceContainerLow: '#1c1b1b',
    surfaceContainer: '#201f1f',
    surfaceContainerHigh: '#2a2a2a',
    surfaceContainerHighest: '#353534',
    surfaceContainerLowest: '#0e0e0e',
    primary: '#ffd597',
    primaryContainer: '#ffb000',
    onPrimaryContainer: '#6a4700',
    textMain: '#eeeeee',
    onSurface: '#e5e2e1',
    secondary: '#c8c6c5',
    textDim: '#888888',
    borderMuted: '#333333',
    success: '#4caf50',
    error: '#ffb4ab',
    danger: '#f44336',
    cancelled: {
      bg: '#333333',
      text: '#ffffff',
      border: '#555555',
    },
    present: {
      bg: '#1b5e20',
      text: '#a5d6a7',
      border: '#2e7d32',
    },
    absent: {
      bg: '#b71c1c',
      text: '#ffcdd2',
      border: '#d32f2f',
    },
  },
};

const typography = {
  labelSm: {
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 0.1,
  },
  bodyMd: {
    fontSize: 14,
    fontWeight: '400',
  },
  headlineMd: {
    fontSize: 20,
    fontWeight: '600',
  },
  labelLg: {
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.05,
  },
  bodyLg: {
    fontSize: 16,
    fontWeight: '400',
  },
  headlineLg: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.02,
  },
  codeDisplay: {
    fontSize: 32,
    fontWeight: '700',
  },
};

const spacing = {
  xs: 4,
  sm: 8,
  unit: 8,
  md: 16,
  lg: 24,
  xl: 32,
  screenHorizontal: 16,
};

const borderRadius = {
  default: 2,
  lg: 4,
  xl: 8,
  full: 12,
};

export const designSystem = {
  themes,
  typography,
  spacing,
  borderRadius,
};