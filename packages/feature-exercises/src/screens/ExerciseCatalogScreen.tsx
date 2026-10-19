import type { FC } from 'react';
import { StyleSheet, View } from 'react-native';
import { assertNever, type Exercise } from '@fitpro/core-types';
import { useTheme } from '@fitpro/core-theme';
import { StateView } from '@fitpro/core-ui';
import { ExerciseFilterBar } from '../components/ExerciseFilterBar';
import { ExerciseList, ExerciseListSkeleton } from '../components/ExerciseList';
import { useExerciseCatalog } from '../hooks/use-exercise-catalog';
import { useExerciseSearch } from '../hooks/use-exercise-search';

export type ExerciseCatalogScreenProps = {
  onOpenExercise: (exerciseId: string) => void;
};

const CatalogResults: FC<{ catalog: readonly Exercise[]; onOpenExercise: (exerciseId: string) => void }> = ({
  catalog,
  onOpenExercise,
}) => {
  const search = useExerciseSearch(catalog);
  return (
    <ExerciseList
      exercises={search.results}
      onPressExercise={onOpenExercise}
      header={
        <ExerciseFilterBar
          query={search.query}
          onChangeQuery={search.setQuery}
          muscle={search.muscle}
          onToggleMuscle={search.toggleMuscle}
          equipment={search.equipment}
          onToggleEquipment={search.toggleEquipment}
        />
      }
    />
  );
};

export const ExerciseCatalogScreen: FC<ExerciseCatalogScreenProps> = ({ onOpenExercise }) => {
  const { colors } = useTheme();
  const catalog = useExerciseCatalog();

  const content = (() => {
    switch (catalog.status) {
      case 'loading':
        return <ExerciseListSkeleton />;
      case 'error':
        return <StateView kind="error" message={catalog.message} onRetry={catalog.retry} />;
      case 'ready':
        return <CatalogResults catalog={catalog.data} onOpenExercise={onOpenExercise} />;
      default:
        return assertNever(catalog);
    }
  })();

  return <View style={[styles.root, { backgroundColor: colors.background }]}>{content}</View>;
};

const styles = StyleSheet.create({ root: { flex: 1 } });
