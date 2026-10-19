export type Goal = 'hipertrofia' | 'emagrecimento' | 'forca' | 'resistencia' | 'saude';

export type Level = 'iniciante' | 'intermediario' | 'avancado';

/** O que o usuário tem à disposição para treinar. */
export type Equipment = 'academia_completa' | 'halteres' | 'peso_corporal' | 'elastico';

/** O implemento que um exercício específico usa. */
export type ExerciseEquipment =
  | 'barra'
  | 'halteres'
  | 'maquina'
  | 'cabo'
  | 'kettlebell'
  | 'elastico'
  | 'peso_corporal'
  | 'outro';

export type MuscleGroup =
  | 'peito'
  | 'costas'
  | 'ombros'
  | 'biceps'
  | 'triceps'
  | 'quadriceps'
  | 'posterior'
  | 'gluteos'
  | 'panturrilha'
  | 'abdomen';

export type Restriction = 'joelho' | 'lombar' | 'ombro' | 'punho';

export type Mechanics = 'composto' | 'isolado';

/** Padrão de movimento: decide a animação do bonequinho que demonstra o exercício. */
export type MovementPattern =
  | 'supino'
  | 'crucifixo'
  | 'flexao'
  | 'desenvolvimento'
  | 'elevacao'
  | 'remada'
  | 'puxada'
  | 'rosca'
  | 'triceps'
  | 'agachamento'
  | 'afundo'
  | 'terra'
  | 'elevacao_pelvica'
  | 'leg_press'
  | 'extensora'
  | 'flexora'
  | 'panturrilha'
  | 'abdominal'
  | 'prancha';

export type Exercise = {
  id: string;
  name: string;
  /** Nome original da fonte, usado pelas regras de contraindicação. */
  originalName: string;
  gifUrl: string;
  target: MuscleGroup;
  secondary: MuscleGroup[];
  equipment: ExerciseEquipment;
  mechanics: Mechanics;
  pattern: MovementPattern;
  difficulty: Level;
  instructions: string[];
  commonMistakes: string[];
};

export type SessionMinutes = 30 | 45 | 60 | 75 | 90;

export type TrainingDays = 2 | 3 | 4 | 5 | 6;

export type UserProfile = {
  goal: Goal;
  level: Level;
  daysPerWeek: TrainingDays;
  minutesPerSession: SessionMinutes;
  equipment: Equipment[];
  restrictions: Restriction[];
  needsMedicalClearance: boolean;
};

export type Prescription = {
  exerciseId: string;
  sets: number;
  repsRange: readonly [min: number, max: number];
  restSeconds: number;
  rpe: number;
};

export type SlotRole = 'principal' | 'acessorio';

export type WorkoutItem = {
  slotId: string;
  target: MuscleGroup;
  role: SlotRole;
  prescription: Prescription;
  reason: string;
};

export type SplitKind = 'full_body' | 'superior_inferior' | 'push_pull_legs';

export type WorkoutSession = {
  id: string;
  title: string;
  items: WorkoutItem[];
};

export type WorkoutPlan = {
  split: SplitKind;
  sessions: WorkoutSession[];
};

export type SetLog = {
  exerciseId: string;
  setIndex: number;
  loadKg: number;
  reps: number;
};

export type WorkoutLog = {
  id: string;
  sessionId: string;
  sessionTitle: string;
  startedAt: number;
  finishedAt: number;
  sets: SetLog[];
};
