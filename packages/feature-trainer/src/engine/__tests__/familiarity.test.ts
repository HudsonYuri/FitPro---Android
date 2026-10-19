import { describe, expect, it } from 'vitest';
import { buildPlan } from '../plan';
import { selectExercise, suggestAlternatives } from '../selection';
import { exercise, profile } from './fixtures';

/** Casos tirados do catálogo real da ExerciseDB gratuita. */
const REAL_WORLD = [
  exercise({ id: 'r1', originalName: 'Barbell Wide Reverse-Grip Bench Press', target: 'peito', equipment: 'barra', mechanics: 'composto' }),
  exercise({ id: 'r2', originalName: 'barbell bench press', target: 'peito', equipment: 'barra', mechanics: 'composto' }),
  exercise({ id: 'r3', originalName: 'Barbell squat (on knees)', target: 'quadriceps', equipment: 'barra', mechanics: 'composto' }),
  exercise({ id: 'r4', originalName: 'barbell full squat', target: 'quadriceps', equipment: 'barra', mechanics: 'composto' }),
  exercise({ id: 'r5', originalName: 'Dumbbell decline shrug', target: 'costas', equipment: 'halteres', mechanics: 'isolado' }),
  exercise({ id: 'r6', originalName: 'Dumbbell decline shrug', target: 'costas', equipment: 'halteres', mechanics: 'isolado' }),
  exercise({ id: 'r7', originalName: 'dumbbell bent over row', target: 'costas', equipment: 'halteres', mechanics: 'composto' }),
  exercise({ id: 'r8', originalName: 'Dumbbell Single-Arm Bent-Over Row', target: 'costas', equipment: 'halteres', mechanics: 'composto' }),
  exercise({ id: 'r9', originalName: 'Barbell incline bench press', target: 'peito', equipment: 'barra', mechanics: 'composto' }),
  exercise({ id: 'r10', originalName: 'Barbell incline bench press', target: 'peito', equipment: 'barra', mechanics: 'composto' }),
];

const pick = (target: 'peito' | 'quadriceps') =>
  selectExercise({ catalog: REAL_WORLD, target, role: 'principal', context: profile(), excludeIds: new Set(), variant: 0 })
    ?.exercise.id;

describe('preferência por movimentos clássicos', () => {
  it('supino reto antes de variações exóticas', () => {
    expect(pick('peito')).toBe('r2');
  });

  it('agachamento livre antes de "squat on knees"', () => {
    expect(pick('quadriceps')).toBe('r4');
  });
});

describe('nomes duplicados no catálogo', () => {
  it('a mesma sessão nunca repete um exercício com o mesmo nome', () => {
    const plan = buildPlan(profile({ daysPerWeek: 5, equipment: ['halteres'] }), REAL_WORLD);
    for (const session of plan.sessions) {
      const names = session.items.map((item) => REAL_WORLD.find((e) => e.id === item.prescription.exerciseId)?.originalName);
      expect(new Set(names).size).toBe(names.length);
    }
  });

  it('as alternativas não repetem nomes nem o próprio exercício', () => {
    const current = REAL_WORLD.find((e) => e.id === 'r2');
    if (!current) throw new Error('fixture');
    const names = suggestAlternatives(current, REAL_WORLD, profile()).map((alternative) => alternative.exercise.originalName);
    expect(new Set(names).size).toBe(names.length);
    expect(names).not.toContain('barbell bench press');
  });
});

describe('clássicos por músculo', () => {
  const lowerBackCurl = exercise({ id: 'lb', originalName: 'Lower back curl', target: 'costas', equipment: 'peso_corporal', mechanics: 'isolado' });
  const row = exercise({ id: 'row', originalName: 'Inverted row', target: 'costas', equipment: 'peso_corporal', mechanics: 'isolado' });

  it('"curl" não conta como clássico de costas', () => {
    const selection = selectExercise({
      catalog: [lowerBackCurl, row],
      target: 'costas',
      role: 'acessorio',
      context: profile({ equipment: ['peso_corporal'] }),
      excludeIds: new Set(),
      variant: 0,
    });
    expect(selection?.exercise.id).toBe('row');
  });

  it('levantamentos olímpicos perdem para o agachamento', () => {
    const jerk = exercise({ id: 'jerk', originalName: 'Squat jerk', target: 'quadriceps', equipment: 'barra', mechanics: 'composto' });
    const squat = exercise({ id: 'sq', originalName: 'barbell squat', target: 'quadriceps', equipment: 'barra', mechanics: 'composto' });
    const selection = selectExercise({ catalog: [jerk, squat], target: 'quadriceps', role: 'principal', context: profile(), excludeIds: new Set(), variant: 0 });
    expect(selection?.exercise.id).toBe('sq');
  });
});
