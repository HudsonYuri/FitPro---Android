import { describe, expect, it } from 'vitest';
import { buildPlan } from '../plan';
import { prescribe } from '../prescription';
import { selectExercise } from '../selection';
import { buildSessionTemplates, chooseSplit } from '../split';
import { CATALOG, profile } from './fixtures';

const select = (overrides: Parameters<typeof profile>[0], target: Parameters<typeof selectExercise>[0]['target']) =>
  selectExercise({
    catalog: CATALOG,
    target,
    role: 'principal',
    context: profile(overrides),
    excludeIds: new Set(),
    variant: 0,
  });

describe('chooseSplit', () => {
  it.each([
    [2, 'full_body'],
    [3, 'full_body'],
    [4, 'superior_inferior'],
    [5, 'push_pull_legs'],
    [6, 'push_pull_legs'],
  ] as const)('%i dias → %s', (days, split) => {
    expect(chooseSplit(days)).toBe(split);
  });

  it('cria uma sessão por dia, alternando os modelos', () => {
    expect(buildSessionTemplates(4).map((template) => template.id)).toEqual(['upper-A', 'lower-A', 'upper-B', 'lower-B']);
    expect(buildSessionTemplates(5).map((template) => template.id)).toEqual(['push-A', 'pull-A', 'legs-A', 'push-B', 'pull-B']);
  });
});

describe('selectExercise', () => {
  it('prioriza um composto no slot principal', () => {
    expect(select({}, 'peito')?.exercise.mechanics).toBe('composto');
  });

  it('filtra por equipamento disponível', () => {
    const selection = select({ equipment: ['halteres'] }, 'peito');
    expect(selection?.exercise.equipment).toMatch(/halteres|peso_corporal/);
  });

  it('só usa elástico e peso corporal para quem tem elástico', () => {
    expect(select({ equipment: ['elastico'] }, 'costas')?.exercise.id).toBe('band-row');
  });

  it('não sugere exercícios acima do nível do usuário', () => {
    const selection = select({ level: 'iniciante' }, 'quadriceps');
    expect(selection?.exercise.difficulty).toBe('iniciante');
  });

  it('retorna undefined quando nenhum exercício serve', () => {
    expect(select({ equipment: ['peso_corporal'] }, 'panturrilha')).toBeUndefined();
  });

  it('não repete exercício já usado na sessão', () => {
    const first = select({}, 'peito');
    const second = selectExercise({
      catalog: CATALOG,
      target: 'peito',
      role: 'principal',
      context: profile(),
      excludeIds: new Set([first?.exercise.id ?? '']),
      variant: 0,
    });
    expect(second?.exercise.id).not.toBe(first?.exercise.id);
  });

  it('explica cada escolha em uma frase', () => {
    expect(select({}, 'peito')?.reason).toMatch(/^Composto principal para peitoral/);
  });
});

describe('prescribe', () => {
  it('força: 3–6 reps e 2–3 min de descanso no principal', () => {
    const result = prescribe({ exerciseId: 'x', goal: 'forca', level: 'intermediario', role: 'principal' });
    expect(result.repsRange).toEqual([3, 6]);
    expect(result.restSeconds).toBeGreaterThanOrEqual(120);
    expect(result.restSeconds).toBeLessThanOrEqual(180);
  });

  it('hipertrofia: 6–12 reps e 60–90 s', () => {
    const result = prescribe({ exerciseId: 'x', goal: 'hipertrofia', level: 'intermediario', role: 'acessorio' });
    expect(result.repsRange).toEqual([6, 12]);
    expect(result.restSeconds).toBeGreaterThanOrEqual(60);
    expect(result.restSeconds).toBeLessThanOrEqual(90);
  });

  it('resistência: 12–20 reps e 30–60 s', () => {
    const result = prescribe({ exerciseId: 'x', goal: 'resistencia', level: 'intermediario', role: 'principal' });
    expect(result.repsRange).toEqual([12, 20]);
    expect(result.restSeconds).toBeLessThanOrEqual(60);
  });

  it('iniciante começa com menos séries', () => {
    const beginner = prescribe({ exerciseId: 'x', goal: 'hipertrofia', level: 'iniciante', role: 'principal' });
    const intermediate = prescribe({ exerciseId: 'x', goal: 'hipertrofia', level: 'intermediario', role: 'principal' });
    expect(beginner.sets).toBeLessThan(intermediate.sets);
  });
});

describe('buildPlan', () => {
  it('gera uma sessão por dia, com principais antes dos acessórios', () => {
    const plan = buildPlan(profile({ daysPerWeek: 4 }), CATALOG);
    expect(plan.split).toBe('superior_inferior');
    expect(plan.sessions).toHaveLength(4);
    for (const session of plan.sessions) {
      const roles = session.items.map((item) => item.role);
      expect(roles.indexOf('acessorio')).toBeGreaterThan(roles.lastIndexOf('principal'));
    }
  });

  it('respeita o tempo por sessão cortando acessórios', () => {
    const long = buildPlan(profile({ minutesPerSession: 90 }), CATALOG).sessions[0];
    const short = buildPlan(profile({ minutesPerSession: 30 }), CATALOG).sessions[0];
    expect(short?.items.length).toBeLessThan(long?.items.length ?? 0);
    expect(short?.items.filter((item) => item.role === 'principal').length).toBe(
      long?.items.filter((item) => item.role === 'principal').length,
    );
  });

  it('varia os exercícios entre as sessões A e B do mesmo modelo', () => {
    const [upperA, , upperB] = buildPlan(profile({ daysPerWeek: 4 }), CATALOG).sessions;
    const idsA = upperA?.items.map((item) => item.prescription.exerciseId);
    const idsB = upperB?.items.map((item) => item.prescription.exerciseId);
    expect(idsA).not.toEqual(idsB);
  });
});
