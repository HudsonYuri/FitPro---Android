import type {
  Equipment,
  ExerciseEquipment,
  Goal,
  Level,
  MovementPattern,
  MuscleGroup,
  Restriction,
  SplitKind,
} from './domain';

export const GOALS = ['hipertrofia', 'emagrecimento', 'forca', 'resistencia', 'saude'] as const satisfies readonly Goal[];
export const LEVELS = ['iniciante', 'intermediario', 'avancado'] as const satisfies readonly Level[];
export const EQUIPMENTS = ['academia_completa', 'halteres', 'peso_corporal', 'elastico'] as const satisfies readonly Equipment[];
export const RESTRICTIONS = ['joelho', 'lombar', 'ombro', 'punho'] as const satisfies readonly Restriction[];
export const MUSCLE_GROUPS = [
  'peito',
  'costas',
  'ombros',
  'biceps',
  'triceps',
  'quadriceps',
  'posterior',
  'gluteos',
  'panturrilha',
  'abdomen',
] as const satisfies readonly MuscleGroup[];
export const EXERCISE_EQUIPMENTS = [
  'barra',
  'halteres',
  'maquina',
  'cabo',
  'kettlebell',
  'elastico',
  'peso_corporal',
  'outro',
] as const satisfies readonly ExerciseEquipment[];

export const MOVEMENT_PATTERNS = [
  'supino',
  'crucifixo',
  'flexao',
  'desenvolvimento',
  'elevacao',
  'remada',
  'puxada',
  'rosca',
  'triceps',
  'agachamento',
  'afundo',
  'terra',
  'elevacao_pelvica',
  'leg_press',
  'extensora',
  'flexora',
  'panturrilha',
  'abdominal',
  'prancha',
] as const satisfies readonly MovementPattern[];

export const GOAL_LABEL: Record<Goal, string> = {
  hipertrofia: 'Hipertrofia',
  emagrecimento: 'Emagrecimento',
  forca: 'Força',
  resistencia: 'Resistência',
  saude: 'Saúde e bem-estar',
};

export const LEVEL_LABEL: Record<Level, string> = {
  iniciante: 'Iniciante',
  intermediario: 'Intermediário',
  avancado: 'Avançado',
};

export const EQUIPMENT_LABEL: Record<Equipment, string> = {
  academia_completa: 'Academia completa',
  halteres: 'Halteres',
  peso_corporal: 'Peso corporal',
  elastico: 'Elástico',
};

export const EXERCISE_EQUIPMENT_LABEL: Record<ExerciseEquipment, string> = {
  barra: 'Barra',
  halteres: 'Halteres',
  maquina: 'Máquina',
  cabo: 'Cabo / polia',
  kettlebell: 'Kettlebell',
  elastico: 'Elástico',
  peso_corporal: 'Peso corporal',
  outro: 'Outro',
};

export const RESTRICTION_LABEL: Record<Restriction, string> = {
  joelho: 'Joelho',
  lombar: 'Lombar',
  ombro: 'Ombro',
  punho: 'Punho',
};

export const MUSCLE_LABEL: Record<MuscleGroup, string> = {
  peito: 'Peitoral',
  costas: 'Costas',
  ombros: 'Ombros',
  biceps: 'Bíceps',
  triceps: 'Tríceps',
  quadriceps: 'Quadríceps',
  posterior: 'Posterior de coxa',
  gluteos: 'Glúteos',
  panturrilha: 'Panturrilha',
  abdomen: 'Abdômen',
};

export const SPLIT_LABEL: Record<SplitKind, string> = {
  full_body: 'Full body',
  superior_inferior: 'Superior / inferior',
  push_pull_legs: 'Push / pull / legs',
};

export const LEVEL_RANK: Record<Level, number> = {
  iniciante: 0,
  intermediario: 1,
  avancado: 2,
};
