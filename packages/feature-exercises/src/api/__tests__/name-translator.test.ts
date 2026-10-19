import { describe, expect, it } from 'vitest';
import { composePortugueseName } from '../name-translator';

describe('composePortugueseName', () => {
  it.each([
    ['barbell incline bench press', 'peito', 'Supino inclinado com barra'],
    ['barbell bench press', 'peito', 'Supino reto com barra'],
    ['Machine Chest Press', 'peito', 'Supino reto na máquina'],
    ['Machine Narrow Grip Seated Row', 'costas', 'Remada pegada fechada sentada na máquina'],
    ['Machine Single-Arm Bent Over Row', 'costas', 'Remada curvada unilateral na máquina'],
    ['dumbbell arnold press', 'ombros', 'Desenvolvimento Arnold com halteres'],
    ['dumbbell seated lateral raise', 'ombros', 'Elevação lateral sentada com halteres'],
    ['barbell lying triceps extension', 'triceps', 'Tríceps testa com barra'],
    ['dumbbell kickback', 'triceps', 'Tríceps coice com halteres'],
    ['Machine Preacher Curl', 'biceps', 'Rosca Scott na máquina'],
    ['band underhand pulldown', 'costas', 'Puxada pegada supinada com elástico'],
    ['Band Leg Extension', 'quadriceps', 'Extensão de pernas com elástico'],
    ['Barbell Straight-Leg Deadlift', 'posterior', 'Stiff com barra'],
    ['Pull-Up (Neutral Grip)', 'costas', 'Barra fixa pegada neutra'],
    ['close-grip push-up', 'peito', 'Flexão de braço pegada fechada'],
  ] as const)('%s → %s', (original, target, expected) => {
    expect(composePortugueseName(original, target)).toBe(expected);
  });

  it('concorda o gênero do adjetivo com o movimento', () => {
    expect(composePortugueseName('dumbbell incline row', 'costas')).toBe('Remada inclinada com halteres');
    expect(composePortugueseName('dumbbell incline fly', 'peito')).toBe('Crucifixo inclinado com halteres');
  });

  it('kickback depende do músculo-alvo', () => {
    expect(composePortugueseName('cable kickback', 'gluteos')).toBe('Coice para glúteos no cabo');
  });

  it('mantém o original quando sobra palavra desconhecida (nunca traduz errado)', () => {
    expect(composePortugueseName('barbell standing bradford press', 'ombros')).toBeUndefined();
    expect(composePortugueseName('push-up plus', 'peito')).toBeUndefined();
    expect(composePortugueseName('kick out sit', 'posterior')).toBeUndefined();
  });

  it('"curl" sozinho só vira rosca para bíceps', () => {
    expect(composePortugueseName('lower back curl', 'costas')).toBeUndefined();
  });
});
