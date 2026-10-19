import type { ExerciseEquipment, Level, Mechanics, MuscleGroup } from '@fitpro/core-types';
import type { ExternalExercise } from './schema';

/**
 * Alvos da ExerciseDB → grupos do app, com o vocabulário das duas fontes
 * (RapidAPI: "quads", "delts"…; API gratuita: "quadriceps", "deltoids"…).
 * Alvos fora da lista (cardio, antebraço, adutores…) ficam de fora.
 */
const TARGET_TO_MUSCLE: Readonly<Record<string, MuscleGroup>> = {
  pectorals: 'peito',
  'latissimus dorsi': 'costas',
  trapezius: 'costas',
  'erector spinae': 'costas',
  deltoids: 'ombros',
  quadriceps: 'quadriceps',
  abdominals: 'abdomen',
  'serratus anterior': 'peito',
  lats: 'costas',
  'upper back': 'costas',
  traps: 'costas',
  spine: 'costas',
  delts: 'ombros',
  biceps: 'biceps',
  triceps: 'triceps',
  quads: 'quadriceps',
  hamstrings: 'posterior',
  glutes: 'gluteos',
  abductors: 'gluteos',
  calves: 'panturrilha',
  abs: 'abdomen',
};

/** Músculos secundários vêm em texto livre e mais variado que os alvos. */
const SECONDARY_TO_MUSCLE: Readonly<Record<string, MuscleGroup>> = {
  ...TARGET_TO_MUSCLE,
  chest: 'peito',
  'upper chest': 'peito',
  back: 'costas',
  'lower back': 'costas',
  rhomboids: 'costas',
  trapezius: 'costas',
  latissimus: 'costas',
  brachialis: 'biceps',
  shoulders: 'ombros',
  deltoids: 'ombros',
  'rear deltoids': 'ombros',
  'rotator cuff': 'ombros',
  calf: 'panturrilha',
  soleus: 'panturrilha',
  core: 'abdomen',
  obliques: 'abdomen',
  abdominals: 'abdomen',
};

const EQUIPMENT_MAP: Readonly<Record<string, ExerciseEquipment>> = {
  barbell: 'barra',
  'ez barbell': 'barra',
  'olympic barbell': 'barra',
  'trap bar': 'barra',
  'smith machine': 'maquina',
  dumbbell: 'halteres',
  'leverage machine': 'maquina',
  'sled machine': 'maquina',
  assisted: 'maquina',
  cable: 'cabo',
  rope: 'cabo',
  kettlebell: 'kettlebell',
  band: 'elastico',
  'resistance band': 'elastico',
  'body weight': 'peso_corporal',
  bodyweight: 'peso_corporal',
  'ez bar': 'barra',
  // "weighted" = colete ou anilha: não é treino só com o peso do corpo.
  weighted: 'outro',
};

const ADVANCED_PATTERNS = ['snatch', 'clean', 'jerk', 'pistol', 'muscle up', 'one arm', 'handstand', 'planche', 'dragon flag'];
const ISOLATION_PATTERNS = ['curl', 'fly', 'raise', 'extension', 'kickback', 'pushdown', 'crunch', 'shrug', 'calf'];

const DIFFICULTY_MAP: Readonly<Record<NonNullable<ExternalExercise['difficulty']>, Level>> = {
  beginner: 'iniciante',
  intermediate: 'intermediario',
  advanced: 'avancado',
};

export const mapTarget = (target: string): MuscleGroup | undefined => TARGET_TO_MUSCLE[target.toLowerCase()];

export const mapEquipment = (equipment: string): ExerciseEquipment => EQUIPMENT_MAP[equipment.toLowerCase()] ?? 'outro';

export const mapSecondary = (muscles: readonly string[], target: MuscleGroup): MuscleGroup[] => {
  const mapped = muscles.flatMap((muscle) => {
    const group = SECONDARY_TO_MUSCLE[muscle.toLowerCase()];
    return group && group !== target ? [group] : [];
  });
  return [...new Set(mapped)];
};

const includesAny = (name: string, patterns: readonly string[]): boolean =>
  patterns.some((pattern) => name.includes(pattern));


/** Alongamentos e mobilidade não entram no treino de força do plano. */
const NON_STRENGTH_PATTERNS = [
  'stretch',
  'pose',
  'yoga',
  'sequence',
  'mobility',
  'massage',
  'foam roll',
  'facing dog',
  'downward dog',
  'cat cow',
  'boxing',
  'punch',
];

export const isStrengthExercise = (name: string): boolean => !includesAny(name.toLowerCase(), NON_STRENGTH_PATTERNS);

/** A ExerciseDB não informa a mecânica; inferimos pelo nome e pelos músculos envolvidos. */
export const inferMechanics = (name: string, secondaryCount: number): Mechanics =>
  includesAny(name.toLowerCase(), ISOLATION_PATTERNS) || secondaryCount < 2 ? 'isolado' : 'composto';

export const inferDifficulty = (external: ExternalExercise, equipment: ExerciseEquipment): Level => {
  if (external.difficulty) return DIFFICULTY_MAP[external.difficulty];
  if (includesAny(external.name.toLowerCase(), ADVANCED_PATTERNS)) return 'avancado';
  return equipment === 'barra' || equipment === 'kettlebell' ? 'intermediario' : 'iniciante';
};
