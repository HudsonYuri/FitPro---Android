import type { Exercise, Prescription } from '@fitpro/core-types';

export type PreviousSet = { loadKg: number; reps: number };

/** Um item do treino já resolvido pelo app: exercício, prescrição e sugestão de carga. */
export type WorkoutExercise = {
  exercise: Exercise;
  prescription: Prescription;
  /** Frase do motor de progressão ("Topo da faixa… suba para 62,5 kg"). */
  progressionMessage: string;
  suggestedLoadKg: number | undefined;
  /** Séries do último treino deste exercício, para a coluna "Anterior". */
  previousSets: readonly PreviousSet[];
  /** Séries de aquecimento sugeridas pelo personal (vazio para acessórios). */
  warmup: readonly PreviousSet[];
};

/** Aquecimento aparece na tabela mas não conta como série, volume nem registro. */
export type SetKind = 'aquecimento' | 'valida';

export type SetRow = { kind: SetKind; loadKg: number; reps: number; done: boolean };

/** Treino em andamento salvo a cada mudança, para sobreviver ao app fechar. */
export type WorkoutDraft = {
  sessionId: string;
  sessionTitle: string;
  startedAt: number;
  exerciseIndex: number;
  exerciseIds: readonly string[];
  rows: readonly (readonly SetRow[])[];
};
