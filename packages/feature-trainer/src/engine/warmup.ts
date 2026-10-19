import type { Exercise, ExerciseEquipment, SlotRole } from '@fitpro/core-types';

export type WarmupSet = { loadKg: number; reps: number };

/** Abaixo disso a própria primeira série já serve de aquecimento. */
const MIN_WORKING_LOAD_KG = 20;
const HEAVY_WORKING_LOAD_KG = 60;
const EMPTY_BARBELL_KG = 20;

/** Rampa clássica: volume alto e carga leve, depois menos reps e mais carga. */
const RAMP: readonly { percent: number; reps: number }[] = [
  { percent: 0.5, reps: 10 },
  { percent: 0.7, reps: 5 },
];
const HEAVY_STEP = { percent: 0.85, reps: 2 };

const LOAD_STEP_KG: Partial<Record<ExerciseEquipment, number>> = {
  barra: 2.5,
  maquina: 2.5,
  cabo: 2.5,
  halteres: 1,
  kettlebell: 2,
};

const roundTo = (kg: number, step: number): number => Math.round(kg / step) * step;

export type WarmupArgs = { exercise: Exercise; role: SlotRole; workingLoadKg: number | undefined };

/**
 * Séries de aquecimento só para o composto principal com carga relevante.
 * Acessórios e exercícios de peso corporal começam direto nas séries válidas.
 */
export const warmupSets = ({ exercise, role, workingLoadKg }: WarmupArgs): WarmupSet[] => {
  const step = LOAD_STEP_KG[exercise.equipment];
  if (role !== 'principal' || exercise.mechanics !== 'composto' || !step) return [];
  if (workingLoadKg === undefined || workingLoadKg < MIN_WORKING_LOAD_KG) return [];

  const ramp = workingLoadKg >= HEAVY_WORKING_LOAD_KG ? [...RAMP, HEAVY_STEP] : RAMP;
  const floor = exercise.equipment === 'barra' ? EMPTY_BARBELL_KG : step;
  return ramp.map(({ percent, reps }) => ({
    loadKg: Math.max(floor, roundTo(workingLoadKg * percent, step)),
    reps,
  }));
};
