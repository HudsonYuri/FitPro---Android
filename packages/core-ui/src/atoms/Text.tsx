import type { FC } from 'react';
import { Text as NativeText, type TextProps as NativeTextProps } from 'react-native';
import { typography, useTheme, type ColorTokens, type TypographyVariant } from '@fitpro/core-theme';
import { assertNever } from '../utils/assert-never';

type TextTone = 'default' | 'muted' | 'primary' | 'danger' | 'onPrimary';

export type TextProps = NativeTextProps & {
  variant?: TypographyVariant;
  tone?: TextTone;
  tabular?: boolean;
};

const toneColor = (colors: ColorTokens, tone: TextTone): string => {
  switch (tone) {
    case 'default':
      return colors.text;
    case 'muted':
      return colors.textMuted;
    case 'primary':
      return colors.primary;
    case 'danger':
      return colors.danger;
    case 'onPrimary':
      return colors.onPrimary;
    default:
      return assertNever(tone);
  }
};

const MAX_FONT_SCALE = 1.8;

export const Text: FC<TextProps> = ({ variant = 'body', tone = 'default', tabular = false, style, ...rest }) => {
  const { colors } = useTheme();
  return (
    <NativeText
      maxFontSizeMultiplier={MAX_FONT_SCALE}
      style={[
        typography[variant],
        { color: toneColor(colors, tone) },
        tabular && { fontVariant: ['tabular-nums'] },
        style,
      ]}
      {...rest}
    />
  );
};
