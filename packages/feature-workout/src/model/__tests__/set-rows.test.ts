import { describe, expect, it } from 'vitest';
import type { Exercise } from '@fitpro/core-types';
import {
  appendRow,
  countDone,
  countWorking,
  initialRows,
  parseDecimal,
  restoreDraft,
  toSetLogs,
  volumeKg,
} from '../set-rows';
import type { SetRow, WorkoutDraft, WorkoutExercise } from '../types';

const exercise: Exercise = {
  id: 'bench',
  name: 'Supino',
  originalName: 'barbell bench press',
  gifUrl: 'https://example.test/bench.gif',
  target: 'peito',
  secondary: [],
  equipment: 'barra',
  mechanics: 'composto',
  pattern: 'supino',
  difficulty: 'iniciante',
  instructions: [],
  commonMistakes: [],
};

const item = (overrides: Partial<WorkoutExercise> = {}): WorkoutExercise => ({
  exercise,
  prescription: { exerciseId: 'bench', sets: 3, repsRange: [6, 12], restSeconds: 90, rpe: 8 },
  progressionMessage: '',
  suggestedLoadKg: undefined,
  previousSets: [],
  warmup: [],
  ...overrides,
});

const valid = (loadKg: number, reps: number, done: boolean): SetRow => ({ kind: 'valida', loadKg, reps, done });

describe('initialRows', () => {
  it('uma linha por série, com o topo da faixa de reps', () => {
    const rows = initialRows(item({ suggestedLoadKg: 60 }));
    expect(rows).toHaveLength(3);
    expect(rows[0]).toEqual(valid(60, 12, false));
  });

  it('sem sugestão, usa a carga do treino anterior', () => {
    const rows = initialRows(item({ previousSets: [{ loadKg: 50, reps: 10 }, { loadKg: 52.5, reps: 8 }] }));
    expect(rows.map((row) => row.loadKg)).toEqual([50, 52.5, 10]);
  });

  it('aquecimento vem antes das séries válidas', () => {
    const rows = initialRows(item({ suggestedLoadKg: 60, warmup: [{ loadKg: 30, reps: 10 }] }));
    expect(rows.map((row) => row.kind)).toEqual(['aquecimento', 'valida', 'valida', 'valida']);
  });
});

describe('tabela de séries', () => {
  it('adicionar série copia a última linha', () => {
    expect(appendRow([valid(40, 8, true)]).at(-1)).toEqual(valid(40, 8, false));
  });

  it('volume e registros contam só séries válidas feitas', () => {
    const rows = [[{ kind: 'aquecimento', loadKg: 20, reps: 10, done: true } as const, valid(50, 10, true), valid(50, 8, false), valid(55, 6, true)]];
    expect(countDone(rows)).toBe(2);
    expect(countWorking(rows)).toBe(3);
    expect(volumeKg(rows)).toBe(830);
    expect(toSetLogs([item()], rows).map((set) => [set.setIndex, set.loadKg])).toEqual([
      [0, 50],
      [1, 55],
    ]);
  });

  it('aceita vírgula decimal e ignora entrada inválida', () => {
    expect(parseDecimal('62,5', 0)).toBe(62.5);
    expect(parseDecimal('abc', 40)).toBe(40);
    expect(parseDecimal('-3', 40)).toBe(40);
  });
});

describe('restoreDraft', () => {
  const draft: WorkoutDraft = {
    sessionId: 'upper-A',
    sessionTitle: 'Superior A',
    startedAt: 1,
    exerciseIndex: 0,
    exerciseIds: ['bench'],
    rows: [[valid(50, 10, true)]],
  };

  it('retoma a mesma sessão com os mesmos exercícios', () => {
    expect(restoreDraft(draft, 'upper-A', [item()])).toBe(draft);
  });

  it('descarta se a sessão ou os exercícios mudaram', () => {
    expect(restoreDraft(draft, 'lower-A', [item()])).toBeUndefined();
    expect(restoreDraft(draft, 'upper-A', [item({ exercise: { ...exercise, id: 'outro' } })])).toBeUndefined();
    expect(restoreDraft(undefined, 'upper-A', [item()])).toBeUndefined();
  });
});
