import { Platform } from 'react-native';

export const Colors = {
  bg: '#0a0a0a',
  card: '#141414',
  cardHover: '#1a1a1a',
  border: 'rgba(255,255,255,0.08)',
  primary: '#6366f1',
  primaryLight: '#818cf8',
  primaryDark: '#4f46e5',
  accent: '#a78bfa',
  text: '#ffffff',
  textMuted: '#a3a3a3',
  textDim: '#737373',
  green: '#4ade80',
  greenBg: 'rgba(74,222,128,0.1)',
  red: '#f87171',
  redBg: 'rgba(248,113,113,0.1)',
  // Keep for compatibility
  light: {
    text: '#11181C',
    background: '#fff',
    tint: '#6366f1',
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: '#6366f1',
  },
  dark: {
    text: '#ffffff',
    background: '#0a0a0a',
    tint: '#818cf8',
    icon: '#a3a3a3',
    tabIconDefault: '#737373',
    tabIconSelected: '#818cf8',
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
