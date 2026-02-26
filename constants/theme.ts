/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#0a7ea4';
const tintColorDark = '#1ec7eb';

export const AppPalette = {
  light: {
    background: '#f4f8fb',
    surface: '#ffffff',
    surfaceAlt: '#eef5fa',
    border: '#d2dfeb',
    borderSoft: '#dbe7f1',
    text: '#0f172a',
    textMuted: '#475569',
    textSubtle: '#64748b',
    accent: '#0ea5c6',
    accentStrong: '#06b6d4',
    success: '#16a34a',
    warning: '#f59e0b',
    danger: '#b91c1c',
  },
  dark: {
    background: '#031d29',
    surface: '#0b2234',
    surfaceAlt: '#11273b',
    border: '#1f3f53',
    borderSoft: '#244660',
    text: '#ecf2fa',
    textMuted: '#91a3b7',
    textSubtle: '#7b92ab',
    accent: '#1ec7eb',
    accentStrong: '#11d0ff',
    success: '#16a34a',
    warning: '#f59e0b',
    danger: '#b91c1c',
  },
} as const;

export const Colors = {
  light: {
    text: AppPalette.light.text,
    background: AppPalette.light.background,
    tint: tintColorLight,
    icon: AppPalette.light.textMuted,
    tabIconDefault: AppPalette.light.textMuted,
    tabIconSelected: tintColorLight,
    surface: AppPalette.light.surface,
    surfaceAlt: AppPalette.light.surfaceAlt,
    border: AppPalette.light.border,
    accent: AppPalette.light.accent,
    muted: AppPalette.light.textMuted,
  },
  dark: {
    text: AppPalette.dark.text,
    background: AppPalette.dark.background,
    tint: tintColorDark,
    icon: AppPalette.dark.textMuted,
    tabIconDefault: AppPalette.dark.textMuted,
    tabIconSelected: tintColorDark,
    surface: AppPalette.dark.surface,
    surfaceAlt: AppPalette.dark.surfaceAlt,
    border: AppPalette.dark.border,
    accent: AppPalette.dark.accent,
    muted: AppPalette.dark.textMuted,
  },
};

export const TextSizes = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  title: 21,
  h1: 29,
  display: 43,
} as const;

export const TextLineHeights = {
  xs: 14,
  sm: 18,
  md: 20,
  lg: 24,
  xl: 27,
  title: 31,
  h1: 39,
  display: 50,
} as const;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
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
