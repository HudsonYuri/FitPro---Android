import {
  LEVEL_RANK,
  MUSCLE_LABEL,
  type Exercise,
  type Level,
  type MuscleGroup,
  type Restriction,
  type SlotRole,
  type UserProfile,
} from '@fitpro/core-types';
import { allowedExerciseEquipment } from './equipment';
import { familiarityScore, nameKey } from './familiarity';
import { RESTRICTION_RULES, findContraindication, isSafeFor, protectiveFor } from './restrictions';

export type SelectionContext = Pick<UserProfile, 'level' | 'equipment' | 'restrictions'>;

export type Selection = { exercise: Exercise; reason: string };

const TOP_CHOICES_TO_ROTATE = 3;

const fitsLevel = (exercise: Exercise, level: Level): boolean => LEVEL_RANK[exercise.difficulty] <= LEVEL_RANK[level];

/** Pontuação de adequação: maior é melhor. Determinística para ser testável. */
const scoreFor = (exercise: Exercise, role: SlotRole, context: SelectionContext): number => {
  const mechanicsFit =
    role === 'principal' ? (exercise.mechanics === 'composto' ? 3 : 0) : exercise.mechanics === 'isolado' ? 2 : 0;
  const prefersStable = context.level === 'iniciante';
  const equipmentFit = prefersStable
    ? exercise.equipment === 'maquina' || exercise.equipment === 'halteres'
      ? 1
      : 0
    : exercise.equipment === 'barra' || exercise.equipment === 'halteres'
      ? 1
      : 0;
  const protection = protectiveFor(exercise, context.restrictions).length * 2;
  const challenge = exercise.difficulty === context.level ? 0.5 : 0;
  return mechanicsFit + equipmentFit + protection + challenge + familiarityScore(exercise);
};

const rank = (pool: readonly Exercise[], role: SlotRole, context: SelectionContext): Exercise[] =>
  [...pool].sort(
    (a, b) =>
      scoreFor(b, role, context) - scoreFor(a, role, context) ||
      // Empate: o nome mais curto costuma ser a versão básica do movimento.
      a.originalName.length - b.originalName.length ||
      a.id.localeCompare(b.id),
  );

/** Exercícios do músculo-alvo compatíveis com equipamento e nível, ignorando restrições. */
const eligibleIgnoringRestrictions = (catalog: readonly Exercise[], target: MuscleGroup, context: SelectionContext): Exercise[] => {
  const equipment = allowedExerciseEquipment(context.equipment);
  return catalog.filter(
    (exercise) => exercise.target === target && equipment.has(exercise.equipment) && fitsLevel(exercise, context.level),
  );
};

export const safeCandidates = (catalog: readonly Exercise[], target: MuscleGroup, context: SelectionContext): Exercise[] =>
  eligibleIgnoringRestrictions(catalog, target, context).filter((exercise) => isSafeFor(exercise, context.restrictions));

const muscleName = (target: MuscleGroup): string => MUSCLE_LABEL[target].toLowerCase();

const explainSubstitution = (chosen: Exercise, replaced: Exercise, restriction: Restriction): string =>
  `Substitui ${replaced.name} para não sobrecarregar ${RESTRICTION_RULES[restriction].phrase}, mantendo o foco em ${muscleName(chosen.target)}.`;

/** Restrições cuja articulação coincide com um grupo muscular do app. */
const JOINT_MUSCLE: Partial<Record<Restriction, MuscleGroup>> = { ombro: 'ombros' };

export const explainChoice =(exercise: Exercise, role: SlotRole, restrictions: readonly Restriction[]): string => {
  const [protectedJoint] = protectiveFor(exercise, restrictions);
  const [anyRestriction] = restrictions;
  const guardedJoint = protectedJoint ?? anyRestriction;
  if (guardedJoint && JOINT_MUSCLE[guardedJoint] === exercise.target) {
    // "trabalhar ombros sem sobrecarregar o ombro" soa contraditório: aqui o músculo é a própria região.
    return `Variação que poupa ${RESTRICTION_RULES[guardedJoint].phrase} e ainda trabalha ${muscleName(exercise.target)} com segurança.`;
  }
  if (guardedJoint) {
    return `Escolhido por trabalhar ${muscleName(exercise.target)} sem sobrecarregar ${RESTRICTION_RULES[guardedJoint].phrase}.`;
  }
  if (role === 'principal' && exercise.mechanics === 'composto') {
    return `Composto principal para ${muscleName(exercise.target)}: recruta vários músculos e permite progredir a carga.`;
  }
  return `Acessório para isolar ${muscleName(exercise.target)} e completar o volume da sessão.`;
};

export type SelectArgs = {
  catalog: readonly Exercise[];
  target: MuscleGroup;
  role: SlotRole;
  context: SelectionContext;
  excludeIds: ReadonlySet<string>;
  variant: number;
};

/**
 * Escolhe o exercício de um slot. Se o favorito sem restrições for
 * contraindicado, a escolha vira uma substituição explicada.
 */
export const selectExercise = ({ catalog, target, role, context, excludeIds, variant }: SelectArgs): Selection | undefined => {
  const notUsed = (exercise: Exercise): boolean => !excludeIds.has(exercise.id);
  const safe = rank(safeCandidates(catalog, target, context).filter(notUsed), role, context);
  const pick = safe[variant % Math.min(TOP_CHOICES_TO_ROTATE, safe.length)];
  if (!pick) return undefined;

  const unrestricted = rank(eligibleIgnoringRestrictions(catalog, target, context).filter(notUsed), role, context);
  const favorite = unrestricted[variant % Math.min(TOP_CHOICES_TO_ROTATE, unrestricted.length)];
  const blockedBy = favorite ? findContraindication(favorite, context.restrictions) : undefined;

  const reason =
    favorite && blockedBy ? explainSubstitution(pick, favorite, blockedBy) : explainChoice(pick, role, context.restrictions);
  return { exercise: pick, reason };
};

export type Alternative = { exercise: Exercise; reason: string };

const ALTERNATIVES_COUNT = 3;

/**
 * "Trocar exercício": até 3 opções seguras para o mesmo músculo-alvo,
 * priorizando o mesmo equipamento.
 */
export const suggestAlternatives = (
  current: Exercise,
  catalog: readonly Exercise[],
  context: SelectionContext,
  count: number = ALTERNATIVES_COUNT,
): Alternative[] => {
  const role: SlotRole = current.mechanics === 'composto' ? 'principal' : 'acessorio';
  const seenNames = new Set([nameKey(current)]);
  const options = rank(safeCandidates(catalog, current.target, context), role, context).filter((exercise) => {
    const key = nameKey(exercise);
    if (seenNames.has(key)) return false;
    seenNames.add(key);
    return true;
  });
  const sameEquipment = options.filter((exercise) => exercise.equipment === current.equipment);
  const otherEquipment = options.filter((exercise) => exercise.equipment !== current.equipment);

  return [...sameEquipment, ...otherEquipment].slice(0, count).map((exercise) => ({
    exercise,
    reason:
      exercise.equipment === current.equipment
        ? `Mesmo músculo e mesmo equipamento. ${explainChoice(exercise, role, context.restrictions)}`
        : `Mesmo músculo com outro equipamento disponível. ${explainChoice(exercise, role, context.restrictions)}`,
  }));
};
