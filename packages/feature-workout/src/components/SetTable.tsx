import { useState, type FC } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import Animated, { FadeInDown, FadeOut, LinearTransition } from 'react-native-reanimated';
import { durations, radii, sizes, spacing, typography, useTheme } from '@fitpro/core-theme';
import { Button, Text, Touchable } from '@fitpro/core-ui';
import { parseDecimal } from '../model/set-rows';
import type { PreviousSet, SetRow } from '../model/types';

type NumberCellProps = {
  value: number;
  label: string;
  decimal: boolean;
  onCommit: (value: number) => void;
};

/** Edita como texto livre e só converte ao sair do campo, para aceitar "62," no meio da digitação. */
const NumberCell: FC<NumberCellProps> = ({ value, label, decimal, onCommit }) => {
  const { colors } = useTheme();
  const [draft, setDraft] = useState<string | undefined>(undefined);
  return (
    <TextInput
      value={draft ?? value.toLocaleString('pt-BR')}
      onFocus={() => setDraft(value.toLocaleString('pt-BR'))}
      onChangeText={setDraft}
      onEndEditing={() => {
        onCommit(parseDecimal(draft ?? '', value));
        setDraft(undefined);
      }}
      keyboardType={decimal ? 'decimal-pad' : 'number-pad'}
      selectTextOnFocus
      accessibilityLabel={label}
      style={[styles.input, typography.label, { color: colors.text, backgroundColor: colors.surfaceRaised }]}
    />
  );
};

type SetTableRowProps = {
  index: number;
  /** "1", "2"… para séries válidas; "A" para aquecimento. */
  label: string;
  row: SetRow;
  previous: PreviousSet | undefined;
  onChange: (index: number, patch: Partial<Pick<SetRow, 'loadKg' | 'reps'>>) => void;
  onToggle: (index: number) => void;
};

const SetTableRow: FC<SetTableRowProps> = ({ index, label, row, previous, onChange, onToggle }) => {
  const { colors } = useTheme();
  const isWarmup = row.kind === 'aquecimento';
  const setName = isWarmup ? 'aquecimento' : `série ${label}`;
  const previousLabel = isWarmup
    ? 'Aquecimento'
    : previous
      ? `${previous.loadKg.toLocaleString('pt-BR')} × ${previous.reps}`
      : '—';
  return (
    <Animated.View
      entering={FadeInDown.duration(durations.normal)}
      exiting={FadeOut.duration(durations.fast)}
      layout={LinearTransition.duration(durations.normal)}
      style={[styles.row, row.done && { backgroundColor: colors.primarySoft }]}
    >
      <Text variant="label" tone={isWarmup ? 'muted' : 'default'} tabular style={styles.setColumn}>
        {label}
      </Text>
      <Text variant="caption" tone="muted" tabular style={styles.previousColumn} numberOfLines={1}>
        {previousLabel}
      </Text>
      <NumberCell
        value={row.loadKg}
        decimal
        label={`Carga da ${setName}, em quilos`}
        onCommit={(loadKg) => onChange(index, { loadKg })}
      />
      <NumberCell
        value={row.reps}
        decimal={false}
        label={`Repetições da ${setName}`}
        onCommit={(reps) => onChange(index, { reps: Math.round(reps) })}
      />
      <Touchable
        onPress={() => onToggle(index)}
        accessibilityRole="checkbox"
        accessibilityLabel={isWarmup ? 'Aquecimento feito' : `Série ${label} feita`}
        accessibilityState={{ checked: row.done }}
        style={[
          styles.check,
          { backgroundColor: row.done ? colors.primary : colors.surfaceRaised, borderColor: colors.border },
        ]}
      >
        <Text variant="heading" tone={row.done ? 'onPrimary' : 'muted'}>
          ✓
        </Text>
      </Touchable>
    </Animated.View>
  );
};

export type SetTableProps = {
  rows: readonly SetRow[];
  previousSets: readonly PreviousSet[];
  onChangeRow: (index: number, patch: Partial<Pick<SetRow, 'loadKg' | 'reps'>>) => void;
  onToggleRow: (index: number) => void;
  onAddSet: () => void;
  onMarkAll: () => void;
};

export const SetTable: FC<SetTableProps> = ({ rows, previousSets, onChangeRow, onToggleRow, onAddSet, onMarkAll }) => {
  return (
    <View style={styles.table}>
      <View style={styles.row} importantForAccessibility="no-hide-descendants">
        <Text variant="caption" tone="muted" style={styles.setColumn}>
          SÉRIE
        </Text>
        <Text variant="caption" tone="muted" style={styles.previousColumn}>
          ANTERIOR
        </Text>
        <Text variant="caption" tone="muted" style={styles.inputHeader}>
          KG
        </Text>
        <Text variant="caption" tone="muted" style={styles.inputHeader}>
          REPS
        </Text>
        <View style={styles.checkHeader} />
      </View>
      {rows.map((row, index) => {
        const warmupCount = rows.slice(0, index).filter((item) => item.kind === 'aquecimento').length;
        const workingIndex = index - warmupCount;
        return (
          <SetTableRow
            key={index}
            index={index}
            label={row.kind === 'aquecimento' ? 'A' : String(workingIndex + 1)}
            row={row}
            previous={row.kind === 'valida' ? previousSets[workingIndex] : undefined}
            onChange={onChangeRow}
            onToggle={onToggleRow}
          />
        );
      })}
      <View style={styles.actions}>
        <View style={styles.action}>
          <Button label="+ Adicionar série" variant="ghost" onPress={onAddSet} />
        </View>
        <View style={styles.action}>
          <Button label="Marcar todas" variant="ghost" onPress={onMarkAll} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  table: { gap: spacing.xs },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.md,
  },
  setColumn: { width: spacing.lg, textAlign: 'center' },
  previousColumn: { flex: 1 },
  inputHeader: { width: sizes.setColumn, textAlign: 'center' },
  checkHeader: { width: sizes.touchTarget },
  input: {
    width: sizes.setColumn,
    minHeight: sizes.touchTarget,
    textAlign: 'center',
    borderRadius: radii.sm,
  },
  check: {
    width: sizes.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.sm,
    borderWidth: StyleSheet.hairlineWidth,
  },
  actions: { flexDirection: 'row', gap: spacing.sm },
  action: { flex: 1 },
});
