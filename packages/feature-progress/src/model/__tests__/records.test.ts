import { describe, expect, it } from 'vitest';
import type { WorkoutLog } from '@fitpro/core-types';
import { bestOneRepMax, estimateOneRepMax, personalRecords } from '../records';

const log = (finishedAt: number, sets: [exerciseId: string, loadKg: number, reps: number][]): WorkoutLog => ({
  id: String(finishedAt),
  sessionId: 'upper-A',
  sessionTitle: 'Superior A',
  startedAt: finishedAt,
  finishedAt,
  sets: sets.map(([exerciseId, loadKg, reps], setIndex) => ({ exerciseId, setIndex, loadKg, reps })),
});

describe('estimateOneRepMax', () => {
  it('usa Epley e arredonda a 0,5 kg', () => {
    expect(estimateOneRepMax(100, 5)).toBe(116.5);
    expect(estimateOneRepMax(60, 10)).toBe(80);
  });

  it('1 repetição é a própria carga; sem carga ou reps é zero', () => {
    expect(estimateOneRepMax(120, 1)).toBe(120);
    expect(estimateOneRepMax(0, 12)).toBe(0);
    expect(estimateOneRepMax(50, 0)).toBe(0);
  });
});

describe('personalRecords', () => {
  const history = [log(1, [['bench', 60, 10], ['bench', 60, 8]]), log(2, [['row', 50, 10]])];

  it('detecta recorde quando o 1RM estimado supera o histórico', () => {
    const records = personalRecords(log(3, [['bench', 62.5, 10], ['row', 50, 8]]), history);
    expect(records).toEqual([{ exerciseId: 'bench', oneRepMaxKg: 83.5, previousBestKg: 80, loadKg: 62.5, reps: 10 }]);
  });

  it('mais repetições com a mesma carga também é recorde', () => {
    expect(personalRecords(log(3, [['row', 50, 12]]), history).map((record) => record.exerciseId)).toEqual(['row']);
  });

  it('primeira vez num exercício não é recorde', () => {
    expect(personalRecords(log(3, [['squat', 100, 5]]), history)).toEqual([]);
  });

  it('melhor 1RM do histórico', () => {
    expect(bestOneRepMax(history, 'bench')).toBe(80);
    expect(bestOneRepMax(history, 'squat')).toBeUndefined();
  });
});
