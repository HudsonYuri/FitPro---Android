import type { MuscleGroup } from '@fitpro/core-types';

/**
 * Monta o nome em português a partir das partes do nome original:
 * movimento + variações + equipamento ("Dumbbell Incline Bench Press" →
 * "Supino inclinado com halteres"). Se sobrar alguma palavra que não
 * entendemos, devolve undefined e o app mantém o nome original:
 * melhor um nome em inglês do que uma tradução errada.
 */

type Gender = 'm' | 'f';

type Movement = {
  /** Palavras do nome original, já normalizadas (minúsculas, sem hífen). */
  words: readonly string[];
  name: string;
  gender: Gender;
  /** Só vale para estes músculos-alvo (ex.: "kickback" de tríceps vs. de glúteos). */
  targets?: readonly MuscleGroup[];
  /** O nome já inclui o equipamento ("Tríceps na polia"), então não acrescenta. */
  includesEquipment?: boolean;
  /** Palavras que o nome em português já expressa ("Mesa flexora" já diz "deitado"). */
  absorbs?: readonly string[];
};

/** Ordem importa: o mais específico primeiro ("romanian deadlift" antes de "deadlift"). */
const MOVEMENTS: readonly Movement[] = [
  { words: ['romanian', 'deadlift'], name: 'Levantamento terra romeno', gender: 'm' },
  { words: ['stiff', 'leg', 'deadlift'], name: 'Stiff', gender: 'm' },
  { words: ['straight', 'leg', 'deadlift'], name: 'Stiff', gender: 'm' },
  { words: ['sumo', 'deadlift'], name: 'Levantamento terra sumô', gender: 'm' },
  { words: ['deadlift'], name: 'Levantamento terra', gender: 'm' },
  { words: ['close', 'grip', 'bench', 'press'], name: 'Supino fechado', gender: 'm' },
  { words: ['bench', 'press'], name: 'Supino', gender: 'm' },
  { words: ['chest', 'press'], name: 'Supino', gender: 'm' },
  { words: ['floor', 'press'], name: 'Supino no chão', gender: 'm' },
  { words: ['hammer', 'press'], name: 'Supino pegada neutra', gender: 'm' },
  { words: ['arnold', 'press'], name: 'Desenvolvimento Arnold', gender: 'm' },
  { words: ['shoulder', 'press'], name: 'Desenvolvimento', gender: 'm' },
  { words: ['overhead', 'press'], name: 'Desenvolvimento', gender: 'm' },
  { words: ['military', 'press'], name: 'Desenvolvimento militar', gender: 'm' },
  { words: ['push', 'press'], name: 'Push press', gender: 'm' },
  { words: ['rear', 'lateral', 'raise'], name: 'Elevação lateral posterior', gender: 'f' },
  { words: ['lateral', 'raise'], name: 'Elevação lateral', gender: 'f' },
  { words: ['front', 'raise'], name: 'Elevação frontal', gender: 'f' },
  { words: ['calf', 'raise'], name: 'Elevação de panturrilha', gender: 'f' },
  { words: ['leg', 'raise'], name: 'Elevação de pernas', gender: 'f' },
  { words: ['knee', 'raise'], name: 'Elevação de joelhos', gender: 'f' },
  { words: ['chest', 'dip'], name: 'Mergulho para peitoral', gender: 'm' },
  { words: ['rear', 'delt', 'row'], name: 'Remada para deltoide posterior', gender: 'f' },
  { words: ['rear', 'delt', 'fly'], name: 'Crucifixo inverso', gender: 'm' },
  { words: ['rear', 'fly'], name: 'Crucifixo inverso', gender: 'm' },
  { words: ['reverse', 'fly'], name: 'Crucifixo inverso', gender: 'm' },
  { words: ['fly'], name: 'Crucifixo', gender: 'm' },
  { words: ['flyes'], name: 'Crucifixo', gender: 'm' },
  { words: ['cable', 'crossover'], name: 'Crossover', gender: 'm', includesEquipment: true },
  { words: ['push', 'up'], name: 'Flexão de braço', gender: 'f' },
  { words: ['pull', 'up'], name: 'Barra fixa', gender: 'f' },
  { words: ['chin', 'up'], name: 'Barra fixa supinada', gender: 'f' },
  { words: ['lat', 'pulldown'], name: 'Puxada', gender: 'f' },
  { words: ['pulldown'], name: 'Puxada', gender: 'f' },
  { words: ['inverted', 'row'], name: 'Remada invertida', gender: 'f' },
  { words: ['high', 'row'], name: 'Remada alta aberta', gender: 'f' },
  { words: ['upright', 'row'], name: 'Remada alta', gender: 'f' },
  { words: ['pendlay', 'row'], name: 'Remada Pendlay', gender: 'f' },
  { words: ['t', 'bar', 'row'], name: 'Remada cavalinho', gender: 'f' },
  { words: ['row'], name: 'Remada', gender: 'f' },
  { words: ['face', 'pull'], name: 'Face pull', gender: 'm' },
  { words: ['pullover'], name: 'Pullover', gender: 'm' },
  { words: ['shrug'], name: 'Encolhimento', gender: 'm' },
  { words: ['spider', 'curl'], name: 'Rosca spider', gender: 'f' },
  { words: ['drag', 'curl'], name: 'Rosca drag', gender: 'f' },
  { words: ['zottman', 'curl'], name: 'Rosca Zottman', gender: 'f' },
  { words: ['hammer', 'curl'], name: 'Rosca martelo', gender: 'f' },
  { words: ['preacher', 'curl'], name: 'Rosca Scott', gender: 'f' },
  { words: ['concentration', 'curl'], name: 'Rosca concentrada', gender: 'f' },
  { words: ['reverse', 'curl'], name: 'Rosca inversa', gender: 'f' },
  { words: ['lying', 'leg', 'curl'], name: 'Flexora deitada', gender: 'f', absorbs: ['lying'] },
  { words: ['seated', 'leg', 'curl'], name: 'Flexora sentada', gender: 'f', absorbs: ['seated'] },
  { words: ['leg', 'curl'], name: 'Flexora', gender: 'f' },
  { words: ['wrist', 'curl'], name: 'Rosca de punho', gender: 'f' },
  { words: ['biceps', 'curl'], name: 'Rosca', gender: 'f' },
  { words: ['curl'], name: 'Rosca', gender: 'f', targets: ['biceps'] },
  { words: ['pushdown'], name: 'Tríceps na polia', gender: 'm', includesEquipment: true },
  { words: ['skull', 'crusher'], name: 'Tríceps testa', gender: 'm' },
  { words: ['lying', 'triceps', 'extension'], name: 'Tríceps testa', gender: 'm', absorbs: ['lying'] },
  { words: ['overhead', 'triceps', 'extension'], name: 'Tríceps francês', gender: 'm' },
  { words: ['triceps', 'extension'], name: 'Extensão de tríceps', gender: 'f' },
  { words: ['triceps', 'press'], name: 'Tríceps francês', gender: 'm' },
  { words: ['extension'], name: 'Extensão de tríceps', gender: 'f', targets: ['triceps'] },
  { words: ['kickback'], name: 'Tríceps coice', gender: 'm', targets: ['triceps'] },
  { words: ['kickback'], name: 'Coice para glúteos', gender: 'm', targets: ['gluteos'] },
  { words: ['bench', 'dip'], name: 'Mergulho no banco', gender: 'm' },
  { words: ['dips'], name: 'Mergulho nas paralelas', gender: 'm' },
  { words: ['dip'], name: 'Mergulho nas paralelas', gender: 'm' },
  { words: ['leg', 'extension'], name: 'Extensão de pernas', gender: 'f' },
  { words: ['leg', 'press'], name: 'Leg press', gender: 'm' },
  { words: ['bulgarian', 'split', 'squat'], name: 'Agachamento búlgaro', gender: 'm' },
  { words: ['split', 'squat'], name: 'Agachamento afundo', gender: 'm' },
  { words: ['goblet', 'squat'], name: 'Agachamento goblet', gender: 'm' },
  { words: ['front', 'squat'], name: 'Agachamento frontal', gender: 'm' },
  { words: ['hack', 'squat'], name: 'Agachamento hack', gender: 'm' },
  { words: ['box', 'squat'], name: 'Agachamento no banco', gender: 'm' },
  { words: ['sumo', 'squat'], name: 'Agachamento sumô', gender: 'm' },
  { words: ['back', 'squat'], name: 'Agachamento livre', gender: 'm' },
  { words: ['jump', 'squat'], name: 'Agachamento com salto', gender: 'm' },
  { words: ['full', 'squat'], name: 'Agachamento livre', gender: 'm' },
  { words: ['squat'], name: 'Agachamento', gender: 'm' },
  { words: ['reverse', 'lunge'], name: 'Afundo reverso', gender: 'm' },
  { words: ['lunge'], name: 'Afundo', gender: 'm' },
  { words: ['step', 'up'], name: 'Subida no banco', gender: 'f' },
  { words: ['hip', 'thrust'], name: 'Elevação pélvica', gender: 'f' },
  { words: ['glute', 'bridge'], name: 'Ponte de glúteos', gender: 'f' },
  { words: ['hip', 'extension'], name: 'Extensão de quadril', gender: 'f' },
  { words: ['hip', 'abduction'], name: 'Abdução de quadril', gender: 'f' },
  { words: ['back', 'extension'], name: 'Extensão lombar', gender: 'f' },
  { words: ['pull', 'through'], name: 'Pull through', gender: 'm' },
  { words: ['hyperextension'], name: 'Hiperextensão lombar', gender: 'f' },
  { words: ['good', 'morning'], name: 'Good morning', gender: 'm' },
  { words: ['russian', 'twist'], name: 'Giro russo', gender: 'm' },
  { words: ['side', 'plank'], name: 'Prancha lateral', gender: 'f' },
  { words: ['plank'], name: 'Prancha', gender: 'f' },
  { words: ['sit', 'up'], name: 'Abdominal completo', gender: 'm' },
  { words: ['v', 'up'], name: 'Abdominal canivete', gender: 'm' },
  { words: ['bicycle', 'crunch'], name: 'Abdominal bicicleta', gender: 'm' },
  { words: ['reverse', 'crunch'], name: 'Abdominal invertido', gender: 'm' },
  { words: ['side', 'crunch'], name: 'Abdominal oblíquo', gender: 'm' },
  { words: ['crunch'], name: 'Abdominal', gender: 'm' },
  { words: ['rollout'], name: 'Rollout', gender: 'm' },
  { words: ['twist'], name: 'Rotação de tronco', gender: 'f', targets: ['abdomen'] },
  // "Press" genérico depende do músculo: supino no peito, desenvolvimento no ombro.
  { words: ['press'], name: 'Supino', gender: 'm', targets: ['peito'] },
  { words: ['press'], name: 'Desenvolvimento', gender: 'm', targets: ['ombros'] },
];

type Modifier = { words: readonly string[]; m: string; f: string };

const same = (text: string): { m: string; f: string } => ({ m: text, f: text });

const MODIFIERS: readonly Modifier[] = [
  { words: ['reverse', 'grip'], ...same('pegada invertida') },
  { words: ['close', 'grip'], ...same('pegada fechada') },
  { words: ['narrow', 'grip'], ...same('pegada fechada') },
  { words: ['wide', 'grip'], ...same('pegada aberta') },
  { words: ['neutral', 'grip'], ...same('pegada neutra') },
  { words: ['parallel', 'grip'], ...same('pegada neutra') },
  { words: ['underhand'], ...same('pegada supinada') },
  { words: ['wide'], ...same('pegada aberta') },
  { words: ['hammer', 'grip'], ...same('pegada neutra') },
  { words: ['mixed', 'grip'], ...same('pegada mista') },
  { words: ['behind', 'head'], ...same('atrás da nuca') },
  { words: ['behind', 'neck'], ...same('atrás da nuca') },
  { words: ['straight', 'arm'], ...same('braços estendidos') },
  { words: ['straight', 'leg'], ...same('pernas estendidas') },
  { words: ['two', 'arm'], ...same('') },
  { words: ['two', 'leg'], ...same('') },
  { words: ['cross', 'body'], m: 'cruzado', f: 'cruzada' },
  { words: ['rear', 'delt'], ...same('posterior') },
  { words: ['rear'], ...same('posterior') },
  { words: ['incline'], m: 'inclinado', f: 'inclinada' },
  { words: ['decline'], m: 'declinado', f: 'declinada' },
  { words: ['bent', 'over'], m: 'curvado', f: 'curvada' },
  { words: ['seated'], m: 'sentado', f: 'sentada' },
  { words: ['standing'], ...same('em pé') },
  { words: ['lying'], m: 'deitado', f: 'deitada' },
  { words: ['kneeling'], m: 'ajoelhado', f: 'ajoelhada' },
  { words: ['single', 'arm'], ...same('unilateral') },
  { words: ['one', 'arm'], ...same('unilateral') },
  { words: ['single', 'leg'], ...same('unilateral') },
  { words: ['one', 'leg'], ...same('unilateral') },
  { words: ['alternate'], m: 'alternado', f: 'alternada' },
  { words: ['alternating'], m: 'alternado', f: 'alternada' },
  { words: ['assisted'], m: 'assistido', f: 'assistida' },
  { words: ['weighted'], ...same('com peso') },
  { words: ['one', 'hand'], ...same('unilateral') },
  { words: ['single'], ...same('unilateral') },
  { words: ['hanging'], m: 'suspenso', f: 'suspensa' },
  { words: ['elevated'], m: 'elevado', f: 'elevada' },
  { words: ['walking'], ...same('caminhando') },
  { words: ['overhead'], ...same('acima da cabeça') },
  { words: ['front'], ...same('frontal') },
  { words: ['side'], ...same('lateral') },
  { words: ['high'], m: 'alto', f: 'alta' },
  { words: ['low'], m: 'baixo', f: 'baixa' },
  { words: ['reverse'], m: 'inverso', f: 'inversa' },
  { words: ['floor'], ...same('no chão') },
  { words: ['bench'], ...same('no banco') },
];

/** Equipamento vira sufixo; a ordem resolve conflitos ("ez bar" antes de "bar"). */
const EQUIPMENT_SUFFIX: readonly { words: readonly string[]; suffix: string }[] = [
  { words: ['ez', 'bar'], suffix: 'com barra W' },
  { words: ['trap', 'bar'], suffix: 'com barra hexagonal' },
  { words: ['smith', 'machine'], suffix: 'no smith' },
  { words: ['smith'], suffix: 'no smith' },
  { words: ['straight', 'bar'], suffix: 'com barra reta' },
  { words: ['v', 'bar'], suffix: 'com triângulo' },
  { words: ['stability', 'ball'], suffix: 'na bola suíça' },
  { words: ['exercise', 'ball'], suffix: 'na bola suíça' },
  { words: ['swiss', 'ball'], suffix: 'na bola suíça' },
  { words: ['medicine', 'ball'], suffix: 'com medicine ball' },
  { words: ['bosu', 'ball'], suffix: 'no bosu' },
  { words: ['barbell'], suffix: 'com barra' },
  { words: ['dumbbell'], suffix: 'com halteres' },
  { words: ['kettlebell'], suffix: 'com kettlebell' },
  { words: ['cable'], suffix: 'no cabo' },
  { words: ['rope'], suffix: 'com corda' },
  { words: ['plate'], suffix: 'com anilha' },
  { words: ['leverage', 'machine'], suffix: 'na máquina' },
  { words: ['lever'], suffix: 'na máquina' },
  { words: ['machine'], suffix: 'na máquina' },
  { words: ['sled'], suffix: 'na máquina' },
  { words: ['resistance', 'band'], suffix: 'com elástico' },
  { words: ['band'], suffix: 'com elástico' },
  { words: ['landmine'], suffix: 'no landmine' },
  { words: ['bodyweight'], suffix: '' },
];

/** Palavras que não mudam o sentido do nome. */
const FILLER = new Set(['the', 'a', 'on', 'with', 'to', 'of', 'v', 'exercise', 'standard', 'regular', 'classic', 'flat']);

/** Plurais e grafias alternativas que aparecem no catálogo. */
const SINGULAR: Readonly<Record<string, string>> = {
  raises: 'raise',
  shrugs: 'shrug',
  thrusts: 'thrust',
  lunges: 'lunge',
  crunches: 'crunch',
  curls: 'curl',
  rows: 'row',
  flyes: 'fly',
  flys: 'fly',
  flies: 'fly',
  squats: 'squat',
  kickbacks: 'kickback',
  pushdowns: 'pushdown',
  pulldowns: 'pulldown',
  extensions: 'extension',
  presses: 'press',
  deadlifts: 'deadlift',
  bridges: 'bridge',
  planks: 'plank',
  ups: 'up',
  pullovers: 'pullover',
  bicep: 'biceps',
  tricep: 'triceps',
  dumbbells: 'dumbbell',
};

/** "pushup" e companhia viram duas palavras para casar com o mesmo movimento. */
const SPLIT_WORDS: Readonly<Record<string, readonly string[]>> = {
  pushup: ['push', 'up'],
  pullup: ['pull', 'up'],
  chinup: ['chin', 'up'],
  situp: ['sit', 'up'],
  stepup: ['step', 'up'],
};

const tokenize = (name: string): string[] =>
  name
    .toLowerCase()
    .replace(/°/g, '')
    .replace(/[()\-_/,.]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .flatMap((word) => SPLIT_WORDS[word] ?? [SINGULAR[word] ?? word]);

/** Remove a primeira ocorrência da sequência de palavras; diz se encontrou. */
const take = (tokens: string[], words: readonly string[]): boolean => {
  for (let start = 0; start + words.length <= tokens.length; start++) {
    if (words.every((word, offset) => tokens[start + offset] === word)) {
      tokens.splice(start, words.length);
      return true;
    }
  }
  return false;
};

export const composePortugueseName = (originalName: string, target: MuscleGroup): string | undefined => {
  const tokens = tokenize(originalName);

  const movement = MOVEMENTS.find(
    (candidate) => (!candidate.targets || candidate.targets.includes(target)) && take([...tokens], candidate.words),
  );
  if (!movement) return undefined;
  take(tokens, movement.words);
  for (const word of movement.absorbs ?? []) take(tokens, [word]);

  const modifiers: string[] = [];
  for (const modifier of MODIFIERS) {
    if (take(tokens, modifier.words)) {
      const text = modifier[movement.gender];
      if (!modifiers.includes(text) && !movement.name.includes(text)) modifiers.push(text);
    }
  }

  let equipment = '';
  for (const option of EQUIPMENT_SUFFIX) {
    if (take(tokens, option.words) && !equipment) equipment = option.suffix;
  }

  if (tokens.some((word) => !FILLER.has(word) && !/^\d+$/.test(word))) return undefined;

  // "Supino" sozinho é o supino reto; com inclinação o adjetivo já diz tudo.
  const base =
    movement.name === 'Supino' && !modifiers.some((text) => /inclinad|declinad/.test(text)) ? 'Supino reto' : movement.name;

  return [base, ...modifiers, movement.includesEquipment ? '' : equipment].filter(Boolean).join(' ');
};
