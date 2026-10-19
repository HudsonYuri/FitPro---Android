import type { Exercise, MuscleGroup } from '@fitpro/core-types';

/**
 * O catálogo real traz dezenas de variações por músculo ("wide reverse-grip bench press",
 * "squat on knees"…). Um personal começa pelos movimentos clássicos; variações exóticas
 * só entram quando os clássicos não servem (equipamento, nível, restrição).
 */
const STAPLES: Record<MuscleGroup, readonly string[]> = {
  peito: ['bench press', 'chest press', 'push-up', 'push up', 'fly', 'cable crossover', 'dip'],
  costas: ['pulldown', 'pull-up', 'chin-up', 'row'],
  ombros: ['overhead press', 'shoulder press', 'military press', 'arnold press', 'lateral raise', 'rear fly', 'face pull'],
  biceps: ['curl'],
  triceps: ['pushdown', 'triceps extension', 'skull crusher', 'close-grip bench press', 'dip', 'kickback'],
  quadriceps: ['squat', 'leg press', 'lunge', 'split squat', 'step-up', 'leg extension'],
  posterior: ['deadlift', 'leg curl', 'good morning'],
  gluteos: ['hip thrust', 'glute bridge', 'lunge', 'split squat', 'step-up', 'hip extension', 'squat'],
  panturrilha: ['calf raise'],
  abdomen: ['crunch', 'plank', 'leg raise', 'sit-up', 'rollout'],
};

/** Palavras que denunciam variação incomum, combinação de movimentos ou pegada exótica. */
const VARIATION_PATTERNS = [
  'reverse',
  'wide',
  'twist',
  'with',
  'and',
  'on knees',
  'kneeling',
  'decline',
  'iron cross',
  'bradford',
  'rocky',
  'bowling',
  'zercher',
  'guillotine',
  'jefferson',
  'sissy',
  'side bend',
  'shrug',
  'jerk',
  'snatch',
  'clean',
] as const;

const LONG_NAME_WORDS = 5;

const matches = (name: string, pattern: string): boolean => new RegExp(`\\b${pattern}\\b`).test(name);

/** Quanto o exercício é um "clássico de academia". Maior é mais familiar. */
export const familiarityScore = (exercise: Exercise): number => {
  const name = exercise.originalName.toLowerCase();
  // Clássico para o músculo-alvo: "curl" conta para bíceps, não para lombar.
  const staple = STAPLES[exercise.target].some((pattern) => matches(name, pattern)) ? 3 : 0;
  const variations = VARIATION_PATTERNS.filter((pattern) => matches(name, pattern)).length;
  const longName = name.split(/\s+/).length > LONG_NAME_WORDS ? 1 : 0;
  return staple - variations * 1.5 - longName;
};

/** Mesmo nome com IDs diferentes acontece no catálogo; para o usuário é o mesmo exercício. */
export const nameKey = (exercise: Exercise): string => exercise.originalName.trim().toLowerCase();
