import { useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { darkColors, lightColors, type ColorTokens } from './tokens';

export type Theme = {
  scheme: 'light' | 'dark';
  colors: ColorTokens;
};

export const useTheme = (): Theme => {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  return useMemo(
    () => ({ scheme, colors: scheme === 'dark' ? darkColors : lightColors }),
    [scheme],
  );
};
