import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type TabParamList = {
  Hoje: undefined;
  Treinos: undefined;
  Exercicios: undefined;
  Progresso: undefined;
  Perfil: undefined;
};

/** Só IDs nos parâmetros: os dados vêm sempre dos stores/queries. */
export type RootStackParamList = {
  Onboarding: undefined;
  Tabs: NavigatorScreenParams<TabParamList>;
  ExerciseDetail: { exerciseId: string; slotId?: string };
  SwapExercise: { slotId: string; exerciseId: string };
  Workout: { sessionId: string };
  WorkoutSummary: { workoutId: string };
  EditProfile: undefined;
};

export type RootScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<RootStackParamList, T>;

export type TabScreenProps<T extends keyof TabParamList> = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, T>,
  NativeStackScreenProps<RootStackParamList>
>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
