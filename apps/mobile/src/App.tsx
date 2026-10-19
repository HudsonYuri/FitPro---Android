import { useEffect, useMemo, type FC } from 'react';
import { StatusBar } from 'expo-status-bar';
import { DarkTheme, DefaultTheme, NavigationContainer, type Theme as NavigationTheme } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useTheme } from '@fitpro/core-theme';
import { configureRestNotifications } from '@fitpro/feature-workout';
import { RootNavigator } from './navigation/RootNavigator';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 2, refetchOnWindowFocus: false } },
});

export const App: FC = () => {
  const { scheme, colors } = useTheme();

  useEffect(() => {
    void configureRestNotifications();
  }, []);

  const navigationTheme = useMemo((): NavigationTheme => {
    const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        primary: colors.primary,
        background: colors.background,
        card: colors.surface,
        text: colors.text,
        border: colors.border,
      },
    };
  }, [scheme, colors]);

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <NavigationContainer theme={navigationTheme}>
          <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
          <RootNavigator />
        </NavigationContainer>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
};
