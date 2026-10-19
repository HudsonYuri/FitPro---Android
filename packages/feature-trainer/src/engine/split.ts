import { assertNever, type MuscleGroup, type SlotRole, type SplitKind, type TrainingDays } from '@fitpro/core-types';

export type Slot = { target: MuscleGroup; role: SlotRole };

export type SessionTemplate = {
  id: string;
  title: string;
  slots: readonly Slot[];
  /** Repetições do mesmo modelo na semana (A, B, C) variam os exercícios escolhidos. */
  variant: number;
};

const principal = (target: MuscleGroup): Slot => ({ target, role: 'principal' });
const accessory = (target: MuscleGroup): Slot => ({ target, role: 'acessorio' });

const FULL_BODY: readonly Slot[] = [
  principal('quadriceps'),
  principal('peito'),
  principal('costas'),
  principal('posterior'),
  accessory('ombros'),
  accessory('gluteos'),
  accessory('triceps'),
  accessory('biceps'),
  accessory('abdomen'),
];

const UPPER: readonly Slot[] = [
  principal('peito'),
  principal('costas'),
  principal('ombros'),
  accessory('costas'),
  accessory('peito'),
  accessory('triceps'),
  accessory('biceps'),
];

const LOWER: readonly Slot[] = [
  principal('quadriceps'),
  principal('posterior'),
  accessory('gluteos'),
  accessory('quadriceps'),
  accessory('panturrilha'),
  accessory('abdomen'),
];

const PUSH: readonly Slot[] = [
  principal('peito'),
  principal('ombros'),
  accessory('peito'),
  accessory('ombros'),
  accessory('triceps'),
  accessory('triceps'),
];

const PULL: readonly Slot[] = [
  principal('costas'),
  accessory('costas'),
  accessory('costas'),
  accessory('biceps'),
  accessory('biceps'),
  accessory('abdomen'),
];

const LEGS: readonly Slot[] = [
  principal('quadriceps'),
  principal('posterior'),
  accessory('gluteos'),
  accessory('quadriceps'),
  accessory('panturrilha'),
  accessory('abdomen'),
];

const VARIANT_LETTERS = ['A', 'B', 'C'] as const;

const letterFor = (variant: number): string => VARIANT_LETTERS[variant] ?? String(variant + 1);

export const chooseSplit = (days: TrainingDays): SplitKind => {
  switch (days) {
    case 2:
    case 3:
      return 'full_body';
    case 4:
      return 'superior_inferior';
    case 5:
    case 6:
      return 'push_pull_legs';
    default:
      return assertNever(days);
  }
};

type Rotation = readonly { key: string; title: string; slots: readonly Slot[] }[];

const rotationFor = (split: SplitKind): Rotation => {
  switch (split) {
    case 'full_body':
      return [{ key: 'full', title: 'Full body', slots: FULL_BODY }];
    case 'superior_inferior':
      return [
        { key: 'upper', title: 'Superior', slots: UPPER },
        { key: 'lower', title: 'Inferior', slots: LOWER },
      ];
    case 'push_pull_legs':
      return [
        { key: 'push', title: 'Push (empurrar)', slots: PUSH },
        { key: 'pull', title: 'Pull (puxar)', slots: PULL },
        { key: 'legs', title: 'Pernas', slots: LEGS },
      ];
    default:
      return assertNever(split);
  }
};

/** Uma sessão por dia de treino, alternando os modelos da divisão. */
export const buildSessionTemplates = (days: TrainingDays): SessionTemplate[] => {
  const rotation = rotationFor(chooseSplit(days));
  return Array.from({ length: days }, (_, dayIndex) => {
    const model = rotation[dayIndex % rotation.length];
    if (!model) throw new Error('Rotação de treino vazia');
    const variant = Math.floor(dayIndex / rotation.length);
    const letter = letterFor(variant);
    return { id: `${model.key}-${letter}`, title: `${model.title} ${letter}`, slots: model.slots, variant };
  });
};
