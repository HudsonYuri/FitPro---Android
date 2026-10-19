import { describe, expect, it } from 'vitest';
import type { WorkoutLog } from '@fitpro/core-types';
import { loadHistory, sessionVolumeKg, trainedExerciseIds, trainedWeekdays, trainingStreak } from '../stats';

const NOW = new Date(2026, 9, 14, 18, 0).getTime();
const daysAgo = (days: number): number => NOW - days * 24 * 60 * 60 * 1000;

const log = (finishedAt: number, sets: WorkoutLog['sets'] = []): WorkoutLog => ({
  id: String(finishedAt),
  sessionId: 'full-A',
  sessionTitle: 'Full body A',
  startedAt: finishedAt,
  finishedAt,
  sets,
});

describe('trainingStreak', () => {
  it('conta dias seguidos terminando hoje', () => {
    expect(trainingStreak([log(daysAgo(0)), log(daysAgo(1)), log(daysAgo(2)), log(daysAgo(4))], NOW)).toBe(3);
  });

  it('não zera se o treino de hoje ainda não aconteceu', () => {
    expect(trainingStreak([log(daysAgo(1)), log(daysAgo(2))], NOW)).toBe(2);
  });

  it('zera depois de um dia inteiro sem treino', () => {
    expect(trainingStreak([log(daysAgo(2)), log(daysAgo(3))], NOW)).toBe(0);
  });

  it('dois treinos no mesmo dia contam uma vez', () => {
    expect(trainingStreak([log(daysAgo(0)), log(daysAgo(0) - 1000)], NOW)).toBe(1);
  });
});

describe('trainedWeekdays', () => {
  it('lista os dias da semana atual com treino (NOW é quarta)', () => {
    // 14/10/2026 é quarta-feira: domingo 11 a sábado 17.
    const logs = [log(daysAgo(0)), log(daysAgo(2)), log(daysAgo(2) - 1000), log(daysAgo(4))];
    expect(trainedWeekdays(logs, NOW)).toEqual([1, 3]);
  });
});

describe('loadHistory', () => {
  it('pega a maior carga de cada treino em ordem cronológica', () => {
    const logs = [
      log(daysAgo(0), [
        { exerciseId: 'bench', setIndex: 0, loadKg: 60, reps: 10 },
        { exerciseId: 'bench', setIndex: 1, loadKg: 62.5, reps: 8 },
      ]),
      log(daysAgo(3), [{ exerciseId: 'bench', setIndex: 0, loadKg: 57.5, reps: 10 }]),
      log(daysAgo(5), [{ exerciseId: 'squat', setIndex: 0, loadKg: 80, reps: 5 }]),
    ];
    expect(loadHistory(logs, 'bench').map((point) => point.maxLoadKg)).toEqual([57.5, 62.5]);
    expect(trainedExerciseIds(logs)).toEqual(['bench', 'squat']);
  });
});

describe('sessionVolumeKg', () => {
  it('soma carga × repetições', () => {
    expect(
      sessionVolumeKg(
        log(NOW, [
          { exerciseId: 'a', setIndex: 0, loadKg: 10, reps: 10 },
          { exerciseId: 'a', setIndex: 1, loadKg: 20, reps: 5 },
        ]),
      ),
    ).toBe(200);
  });
});
