import { describe, expect, it } from 'vitest';
import { buildPlan } from '../plan';
import { findContraindication } from '../restrictions';
import { selectExercise, suggestAlternatives } from '../selection';
import { CATALOG, byId, profile } from './fixtures';

const planIds = (overrides: Parameters<typeof profile>[0]): string[] =>
  buildPlan(profile(overrides), CATALOG).sessions.flatMap((session) =>
    session.items.map((item) => item.prescription.exerciseId),
  );

describe('restrições', () => {
  it('lombar: nunca prescreve terra convencional nem good morning', () => {
    const ids = planIds({ restrictions: ['lombar'], daysPerWeek: 4 });
    expect(ids).not.toContain('deadlift');
    expect(ids).not.toContain('good-morning');
  });

  it('lombar: troca o terra por uma opção apoiada e explica a substituição', () => {
    const selection = selectExercise({
      catalog: CATALOG,
      target: 'posterior',
      role: 'principal',
      context: profile({ restrictions: ['lombar'] }),
      excludeIds: new Set(),
      variant: 0,
    });
    expect(selection?.exercise.id).not.toBe('deadlift');
    expect(selection?.reason).toMatch(/Substitui .* a lombar/);
  });

  it('lombar: prefere hip thrust como composto de glúteos', () => {
    const selection = selectExercise({
      catalog: CATALOG,
      target: 'gluteos',
      role: 'principal',
      context: profile({ restrictions: ['lombar'] }),
      excludeIds: new Set(),
      variant: 0,
    });
    expect(selection?.exercise.id).toBe('hip-thrust');
  });

  it('joelho: evita agachamento profundo com carga', () => {
    const ids = planIds({ restrictions: ['joelho'], level: 'avancado' });
    expect(ids).not.toContain('squat');
    expect(ids).not.toContain('pistol');
  });

  it('ombro: evita desenvolvimento por trás da nuca, remada alta e paralelas', () => {
    expect(findContraindication(byId('behind-neck'), ['ombro'])).toBe('ombro');
    expect(findContraindication(byId('upright'), ['ombro'])).toBe('ombro');
    expect(findContraindication(byId('chest-dip'), ['ombro'])).toBe('ombro');
    expect(findContraindication(byId('db-bench'), ['ombro'])).toBeUndefined();
  });

  it('justifica a escolha citando a articulação protegida', () => {
    const selection = selectExercise({
      catalog: CATALOG,
      target: 'peito',
      role: 'principal',
      context: profile({ restrictions: ['ombro'] }),
      excludeIds: new Set(),
      variant: 0,
    });
    expect(selection?.reason).toContain('sem sobrecarregar o ombro');
  });
});

describe('suggestAlternatives', () => {
  it('sugere 3 alternativas para o mesmo músculo-alvo', () => {
    const alternatives = suggestAlternatives(byId('bench'), CATALOG, profile());
    expect(alternatives).toHaveLength(3);
    expect(alternatives.every((alternative) => alternative.exercise.target === 'peito')).toBe(true);
    expect(alternatives.map((alternative) => alternative.exercise.id)).not.toContain('bench');
  });

  it('prioriza o mesmo equipamento', () => {
    const [first] = suggestAlternatives(byId('db-fly'), CATALOG, profile());
    expect(first?.exercise.equipment).toBe('halteres');
    expect(first?.reason).toMatch(/mesmo equipamento/);
  });

  it('não sugere exercícios contraindicados nem fora do equipamento', () => {
    const alternatives = suggestAlternatives(byId('db-bench'), CATALOG, profile({ restrictions: ['ombro', 'punho'], equipment: ['halteres'] }));
    const ids = alternatives.map((alternative) => alternative.exercise.id);
    expect(ids).not.toContain('chest-dip');
    expect(ids).not.toContain('push-up');
    expect(ids).not.toContain('bench');
  });
});

describe('motivo da escolha', () => {
  it('não diz "trabalhar ombros sem sobrecarregar o ombro"', () => {
    const selection = selectExercise({
      catalog: CATALOG,
      target: 'ombros',
      role: 'principal',
      context: profile({ restrictions: ['ombro'] }),
      excludeIds: new Set(),
      variant: 0,
    });
    expect(selection?.reason).not.toMatch(/ombros sem sobrecarregar o ombro/);
    expect(selection?.reason).toMatch(/poupa o ombro/);
  });
});
