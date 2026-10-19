import { describe, expect, it } from 'vitest';
import { inferMovementPattern } from '../movement';

describe('inferMovementPattern', () => {
  it.each([
    ['barbell bench press', 'peito', 'supino'],
    ['Dumbbell Incline Bench Press', 'peito', 'supino'],
    ['dumbbell fly', 'peito', 'crucifixo'],
    ['push-up', 'peito', 'flexao'],
    ['chest dip', 'peito', 'flexao'],
    ['dumbbell arnold press', 'ombros', 'desenvolvimento'],
    ['dumbbell lateral raise', 'ombros', 'elevacao'],
    ['barbell upright row', 'ombros', 'elevacao'],
    ['dumbbell rear fly', 'ombros', 'remada'],
    ['barbell bent over row', 'costas', 'remada'],
    ['cable pulldown', 'costas', 'puxada'],
    ['Pull-Up (Neutral Grip)', 'costas', 'puxada'],
    ['dumbbell hammer curl', 'biceps', 'rosca'],
    ['cable pushdown', 'triceps', 'triceps'],
    ['barbell lying triceps extension', 'triceps', 'triceps'],
    ['triceps dip', 'triceps', 'triceps'],
    ['barbell full squat', 'quadriceps', 'agachamento'],
    ['dumbbell lunge', 'quadriceps', 'afundo'],
    ['barbell split squat', 'quadriceps', 'afundo'],
    ['sled 45° leg press', 'gluteos', 'leg_press'],
    ['Machine Leg Extension', 'quadriceps', 'extensora'],
    ['Machine Lying Leg Curl', 'posterior', 'flexora'],
    ['barbell romanian deadlift', 'posterior', 'terra'],
    ['barbell hip thrust', 'gluteos', 'elevacao_pelvica'],
    ['lever standing calf raise', 'panturrilha', 'panturrilha'],
    ['crunch floor', 'abdomen', 'abdominal'],
    ['front plank', 'abdomen', 'prancha'],
  ] as const)('%s → %s', (name, target, expected) => {
    expect(inferMovementPattern(name, target)).toBe(expected);
  });

  it('"leg curl" é flexora, não rosca; "calf raise" é panturrilha, não elevação', () => {
    expect(inferMovementPattern('seated leg curl', 'posterior')).toBe('flexora');
    expect(inferMovementPattern('dumbbell standing calf raise', 'panturrilha')).toBe('panturrilha');
  });

  it('sem termo conhecido, usa o movimento típico do músculo', () => {
    expect(inferMovementPattern('kick out sit', 'posterior')).toBe('terra');
    expect(inferMovementPattern('mystery move', 'biceps')).toBe('rosca');
  });
});
