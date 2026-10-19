/**
 * Esqueleto do bonequinho em vista lateral, virado para a direita.
 * Ângulos em graus no sistema da tela: 0 = direita, 90 = baixo, -90 = cima, 180 = esquerda.
 * Uma pose guarda só o quadril e os ângulos; as posições saem da cinemática direta,
 * então nenhum osso estica ou encolhe durante a animação.
 */
export type Pose = {
  hip: readonly [x: number, y: number];
  torso: number;
  upperArm: number;
  foreArm: number;
  thigh: number;
  shin: number;
  /** Segunda perna (afundo, flexora). Sem ela, as duas pernas se sobrepõem. */
  thigh2?: number;
  shin2?: number;
  /** Pé: 0 apoiado no chão; ~60 na ponta dos pés. */
  foot?: number;
  /**
   * Tornozelo plantado. Quando existe, o joelho sai da cinemática inversa e o pé
   * fica parado no chão durante todo o movimento (os ângulos da perna são ignorados).
   */
  ankle?: readonly [x: number, y: number];
  ankle2?: readonly [x: number, y: number];
};

export type Point = { x: number; y: number };

export type Joints = {
  hip: Point;
  shoulder: Point;
  head: Point;
  elbow: Point;
  hand: Point;
  knee: Point;
  ankle: Point;
  toe: Point;
  knee2: Point;
  ankle2: Point;
  toe2: Point;
};

export const BONES = {
  torso: 42,
  neck: 4,
  headRadius: 9,
  upperArm: 22,
  foreArm: 20,
  thigh: 26,
  shin: 26,
  foot: 9,
} as const;

const RADIANS = Math.PI / 180;

const offset = (from: Point, length: number, angle: number): Point => {
  'worklet';
  return { x: from.x + length * Math.cos(angle * RADIANS), y: from.y + length * Math.sin(angle * RADIANS) };
};

/** Interpola ângulos pelo caminho mais curto (de 170° para -170° passa por 180°, não por 0°). */
const lerpAngle = (from: number, to: number, progress: number): number => {
  'worklet';
  const delta = ((((to - from) % 360) + 540) % 360) - 180;
  return from + delta * progress;
};

const lerp = (from: number, to: number, progress: number): number => {
  'worklet';
  return from + (to - from) * progress;
};

const lerpPoint = (
  from: readonly [number, number] | undefined,
  to: readonly [number, number] | undefined,
  progress: number,
): readonly [number, number] | undefined => {
  'worklet';
  if (!from || !to) return undefined;
  return [lerp(from[0], to[0], progress), lerp(from[1], to[1], progress)];
};

export const interpolatePose = (from: Pose, to: Pose, progress: number): Pose => {
  'worklet';
  const ankle = lerpPoint(from.ankle, to.ankle, progress);
  const ankle2 = lerpPoint(from.ankle2 ?? from.ankle, to.ankle2 ?? to.ankle, progress);
  return {
    ...(ankle && { ankle }),
    ...(ankle2 && { ankle2 }),
    hip: [lerp(from.hip[0], to.hip[0], progress), lerp(from.hip[1], to.hip[1], progress)],
    torso: lerpAngle(from.torso, to.torso, progress),
    upperArm: lerpAngle(from.upperArm, to.upperArm, progress),
    foreArm: lerpAngle(from.foreArm, to.foreArm, progress),
    thigh: lerpAngle(from.thigh, to.thigh, progress),
    shin: lerpAngle(from.shin, to.shin, progress),
    thigh2: lerpAngle(from.thigh2 ?? from.thigh, to.thigh2 ?? to.thigh, progress),
    shin2: lerpAngle(from.shin2 ?? from.shin, to.shin2 ?? to.shin, progress),
    foot: lerp(from.foot ?? 0, to.foot ?? 0, progress),
  };
};

/**
 * Joelho para um pé plantado: perna de dois ossos iguais, joelho dobrando para a frente
 * (para cima e à frente na ponte, para baixo na perna de trás do afundo).
 */
const kneeFor = (hip: Point, ankle: Point): Point => {
  'worklet';
  const legLength = BONES.thigh + BONES.shin;
  const dx = ankle.x - hip.x;
  const dy = ankle.y - hip.y;
  const reach = Math.min(Math.hypot(dx, dy), legLength - 0.01);
  const ux = dx / Math.hypot(dx, dy);
  const uy = dy / Math.hypot(dx, dy);
  const bend = Math.sqrt(BONES.thigh * BONES.thigh - (reach / 2) * (reach / 2));
  return { x: hip.x + (ux * reach) / 2 + uy * bend, y: hip.y + (uy * reach) / 2 - ux * bend };
};

const plantedAnkle = (hip: Point, target: readonly [number, number]): Point => {
  'worklet';
  const legLength = BONES.thigh + BONES.shin;
  const dx = target[0] - hip.x;
  const dy = target[1] - hip.y;
  const reach = Math.hypot(dx, dy);
  if (reach <= legLength) return { x: target[0], y: target[1] };
  // Fora de alcance: estica a perna na direção do alvo.
  return { x: hip.x + (dx / reach) * legLength, y: hip.y + (dy / reach) * legLength };
};

export const solvePose = (pose: Pose): Joints => {
  'worklet';
  const hip = { x: pose.hip[0], y: pose.hip[1] };
  const shoulder = offset(hip, BONES.torso, pose.torso);
  const head = offset(shoulder, BONES.neck + BONES.headRadius, pose.torso);
  const elbow = offset(shoulder, BONES.upperArm, pose.upperArm);
  const hand = offset(elbow, BONES.foreArm, pose.foreArm);
  const ankle = pose.ankle ? plantedAnkle(hip, pose.ankle) : offset(offset(hip, BONES.thigh, pose.thigh), BONES.shin, pose.shin);
  const knee = pose.ankle ? kneeFor(hip, ankle) : offset(hip, BONES.thigh, pose.thigh);
  const toe = offset(ankle, BONES.foot, pose.foot ?? 0);
  const secondTarget = pose.ankle2 ?? pose.ankle;
  const ankle2 = secondTarget
    ? plantedAnkle(hip, secondTarget)
    : offset(offset(hip, BONES.thigh, pose.thigh2 ?? pose.thigh), BONES.shin, pose.shin2 ?? pose.shin);
  const knee2 = secondTarget ? kneeFor(hip, ankle2) : offset(hip, BONES.thigh, pose.thigh2 ?? pose.thigh);
  const toe2 = offset(ankle2, BONES.foot, pose.foot ?? 0);
  return { hip, shoulder, head, elbow, hand, knee, ankle, toe, knee2, ankle2, toe2 };
};

/** Vai e volta suavemente: 0 → 1 → 0 ao longo de um ciclo (t de 0 a 1). */
export const cycleProgress = (t: number): number => {
  'worklet';
  return 0.5 - 0.5 * Math.cos(2 * Math.PI * t);
};
