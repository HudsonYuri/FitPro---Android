import type { Equipment, ExerciseEquipment } from '@fitpro/core-types';

const EQUIPMENT_GRANTS: Record<Equipment, readonly ExerciseEquipment[]> = {
  academia_completa: ['barra', 'halteres', 'maquina', 'cabo', 'kettlebell', 'elastico', 'peso_corporal'],
  halteres: ['halteres', 'peso_corporal'],
  peso_corporal: ['peso_corporal'],
  elastico: ['elastico', 'peso_corporal'],
};

export const allowedExerciseEquipment = (available: readonly Equipment[]): ReadonlySet<ExerciseEquipment> =>
  new Set(available.flatMap((equipment) => EQUIPMENT_GRANTS[equipment]));
