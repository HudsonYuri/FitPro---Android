import type { FC } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  EQUIPMENTS,
  EQUIPMENT_LABEL,
  GOALS,
  GOAL_LABEL,
  LEVELS,
  LEVEL_LABEL,
  RESTRICTIONS,
  RESTRICTION_LABEL,
  assertNever,
  type Equipment,
  type Goal,
  type Level,
  type Restriction,
} from '@fitpro/core-types';
import { spacing } from '@fitpro/core-theme';
import { Chip, Notice, Text } from '@fitpro/core-ui';
import {
  DAY_OPTIONS,
  MINUTE_OPTIONS,
  READINESS_QUESTIONS,
  type OnboardingDraft,
  type OnboardingStep,
  type ReadinessAnswer,
} from '../model/steps';
import { OptionCard } from './OptionCard';

const GOAL_HINT: Record<Goal, string> = {
  hipertrofia: 'Ganhar massa muscular',
  emagrecimento: 'Reduzir gordura mantendo músculos',
  forca: 'Levantar mais peso',
  resistencia: 'Aguentar mais repetições e mais tempo',
  saude: 'Mexer o corpo com segurança',
};

const LEVEL_HINT: Record<Level, string> = {
  iniciante: 'Nunca treinei ou parei há mais de 6 meses',
  intermediario: 'Treino há 6 meses a 2 anos',
  avancado: 'Treino com regularidade há mais de 2 anos',
};

const EQUIPMENT_HINT: Record<Equipment, string> = {
  academia_completa: 'Barras, máquinas, polias e halteres',
  halteres: 'Um par de halteres em casa',
  peso_corporal: 'Sem equipamento',
  elastico: 'Faixas elásticas de resistência',
};

const toggleIn = <T,>(list: readonly T[], value: T): T[] =>
  list.includes(value) ? list.filter((item) => item !== value) : [...list, value];

type StepProps = { draft: OnboardingDraft; update: (patch: Partial<OnboardingDraft>) => void };

const Question: FC<{ title: string; subtitle?: string }> = ({ title, subtitle }) => {
  return (
    <View style={styles.question}>
      <Text variant="title" accessibilityRole="header">
        {title}
      </Text>
      {subtitle && <Text tone="muted">{subtitle}</Text>}
    </View>
  );
};

const GoalStep: FC<StepProps> = ({ draft, update }) => {
  return (
    <>
      <Question title="Qual é o seu objetivo principal?" />
      {GOALS.map((goal) => (
        <OptionCard
          key={goal}
          label={GOAL_LABEL[goal]}
          description={GOAL_HINT[goal]}
          selected={draft.goal === goal}
          onPress={() => update({ goal })}
        />
      ))}
    </>
  );
};

const LevelStep: FC<StepProps> = ({ draft, update }) => {
  return (
    <>
      <Question title="Qual é a sua experiência com musculação?" />
      {LEVELS.map((level) => (
        <OptionCard
          key={level}
          label={LEVEL_LABEL[level]}
          description={LEVEL_HINT[level]}
          selected={draft.level === level}
          onPress={() => update({ level })}
        />
      ))}
    </>
  );
};

const ScheduleStep: FC<StepProps> = ({ draft, update }) => {
  return (
    <>
      <Question title="Quanto tempo você tem?" subtitle="A divisão do treino é escolhida a partir disso." />
      <Text variant="heading">Dias por semana</Text>
      <View style={styles.chips}>
        {DAY_OPTIONS.map((days) => (
          <Chip key={days} label={`${days} dias`} selected={draft.daysPerWeek === days} onPress={() => update({ daysPerWeek: days })} />
        ))}
      </View>
      <Text variant="heading">Tempo por sessão</Text>
      <View style={styles.chips}>
        {MINUTE_OPTIONS.map((minutes) => (
          <Chip
            key={minutes}
            label={`${minutes} min`}
            selected={draft.minutesPerSession === minutes}
            onPress={() => update({ minutesPerSession: minutes })}
          />
        ))}
      </View>
    </>
  );
};

const EquipmentStep: FC<StepProps> = ({ draft, update }) => {
  return (
    <>
      <Question title="Que equipamento você tem?" subtitle="Marque tudo o que estiver disponível." />
      {EQUIPMENTS.map((equipment) => (
        <OptionCard
          key={equipment}
          kind="checkbox"
          label={EQUIPMENT_LABEL[equipment]}
          description={EQUIPMENT_HINT[equipment]}
          selected={draft.equipment.includes(equipment)}
          onPress={() => update({ equipment: toggleIn(draft.equipment, equipment) })}
        />
      ))}
    </>
  );
};

const RestrictionsStep: FC<StepProps> = ({ draft, update }) => {
  const selected = draft.restrictions ?? [];
  const toggleRestriction = (restriction: Restriction): void => update({ restrictions: toggleIn(selected, restriction) });
  return (
    <>
      <Question title="Você tem alguma lesão ou restrição?" subtitle="Vamos evitar exercícios que sobrecarreguem essas regiões." />
      {RESTRICTIONS.map((restriction) => (
        <OptionCard
          key={restriction}
          kind="checkbox"
          label={RESTRICTION_LABEL[restriction]}
          selected={selected.includes(restriction)}
          onPress={() => toggleRestriction(restriction)}
        />
      ))}
      <OptionCard
        kind="checkbox"
        label="Nenhuma"
        selected={draft.restrictions !== undefined && draft.restrictions.length === 0}
        onPress={() => update({ restrictions: [] })}
      />
    </>
  );
};

const ReadinessStep: FC<StepProps & { showMedicalWarning: boolean }> = ({ draft, update, showMedicalWarning }) => {
  const answer = (index: number, value: ReadinessAnswer): void =>
    update({ readiness: draft.readiness.map((current, position) => (position === index ? value : current)) });
  return (
    <>
      <Question title="Prontidão para atividade física" subtitle="Responda com sinceridade. Baseado no questionário PAR-Q." />
      {READINESS_QUESTIONS.map((question, index) => (
        <View key={question} style={styles.readiness}>
          <Text>{question}</Text>
          <View style={styles.chips}>
            <Chip label="Não" selected={draft.readiness[index] === 'nao'} onPress={() => answer(index, 'nao')} />
            <Chip label="Sim" selected={draft.readiness[index] === 'sim'} onPress={() => answer(index, 'sim')} />
          </View>
        </View>
      ))}
      {showMedicalWarning && (
        <Notice
          tone="danger"
          title="Procure liberação médica antes de começar"
          message="Uma ou mais respostas indicam risco. Converse com um médico antes de iniciar ou intensificar os treinos."
        />
      )}
    </>
  );
};

export type OnboardingStepContentProps = StepProps & { step: OnboardingStep; showMedicalWarning: boolean };

export const OnboardingStepContent: FC<OnboardingStepContentProps> = ({ step, draft, update, showMedicalWarning }) => {
  switch (step) {
    case 'goal':
      return <GoalStep draft={draft} update={update} />;
    case 'level':
      return <LevelStep draft={draft} update={update} />;
    case 'schedule':
      return <ScheduleStep draft={draft} update={update} />;
    case 'equipment':
      return <EquipmentStep draft={draft} update={update} />;
    case 'restrictions':
      return <RestrictionsStep draft={draft} update={update} />;
    case 'readiness':
      return <ReadinessStep draft={draft} update={update} showMedicalWarning={showMedicalWarning} />;
    default:
      return assertNever(step);
  }
};

const styles = StyleSheet.create({
  question: { gap: spacing.sm, paddingBottom: spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  readiness: { gap: spacing.sm, paddingVertical: spacing.sm },
});
