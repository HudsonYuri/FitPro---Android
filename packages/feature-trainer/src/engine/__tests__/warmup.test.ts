import { describe, expect, it } from 'vitest';
import { warmupSets } from '../warmup';
import { byId } from './fixtures';

describe('warmupSets', () => {
  it('composto principal com barra: 50% × 10 e 70% × 5, arredondado a 2,5 kg', () => {
    expect(warmupSets({ exercise: byId('bench'), role: 'principal', workingLoadKg: 50 })).toEqual([
      { loadKg: 25, reps: 10 },
      { loadKg: 35, reps: 5 },
    ]);
  });

  it('carga pesada ganha uma terceira série a 85%', () => {
    const sets = warmupSets({ exercise: byId('squat'), role: 'principal', workingLoadKg: 100 });
    expect(sets).toEqual([
      { loadKg: 50, reps: 10 },
      { loadKg: 70, reps: 5 },
      { loadKg: 85, reps: 2 },
    ]);
  });

  it('barra nunca fica abaixo da barra vazia', () => {
    const [first] = warmupSets({ exercise: byId('bench'), role: 'principal', workingLoadKg: 30 });
    expect(first?.loadKg).toBe(20);
  });

  it('halteres arredondam de 1 em 1 kg', () => {
    expect(warmupSets({ exercise: byId('db-bench'), role: 'principal', workingLoadKg: 24 })).toEqual([
      { loadKg: 12, reps: 10 },
      { loadKg: 17, reps: 5 },
    ]);
  });

  it('sem aquecimento para acessórios, isolados, peso corporal ou carga leve', () => {
    expect(warmupSets({ exercise: byId('bench'), role: 'acessorio', workingLoadKg: 60 })).toEqual([]);
    expect(warmupSets({ exercise: byId('db-fly'), role: 'principal', workingLoadKg: 30 })).toEqual([]);
    expect(warmupSets({ exercise: byId('push-up'), role: 'principal', workingLoadKg: 30 })).toEqual([]);
    expect(warmupSets({ exercise: byId('bench'), role: 'principal', workingLoadKg: 15 })).toEqual([]);
    expect(warmupSets({ exercise: byId('bench'), role: 'principal', workingLoadKg: undefined })).toEqual([]);
  });
});
