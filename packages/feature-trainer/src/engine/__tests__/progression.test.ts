import { describe, expect, it } from 'vitest';
import type { Prescription } from '@fitpro/core-types';
import { suggestProgression, type ExercisePerformance } from '../progression';
import { byId } from './fixtures';

const PRESCRIPTION: Prescription = { exerciseId: 'bench', sets: 3, repsRange: [6, 12], restSeconds: 90, rpe: 8 };

const session = (loadKg: number, reps: readonly number[]): ExercisePerformance => ({
  finishedAt: 0,
  sets: reps.map((count) => ({ loadKg, reps: count })),
});

const suggest = (exerciseId: string, history: ExercisePerformance[]) =>
  suggestProgression({ exercise: byId(exerciseId), prescription: PRESCRIPTION, history });

describe('suggestProgression', () => {
  it('sem histórico, orienta a escolher a carga inicial', () => {
    expect(suggest('bench', []).kind).toBe('sem_historico');
  });

  it('topo da faixa em 2 sessões seguidas → aumenta 5% em composto', () => {
    const result = suggest('bench', [session(100, [12, 12, 12]), session(100, [12, 12, 12])]);
    expect(result).toMatchObject({ kind: 'aumentar', fromKg: 100, toKg: 105, percent: 0.05 });
  });

  it('isolado de membro superior → aumenta 2,5%', () => {
    const result = suggest('db-fly', [session(20, [12, 12, 12]), session(20, [12, 12, 12])]);
    expect(result).toMatchObject({ kind: 'aumentar', toKg: 20.5, percent: 0.025 });
  });

  it('o aumento nunca é menor que meio quilo', () => {
    const result = suggest('db-fly', [session(4, [12, 12, 12]), session(4, [12, 12, 12])]);
    expect(result).toMatchObject({ kind: 'aumentar', toKg: 4.5 });
  });

  it('só uma sessão no topo não basta', () => {
    expect(suggest('bench', [session(100, [12, 12, 12]), session(100, [12, 10, 9])]).kind).toBe('manter');
  });

  it('séries a menos que o prescrito não contam como topo', () => {
    expect(suggest('bench', [session(100, [12, 12]), session(100, [12, 12])]).kind).toBe('manter');
  });

  it('falhou 2 vezes seguidas → mantém a carga', () => {
    const result = suggest('bench', [session(100, [6, 5, 4]), session(100, [6, 5, 5])]);
    expect(result.kind).toBe('manter');
    expect(result.message).toMatch(/técnica/);
  });

  it('falhou 3 vezes seguidas → reduz 10%', () => {
    const result = suggest('bench', [session(100, [5, 4, 4]), session(100, [6, 5, 4]), session(100, [6, 5, 5])]);
    expect(result).toMatchObject({ kind: 'reduzir', fromKg: 100, toKg: 90 });
  });

  it('peso corporal no topo → sugere variação mais difícil', () => {
    const result = suggest('push-up', [session(0, [12, 12, 12]), session(0, [12, 12, 12])]);
    expect(result.kind).toBe('manter');
    expect(result.message).toMatch(/variação/);
  });
});
