import { Platform } from 'react-native';

const fontFamily = Platform.select({
  ios: 'System',
  android: 'Roboto',
  default: 'System',
});

export const fontSizes = {
  overline: 11,
  caption: 12,
  small: 14,
  body: 16,
  bodyLarge: 17,
  subhead: 18,
  title: 20,
  titleLarge: 24,
  h1: 28,
  display: 32,
} as const;

export const lineHeights = {
  tight: 1.25,
  normal: 1.35,
  relaxed: 1.5,
} as const;

export const typography = {
  display: {
    fontFamily,
    fontSize: fontSizes.display,
    fontWeight: '600' as const,
    lineHeight: Math.round(fontSizes.display * lineHeights.tight),
    letterSpacing: -0.5,
  },
  h1: {
    fontFamily,
    fontSize: fontSizes.h1,
    fontWeight: '600' as const,
    lineHeight: Math.round(fontSizes.h1 * lineHeights.tight),
    letterSpacing: -0.5,
  },
  h2: {
    fontFamily,
    fontSize: fontSizes.titleLarge,
    fontWeight: '600' as const,
    lineHeight: Math.round(fontSizes.titleLarge * lineHeights.tight),
  },
  h3: {
    fontFamily,
    fontSize: fontSizes.subhead,
    fontWeight: '600' as const,
    lineHeight: Math.round(fontSizes.subhead * lineHeights.normal),
  },
  h4: {
    fontFamily,
    fontSize: fontSizes.title,
    fontWeight: '600' as const,
    lineHeight: Math.round(fontSizes.title * lineHeights.normal),
  },
  body: {
    fontFamily,
    fontSize: Platform.OS === 'ios' ? fontSizes.bodyLarge : fontSizes.body,
    fontWeight: '400' as const,
    lineHeight: Math.round(
      (Platform.OS === 'ios' ? fontSizes.bodyLarge : fontSizes.body) * lineHeights.relaxed
    ),
  },
  bodySmall: {
    fontFamily,
    fontSize: fontSizes.small,
    fontWeight: '400' as const,
    lineHeight: Math.round(fontSizes.small * lineHeights.relaxed),
  },
  caption: {
    fontFamily,
    fontSize: fontSizes.caption,
    fontWeight: '400' as const,
    lineHeight: Math.round(fontSizes.caption * lineHeights.normal),
  },
  overline: {
    fontFamily,
    fontSize: fontSizes.overline,
    fontWeight: '500' as const,
    lineHeight: Math.round(fontSizes.overline * lineHeights.normal),
    letterSpacing: 0.5,
  },
  button: {
    fontFamily,
    fontSize: fontSizes.body,
    fontWeight: '600' as const,
    lineHeight: Math.round(fontSizes.body * lineHeights.normal),
  },
  buttonSmall: {
    fontFamily,
    fontSize: fontSizes.small,
    fontWeight: '600' as const,
    lineHeight: Math.round(fontSizes.small * lineHeights.normal),
  },
  label: {
    fontFamily,
    fontSize: fontSizes.small,
    fontWeight: '500' as const,
    lineHeight: Math.round(fontSizes.small * lineHeights.normal),
  },
};

export default typography;
