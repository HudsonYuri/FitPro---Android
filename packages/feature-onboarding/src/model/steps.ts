import {
  assertNever,
  type Equipment,
  type Goal,
  type Level,
  type Restriction,
  type SessionMinutes,
  type TrainingDays,
  type UserProfile,
} from '@fitpro/core-types';

export const STEPS = ['goal', 'level', 'schedule', 'equipment', 'restrictions', 'readiness'] as const;
export type OnboardingStep = (typeof STEPS)[number];

export const DAY_OPTIONS = [2, 3, 4, 5, 6] as const satisfies readonly TrainingDays[];
export const MINUTE_OPTIONS = [30, 45, 60, 75, 90] as const satisfies readonly SessionMinutes[];

/** Questionário de prontidão no estilo PAR-Q. Qualquer "sim" pede liberação médica. */
export const READINESS_QUESTIONS = [
  'Algum médico já disse que você tem um problema no coração e só deve fazer atividade física recomendada por ele?',
  'Você sente dor no peito quando pratica atividade física?',
  'No último mês, você sentiu dor no peito sem estar fazendo atividade física?',
  'Você perde o equilíbrio por tontura ou já perdeu a consciência?',
  'Você tem algum problema ósseo ou articular que pode piorar com atividade física?',
  'Você toma medicamento para pressão arterial ou para o coração?',
  'Você sabe de alguma outra razão pela qual não deveria praticar atividade física?',
] as const;

export type ReadinessAnswer = 'sim' | 'nao';

export type OnboardingDraft = {
  goal: Goal | undefined;
  level: Level | undefined;
  daysPerWeek: TrainingDays | undefined;
  minutesPerSession: SessionMinutes | undefined;
  equipment: Equipment[];
  /** `undefined` = ainda não respondeu; `[]` = "nenhuma". */
  restrictions: Restriction[] | undefined;
  readiness: (ReadinessAnswer | undefined)[];
};

export const emptyDraft = (): OnboardingDraft => ({
  goal: undefined,
  level: undefined,
  daysPerWeek: undefined,
  minutesPerSession: undefined,
  equipment: [],
  restrictions: undefined,
  readiness: READINESS_QUESTIONS.map(() => undefined),
});

export const draftFromProfile = (profile: UserProfile): OnboardingDraft => ({
  goal: profile.goal,
  level: profile.level,
  daysPerWeek: profile.daysPerWeek,
  minutesPerSession: profile.minutesPerSession,
  equipment: [...profile.equipment],
  restrictions: [...profile.restrictions],
  readiness: READINESS_QUESTIONS.map(() => (profile.needsMedicalClearance ? undefined : 'nao')),
});

export const needsMedicalClearance = (draft: OnboardingDraft): boolean =>
  draft.readiness.some((answer) => answer === 'sim');

export const isStepComplete = (step: OnboardingStep, draft: OnboardingDraft): boolean => {
  switch (step) {
    case 'goal':
      return draft.goal !== undefined;
    case 'level':
      return draft.level !== undefined;
    case 'schedule':
      return draft.daysPerWeek !== undefined && draft.minutesPerSession !== undefined;
    case 'equipment':
      return draft.equipment.length > 0;
    case 'restrictions':
      return draft.restrictions !== undefined;
    case 'readiness':
      return draft.readiness.every((answer) => answer !== undefined);
    default:
      return assertNever(step);
  }
};

/** Converte o rascunho num perfil só quando todas as respostas existem. */
export const toProfile = (draft: OnboardingDraft): UserProfile | undefined => {
  const { goal, level, daysPerWeek, minutesPerSession, restrictions } = draft;
  if (!goal || !level || !daysPerWeek || !minutesPerSession || !restrictions || draft.equipment.length === 0) {
    return undefined;
  }
  return {
    goal,
    level,
    daysPerWeek,
    minutesPerSession,
    equipment: draft.equipment,
    restrictions,
    needsMedicalClearance: needsMedicalClearance(draft),
  };
};
