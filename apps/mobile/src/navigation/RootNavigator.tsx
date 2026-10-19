import type { FC } from 'react';
import { Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { sizes, useTheme } from '@fitpro/core-theme';
import { useProfileStore } from '@fitpro/feature-onboarding';
import {
  EditProfileRoute,
  ExerciseDetailRoute,
  OnboardingRoute,
  SwapExerciseRoute,
  WorkoutRoute,
  WorkoutSummaryRoute,
} from '../screens/StackScreens';
import { ExercisesTab, PlanTab, ProfileTab, ProgressTab, TodayTab } from '../screens/TabScreens';
import type { RootStackParamList, TabParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

const TAB_ICONS: Record<keyof TabParamList, IconName> = {
  Hoje: 'calendar-today',
  Treinos: 'clipboard-list-outline',
  Exercicios: 'dumbbell',
  Progresso: 'chart-line',
  Perfil: 'account-circle-outline',
};

const Tabs: FC = () => {
  const { colors } = useTheme();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarIcon: ({ color }) => <MaterialCommunityIcons name={TAB_ICONS[route.name]} size={sizes.icon} color={color} />,
        tabBarButtonTestID: `tab-${route.name}`,
      })}
    >
      <Tab.Screen name="Hoje" component={TodayTab} options={{ title: 'Treino de hoje', tabBarLabel: 'Hoje' }} />
      <Tab.Screen name="Treinos" component={PlanTab} options={{ title: 'Plano da semana', tabBarLabel: 'Treinos' }} />
      <Tab.Screen name="Exercicios" component={ExercisesTab} options={{ title: 'Exercícios' }} />
      <Tab.Screen name="Progresso" component={ProgressTab} options={{ title: 'Progresso' }} />
      <Tab.Screen name="Perfil" component={ProfileTab} options={{ title: 'Perfil' }} />
    </Tab.Navigator>
  );
};

export const RootNavigator: FC = () => {
  const { colors } = useTheme();
  const hasProfile = useProfileStore((state) => state.profile !== undefined);

  return (
    <Stack.Navigator
      initialRouteName={hasProfile ? 'Tabs' : 'Onboarding'}
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        contentStyle: { backgroundColor: colors.background },
        animation: Platform.OS === 'android' ? 'fade_from_bottom' : 'default',
      }}
    >
      <Stack.Screen name="Onboarding" component={OnboardingRoute} options={{ headerShown: false }} />
      <Stack.Screen name="Tabs" component={Tabs} options={{ headerShown: false }} />
      <Stack.Screen name="ExerciseDetail" component={ExerciseDetailRoute} options={{ title: 'Exercício' }} />
      <Stack.Screen
        name="SwapExercise"
        component={SwapExerciseRoute}
        options={{ title: 'Trocar exercício', presentation: 'modal' }}
      />
      <Stack.Screen
        name="Workout"
        component={WorkoutRoute}
        options={{ title: 'Treino em andamento', gestureEnabled: false }}
      />
      <Stack.Screen
        name="WorkoutSummary"
        component={WorkoutSummaryRoute}
        options={{ title: 'Resumo', headerBackVisible: false, gestureEnabled: false }}
      />
      <Stack.Screen name="EditProfile" component={EditProfileRoute} options={{ title: 'Editar perfil' }} />
    </Stack.Navigator>
  );
};
