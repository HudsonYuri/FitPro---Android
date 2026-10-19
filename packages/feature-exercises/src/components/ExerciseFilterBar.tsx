import type { FC } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';
import {
  EXERCISE_EQUIPMENTS,
  EXERCISE_EQUIPMENT_LABEL,
  MUSCLE_GROUPS,
  MUSCLE_LABEL,
  type ExerciseEquipment,
  type MuscleGroup,
} from '@fitpro/core-types';
import { radii, sizes, spacing, typography, useTheme } from '@fitpro/core-theme';
import { Chip } from '@fitpro/core-ui';

const FILTERABLE_EQUIPMENT = EXERCISE_EQUIPMENTS.filter((equipment) => equipment !== 'outro');

export type ExerciseFilterBarProps = {
  query: string;
  onChangeQuery: (query: string) => void;
  muscle: MuscleGroup | undefined;
  onToggleMuscle: (muscle: MuscleGroup) => void;
  equipment: ExerciseEquipment | undefined;
  onToggleEquipment: (equipment: ExerciseEquipment) => void;
};

export const ExerciseFilterBar: FC<ExerciseFilterBarProps> = ({
  query,
  onChangeQuery,
  muscle,
  onToggleMuscle,
  equipment,
  onToggleEquipment,
}) => {
  const { colors } = useTheme();
  return (
    <View style={styles.root}>
      <TextInput
        value={query}
        onChangeText={onChangeQuery}
        placeholder="Buscar exercício"
        placeholderTextColor={colors.textMuted}
        accessibilityLabel="Buscar exercício"
        autoCorrect={false}
        returnKeyType="search"
        clearButtonMode="while-editing"
        style={[styles.input, typography.body, { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border }]}
      />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {MUSCLE_GROUPS.map((group) => (
          <Chip key={group} label={MUSCLE_LABEL[group]} selected={muscle === group} onPress={() => onToggleMuscle(group)} />
        ))}
      </ScrollView>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {FILTERABLE_EQUIPMENT.map((item) => (
          <Chip
            key={item}
            label={EXERCISE_EQUIPMENT_LABEL[item]}
            selected={equipment === item}
            onPress={() => onToggleEquipment(item)}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { gap: spacing.sm, paddingBottom: spacing.md },
  input: {
    minHeight: sizes.touchTarget,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  chips: { gap: spacing.sm },
});
