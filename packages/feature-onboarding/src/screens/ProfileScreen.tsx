import type { FC, ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  EQUIPMENT_LABEL,
  GOAL_LABEL,
  LEVEL_LABEL,
  RESTRICTION_LABEL,
  type UserProfile,
} from '@fitpro/core-types';
import { spacing } from '@fitpro/core-theme';
import { Button, Card, Notice, Screen, Text } from '@fitpro/core-ui';

export const DISCLAIMER =
  'As recomendações são orientações gerais e não substituem o acompanhamento de um profissional de educação física ou de um médico.';

const Row: FC<{ label: string; value: string }> = ({ label, value }) => {
  return (
    <View style={styles.row} accessible accessibilityLabel={`${label}: ${value}`}>
      <Text tone="muted">{label}</Text>
      <Text variant="label" style={styles.value}>
        {value}
      </Text>
    </View>
  );
};

export type ProfileScreenProps = {
  profile: UserProfile;
  onEdit: () => void;
  /** Preferências de outras features, injetadas pelo app (ex.: alertas de descanso). */
  settings?: ReactNode;
};

export const ProfileScreen: FC<ProfileScreenProps> = ({ profile, onEdit, settings }) => {
  const restrictions = profile.restrictions.length
    ? profile.restrictions.map((restriction) => RESTRICTION_LABEL[restriction]).join(', ')
    : 'Nenhuma';

  return (
    <Screen>
      {profile.needsMedicalClearance && (
        <Notice
          tone="danger"
          title="Liberação médica recomendada"
          message="Seu questionário de prontidão indicou risco. Procure um médico antes de intensificar os treinos."
        />
      )}
      <Card style={styles.card}>
        <Row label="Objetivo" value={GOAL_LABEL[profile.goal]} />
        <Row label="Nível" value={LEVEL_LABEL[profile.level]} />
        <Row label="Frequência" value={`${profile.daysPerWeek} dias · ${profile.minutesPerSession} min`} />
        <Row label="Equipamento" value={profile.equipment.map((item) => EQUIPMENT_LABEL[item]).join(', ')} />
        <Row label="Restrições" value={restrictions} />
      </Card>
      {settings && <Card style={styles.card}>{settings}</Card>}
      <Button label="Editar perfil" variant="secondary" onPress={onEdit} accessibilityHint="Refaz a anamnese e atualiza o plano" />
      <Notice title="Aviso" message={DISCLAIMER} />
    </Screen>
  );
};

const styles = StyleSheet.create({
  card: { gap: spacing.md },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md },
  value: { flexShrink: 1, textAlign: 'right' },
});
