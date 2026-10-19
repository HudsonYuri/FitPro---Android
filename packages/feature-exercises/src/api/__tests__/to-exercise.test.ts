import { describe, expect, it } from 'vitest';
import { parseCachedCatalog, parseExternalCatalog } from '../to-exercise';

const BENCH = {
  id: '0025',
  name: 'barbell bench press',
  bodyPart: 'chest',
  target: 'pectorals',
  equipment: 'barbell',
  gifUrl: 'https://api.example.test/gifs/0025',
  secondaryMuscles: ['triceps', 'shoulders'],
  instructions: ['Lie flat on a bench.'],
};

describe('parseExternalCatalog', () => {
  it('converte para o tipo interno e traduz exercícios conhecidos', () => {
    const { exercises } = parseExternalCatalog([BENCH]);
    expect(exercises[0]).toMatchObject({
      id: '0025',
      name: 'Supino reto com barra',
      originalName: 'barbell bench press',
      target: 'peito',
      secondary: ['triceps', 'ombros'],
      equipment: 'barra',
      mechanics: 'composto',
      difficulty: 'intermediario',
    });
    expect(exercises[0]?.instructions[0]).toMatch(/Deite no banco/);
  });

  it('mantém o texto original quando não há tradução', () => {
    const { exercises } = parseExternalCatalog([{ ...BENCH, id: '9999', name: 'weird cable thing' }]);
    expect(exercises[0]?.name).toBe('Weird cable thing');
    expect(exercises[0]?.instructions).toEqual(['Lie flat on a bench.']);
    expect(exercises[0]?.commonMistakes.length).toBeGreaterThan(0);
  });

  it('descarta itens inválidos sem derrubar o catálogo', () => {
    const { exercises, rejected } = parseExternalCatalog([BENCH, { id: 1 }, { ...BENCH, id: '2', gifUrl: 'não-é-url' }]);
    expect(exercises).toHaveLength(1);
    expect(rejected).toBe(2);
  });

  it('descarta alvos que o app não usa (cardio, antebraço)', () => {
    const { exercises } = parseExternalCatalog([{ ...BENCH, target: 'cardiovascular system' }]);
    expect(exercises).toHaveLength(0);
  });

  it('rejeita respostas que não são lista', () => {
    expect(() => parseExternalCatalog({ message: 'quota' })).toThrow();
  });

  it('o cache local é revalidado na leitura', () => {
    const { exercises } = parseExternalCatalog([BENCH]);
    expect(parseCachedCatalog([...exercises, { id: 'antigo' }])).toHaveLength(1);
  });

  it('aceita o vocabulário da API gratuita (deltoids, latissimus dorsi, bodyweight)', () => {
    const { exercises } = parseExternalCatalog([
      { ...BENCH, id: 'a', name: 'dumbbell lateral raise', target: 'deltoids', equipment: 'dumbbell' },
      { ...BENCH, id: 'b', name: 'Pull-Up (Neutral Grip)', target: 'latissimus dorsi', equipment: 'bodyweight' },
      { ...BENCH, id: 'c', name: 'crunch floor', target: 'abdominals', equipment: 'bodyweight' },
    ]);
    expect(exercises.map((exercise) => [exercise.target, exercise.equipment])).toEqual([
      ['ombros', 'halteres'],
      ['costas', 'peso_corporal'],
      ['abdomen', 'peso_corporal'],
    ]);
  });

  it('traduz pelo nome alternativo da API gratuita', () => {
    const { exercises } = parseExternalCatalog([{ ...BENCH, name: 'Machine Leg Extension', target: 'quadriceps', equipment: 'leverage machine' }]);
    expect(exercises[0]?.name).toBe('Cadeira extensora');
  });

  it('descarta alongamentos, mobilidade e golpes de boxe', () => {
    const { exercises } = parseExternalCatalog([
      { ...BENCH, id: 's1', name: 'Seated glute stretch', target: 'glutes' },
      { ...BENCH, id: 's2', name: 'upward facing dog', target: 'erector spinae', equipment: 'bodyweight' },
      { ...BENCH, id: 's3', name: 'Seated wide angle pose sequence', target: 'hamstrings' },
      { ...BENCH, id: 's4', name: 'Left hook (boxing)', target: 'abdominals', equipment: 'bodyweight' },
    ]);
    expect(exercises).toHaveLength(0);
  });
});
