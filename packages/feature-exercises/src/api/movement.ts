import type { MovementPattern, MuscleGroup } from '@fitpro/core-types';

type Rule = {
  patterns: readonly string[];
  movement: MovementPattern;
  /** Só vale para estes músculos-alvo ("dip" de tríceps vs. de peito). */
  targets?: readonly MuscleGroup[];
};

/**
 * Do mais específico para o mais genérico: "leg curl" precisa vencer "curl",
 * "upright row" precisa vencer "row", "split squat" precisa vencer "squat".
 */
const RULES: readonly Rule[] = [
  { patterns: ['plank'], movement: 'prancha' },
  { patterns: ['push-up', 'push up', 'pushup'], movement: 'flexao' },
  { patterns: ['calf'], movement: 'panturrilha' },
  { patterns: ['leg press'], movement: 'leg_press' },
  { patterns: ['leg extension'], movement: 'extensora' },
  { patterns: ['leg curl', 'hamstring curl', 'nordic'], movement: 'flexora' },
  { patterns: ['hip thrust', 'glute bridge', 'bridge'], movement: 'elevacao_pelvica' },
  {
    patterns: ['deadlift', 'good morning', 'hyperextension', 'back extension', 'hip extension', 'pull through', 'swing'],
    movement: 'terra',
  },
  { patterns: ['lunge', 'split squat', 'step-up', 'step up'], movement: 'afundo' },
  { patterns: ['squat'], movement: 'agachamento' },
  {
    patterns: ['crunch', 'sit-up', 'sit up', 'v-up', 'leg raise', 'knee raise', 'rollout', 'twist', 'jackknife'],
    movement: 'abdominal',
  },
  { patterns: ['rear delt', 'rear fly', 'reverse fly'], movement: 'remada' },
  { patterns: ['fly', 'flye', 'flyes', 'crossover', 'pec deck'], movement: 'crucifixo' },
  { patterns: ['pulldown', 'pull-up', 'pull up', 'chin-up', 'chin up', 'lat pull'], movement: 'puxada' },
  { patterns: ['upright row', 'shrug', 'raise'], movement: 'elevacao' },
  { patterns: ['row', 'face pull'], movement: 'remada' },
  { patterns: ['dip'], movement: 'flexao', targets: ['peito'] },
  { patterns: ['pushdown', 'kickback', 'skull', 'dip', 'triceps extension', 'french press'], movement: 'triceps' },
  { patterns: ['curl'], movement: 'rosca' },
  { patterns: ['press', 'bench'], movement: 'supino', targets: ['peito'] },
  { patterns: ['press'], movement: 'desenvolvimento', targets: ['ombros'] },
  { patterns: ['press', 'extension'], movement: 'triceps', targets: ['triceps'] },
];

/** Sem termo conhecido no nome, o músculo-alvo escolhe o movimento mais típico. */
const BY_TARGET: Record<MuscleGroup, MovementPattern> = {
  peito: 'supino',
  costas: 'remada',
  ombros: 'desenvolvimento',
  biceps: 'rosca',
  triceps: 'triceps',
  quadriceps: 'agachamento',
  posterior: 'terra',
  gluteos: 'elevacao_pelvica',
  panturrilha: 'panturrilha',
  abdomen: 'abdominal',
};

const matches = (name: string, pattern: string): boolean =>
  new RegExp(`(^|[^a-z])${pattern.replace(/[-]/g, '[- ]?')}([^a-z]|$)`).test(name);

export const inferMovementPattern = (originalName: string, target: MuscleGroup): MovementPattern => {
  const name = originalName.toLowerCase();
  const rule = RULES.find(
    (candidate) =>
      (!candidate.targets || candidate.targets.includes(target)) &&
      candidate.patterns.some((pattern) => matches(name, pattern)),
  );
  return rule?.movement ?? BY_TARGET[target];
};
