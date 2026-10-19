import { assertNever, type Goal, type Level, type Prescription, type SlotRole } from '@fitpro/core-types';

type Scheme = { repsRange: readonly [number, number]; restSeconds: number; rpe: number };

/** Faixas por objetivo. Força usa 3–6 reps só no principal; acessórios ficam em 6–10. */
const schemeFor = (goal: Goal, role: SlotRole): Scheme => {
  switch (goal) {
    case 'forca':
      return role === 'principal'
        ? { repsRange: [3, 6], restSeconds: 150, rpe: 8 }
        : { repsRange: [6, 10], restSeconds: 90, rpe: 8 };
    case 'hipertrofia':
      return { repsRange: [6, 12], restSeconds: role === 'principal' ? 90 : 60, rpe: 8 };
    case 'resistencia':
      return { repsRange: [12, 20], restSeconds: role === 'principal' ? 60 : 30, rpe: 7 };
    case 'emagrecimento':
      return { repsRange: [10, 15], restSeconds: 45, rpe: 7 };
    case 'saude':
      return { repsRange: [8, 12], restSeconds: 60, rpe: 6 };
    default:
      return assertNever(goal);
  }
};

const BASE_SETS: Record<SlotRole, number> = { principal: 4, acessorio: 3 };
const MIN_SETS = 2;
const MIN_RPE = 5;

const setsFor = (goal: Goal, level: Level, role: SlotRole): number => {
  const base = BASE_SETS[role] + (goal === 'forca' && role === 'principal' ? 1 : 0);
  switch (level) {
    case 'iniciante':
      return Math.max(MIN_SETS, base - 1);
    case 'intermediario':
      return base;
    case 'avancado':
      return role === 'principal' ? base + 1 : base;
    default:
      return assertNever(level);
  }
};

export type PrescribeArgs = { exerciseId: string; goal: Goal; level: Level; role: SlotRole };

export const prescribe = ({ exerciseId, goal, level, role }: PrescribeArgs): Prescription => {
  const scheme = schemeFor(goal, role);
  return {
    exerciseId,
    sets: setsFor(goal, level, role),
    repsRange: scheme.repsRange,
    restSeconds: scheme.restSeconds,
    rpe: level === 'iniciante' ? Math.max(MIN_RPE, scheme.rpe - 1) : scheme.rpe,
  };
};

const WORK_SECONDS_PER_SET = 40;
const SETUP_MINUTES_PER_EXERCISE = 1;

export const estimateMinutes = (prescription: Prescription): number =>
  (prescription.sets * (WORK_SECONDS_PER_SET + prescription.restSeconds)) / 60 + SETUP_MINUTES_PER_EXERCISE;
