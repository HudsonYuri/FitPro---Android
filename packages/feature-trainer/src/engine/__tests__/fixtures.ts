import type { Exercise, UserProfile } from '@fitpro/core-types';

type ExerciseSeed = Pick<Exercise, 'id' | 'originalName' | 'target' | 'equipment' | 'mechanics'> & Partial<Exercise>;

export const exercise = (seed: ExerciseSeed): Exercise => ({
  name: seed.originalName,
  gifUrl: `https://example.test/${seed.id}.gif`,
  secondary: [],
  difficulty: 'iniciante',
  pattern: 'supino',
  instructions: [],
  commonMistakes: [],
  ...seed,
});

export const CATALOG: Exercise[] = [
  // Peito
  exercise({ id: 'bench', originalName: 'barbell bench press', target: 'peito', equipment: 'barra', mechanics: 'composto', difficulty: 'intermediario' }),
  exercise({ id: 'db-bench', originalName: 'dumbbell bench press', target: 'peito', equipment: 'halteres', mechanics: 'composto' }),
  exercise({ id: 'chest-dip', originalName: 'chest dip', target: 'peito', equipment: 'peso_corporal', mechanics: 'composto', difficulty: 'intermediario' }),
  exercise({ id: 'push-up', originalName: 'push-up', target: 'peito', equipment: 'peso_corporal', mechanics: 'composto' }),
  exercise({ id: 'db-fly', originalName: 'dumbbell fly', target: 'peito', equipment: 'halteres', mechanics: 'isolado' }),
  exercise({ id: 'cable-cross', originalName: 'cable crossover', target: 'peito', equipment: 'cabo', mechanics: 'isolado' }),
  exercise({ id: 'lever-press', originalName: 'lever chest press', target: 'peito', equipment: 'maquina', mechanics: 'composto' }),
  // Costas
  exercise({ id: 'bb-row', originalName: 'barbell bent over row', target: 'costas', equipment: 'barra', mechanics: 'composto', difficulty: 'intermediario' }),
  exercise({ id: 'db-row', originalName: 'dumbbell one arm row', target: 'costas', equipment: 'halteres', mechanics: 'composto' }),
  exercise({ id: 'pulldown', originalName: 'cable lat pulldown', target: 'costas', equipment: 'cabo', mechanics: 'composto' }),
  exercise({ id: 'band-row', originalName: 'band seated row', target: 'costas', equipment: 'elastico', mechanics: 'composto' }),
  // Ombros
  exercise({ id: 'ohp', originalName: 'barbell overhead press', target: 'ombros', equipment: 'barra', mechanics: 'composto', difficulty: 'intermediario' }),
  exercise({ id: 'behind-neck', originalName: 'barbell behind neck press', target: 'ombros', equipment: 'barra', mechanics: 'composto', difficulty: 'avancado' }),
  exercise({ id: 'upright', originalName: 'barbell upright row', target: 'ombros', equipment: 'barra', mechanics: 'composto' }),
  exercise({ id: 'lateral', originalName: 'dumbbell lateral raise', target: 'ombros', equipment: 'halteres', mechanics: 'isolado' }),
  exercise({ id: 'db-press', originalName: 'dumbbell seated shoulder press', target: 'ombros', equipment: 'halteres', mechanics: 'composto' }),
  // Quadríceps
  exercise({ id: 'squat', originalName: 'barbell full squat', target: 'quadriceps', equipment: 'barra', mechanics: 'composto', difficulty: 'intermediario' }),
  exercise({ id: 'goblet', originalName: 'dumbbell goblet squat', target: 'quadriceps', equipment: 'halteres', mechanics: 'composto' }),
  exercise({ id: 'leg-press', originalName: 'sled 45 leg press', target: 'quadriceps', equipment: 'maquina', mechanics: 'composto' }),
  exercise({ id: 'leg-ext', originalName: 'lever leg extension', target: 'quadriceps', equipment: 'maquina', mechanics: 'isolado' }),
  exercise({ id: 'pistol', originalName: 'pistol squat', target: 'quadriceps', equipment: 'peso_corporal', mechanics: 'composto', difficulty: 'avancado' }),
  exercise({ id: 'bw-squat', originalName: 'bodyweight squat', target: 'quadriceps', equipment: 'peso_corporal', mechanics: 'composto' }),
  // Posterior
  exercise({ id: 'deadlift', originalName: 'barbell deadlift', target: 'posterior', equipment: 'barra', mechanics: 'composto', difficulty: 'intermediario' }),
  exercise({ id: 'good-morning', originalName: 'barbell good morning', target: 'posterior', equipment: 'barra', mechanics: 'composto', difficulty: 'intermediario' }),
  exercise({ id: 'leg-curl', originalName: 'lever lying leg curl', target: 'posterior', equipment: 'maquina', mechanics: 'isolado' }),
  exercise({ id: 'db-rdl', originalName: 'dumbbell romanian deadlift', target: 'posterior', equipment: 'halteres', mechanics: 'composto' }),
  // Glúteos
  exercise({ id: 'hip-thrust', originalName: 'barbell hip thrust', target: 'gluteos', equipment: 'barra', mechanics: 'composto' }),
  exercise({ id: 'glute-bridge', originalName: 'glute bridge', target: 'gluteos', equipment: 'peso_corporal', mechanics: 'isolado' }),
  // Braços
  exercise({ id: 'bb-curl', originalName: 'barbell curl', target: 'biceps', equipment: 'barra', mechanics: 'isolado' }),
  exercise({ id: 'hammer', originalName: 'dumbbell hammer curl', target: 'biceps', equipment: 'halteres', mechanics: 'isolado' }),
  exercise({ id: 'pushdown', originalName: 'cable pushdown', target: 'triceps', equipment: 'cabo', mechanics: 'isolado' }),
  exercise({ id: 'db-ext', originalName: 'dumbbell lying triceps extension', target: 'triceps', equipment: 'halteres', mechanics: 'isolado' }),
  // Outros
  exercise({ id: 'calf', originalName: 'lever standing calf raise', target: 'panturrilha', equipment: 'maquina', mechanics: 'isolado' }),
  exercise({ id: 'crunch', originalName: 'crunch floor', target: 'abdomen', equipment: 'peso_corporal', mechanics: 'isolado' }),
];

export const profile = (overrides: Partial<UserProfile> = {}): UserProfile => ({
  goal: 'hipertrofia',
  level: 'intermediario',
  daysPerWeek: 3,
  minutesPerSession: 90,
  equipment: ['academia_completa'],
  restrictions: [],
  needsMedicalClearance: false,
  ...overrides,
});

export const byId = (id: string): Exercise => {
  const found = CATALOG.find((item) => item.id === id);
  if (!found) throw new Error(`Fixture inexistente: ${id}`);
  return found;
};
