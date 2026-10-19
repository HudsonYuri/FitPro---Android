import type { Exercise, Restriction } from '@fitpro/core-types';

type RestrictionRule = {
  /** Padrões de nome que carregam a articulação de forma arriscada. */
  avoid: readonly string[];
  /** Padrões de nome que trabalham o músculo com a articulação protegida. */
  prefer: readonly string[];
  /** Como a articulação aparece numa frase ("sem sobrecarregar o ombro"). */
  phrase: string;
};

export const RESTRICTION_RULES: Record<Restriction, RestrictionRule> = {
  lombar: {
    avoid: ['deadlift', 'good morning', 'barbell bent over row', 'jefferson', 'barbell full squat'],
    prefer: ['hip thrust', 'glute bridge', 'lever', 'leverage', 'machine', 'seated', 'chest supported', 'lying'],
    phrase: 'a lombar',
  },
  joelho: {
    avoid: ['full squat', 'deep squat', 'pistol', 'sissy', 'jump', 'barbell lunge', 'jump squat'],
    prefer: ['box squat', 'hip thrust', 'glute bridge', 'leg curl', 'romanian', 'step-up'],
    phrase: 'o joelho',
  },
  ombro: {
    avoid: ['behind neck', 'behind the neck', 'upright row', 'dip', 'dips', 'snatch', 'decline bench press'],
    prefer: ['neutral grip', 'parallel grip', 'dumbbell', 'cable', 'landmine', 'floor press', 'lever', 'machine'],
    phrase: 'o ombro',
  },
  punho: {
    avoid: ['front squat', 'push-up', 'push up', 'barbell curl', 'clean', 'wrist'],
    prefer: ['hammer', 'dumbbell', 'cable', 'lever', 'machine'],
    phrase: 'o punho',
  },
};

const matchesAny = (exercise: Exercise, patterns: readonly string[]): boolean => {
  const name = exercise.originalName.toLowerCase();
  return patterns.some((pattern) => new RegExp(`\\b${pattern}\\b`).test(name));
};

/** Primeira restrição do usuário que contraindica o exercício, se houver. */
export const findContraindication = (exercise: Exercise, restrictions: readonly Restriction[]): Restriction | undefined =>
  restrictions.find((restriction) => matchesAny(exercise, RESTRICTION_RULES[restriction].avoid));

export const isSafeFor = (exercise: Exercise, restrictions: readonly Restriction[]): boolean =>
  findContraindication(exercise, restrictions) === undefined;

/** Restrições para as quais o exercício é uma escolha especialmente protetora. */
export const protectiveFor = (exercise: Exercise, restrictions: readonly Restriction[]): Restriction[] =>
  restrictions.filter((restriction) => matchesAny(exercise, RESTRICTION_RULES[restriction].prefer));
