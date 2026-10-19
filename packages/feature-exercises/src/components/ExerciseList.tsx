import { useCallback, type FC, type ReactElement } from 'react';
import { StyleSheet, View } from 'react-native';
import { FlashList, type ListRenderItem } from '@shopify/flash-list';
import type { Exercise } from '@fitpro/core-types';
import { sizes, spacing } from '@fitpro/core-theme';
import { Skeleton, StateView } from '@fitpro/core-ui';
import { ExerciseListCard } from './ExerciseListCard';

export const ExerciseListEmpty: FC = () => {
  return <StateView kind="empty" title="Nenhum exercício" message="Ajuste a busca ou os filtros." />;
};

const SKELETON_ROWS = 6;

export const ExerciseListSkeleton: FC = () => {
  return (
    <View style={styles.skeleton} accessibilityLabel="Carregando exercícios" accessibilityRole="progressbar">
      {Array.from({ length: SKELETON_ROWS }, (_, index) => (
        <Skeleton key={index} width="100%" height={sizes.thumbnail + spacing.md} />
      ))}
    </View>
  );
};

const ExerciseListSeparator: FC = () => {
  return <View style={styles.separator} />;
};

const keyExtractor = (exercise: Exercise): string => exercise.id;

export type ExerciseListProps = {
  exercises: readonly Exercise[];
  onPressExercise: (exerciseId: string) => void;
  header?: ReactElement;
};

export const ExerciseList: FC<ExerciseListProps> = ({ exercises, onPressExercise, header }) => {
  const renderItem = useCallback<ListRenderItem<Exercise>>(
    ({ item, index }) => <ExerciseListCard exercise={item} index={index} onPress={onPressExercise} />,
    [onPressExercise],
  );

  return (
    <FlashList
      data={exercises}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      ListHeaderComponent={header}
      ListEmptyComponent={ExerciseListEmpty}
      ItemSeparatorComponent={ExerciseListSeparator}
      contentInsetAdjustmentBehavior="automatic"
      keyboardDismissMode="on-drag"
      contentContainerStyle={styles.content}
    />
  );
};

const styles = StyleSheet.create({
  content: { padding: spacing.md },
  separator: { height: spacing.sm },
  skeleton: { padding: spacing.md, gap: spacing.sm },
});
