import type { MovementPattern } from '@fitpro/core-types';
import type { Pose } from './kinematics';

/** Área de desenho (viewBox) e chão, em unidades do SVG. */
export const FIGURE_VIEWBOX = { width: 240, height: 160 } as const;
export const GROUND_Y = 150;

export type Scenery =
  | { kind: 'bench'; x: number; y: number; width: number }
  | { kind: 'seat'; x: number; y: number; width: number }
  | { kind: 'none' };

export type FigureScene = {
  /** Posição de repouso (início da repetição). */
  start: Pose;
  /** Posição de esforço máximo (meio da repetição). */
  end: Pose;
  scenery: Scenery;
  /** Onde o cabo ou o elástico se prende. */
  anchor: readonly [x: number, y: number];
  /** Onde fica a carga: na mão (padrão) ou no tornozelo (extensora, flexora, leg press). */
  load?: 'hand' | 'ankle';
};

const STANDING = { hip: [110, 98], torso: -90, thigh: 90, shin: 90 } as const;
const LYING_ON_BENCH = { hip: [150, 108], torso: 180, thigh: 35, shin: 85 } as const;
const BENCH: Scenery = { kind: 'bench', x: 86, y: 112, width: 76 };
const FLOOR_FRONT = [150, GROUND_Y] as const;

export const FIGURE_SCENES: Record<MovementPattern, FigureScene> = {
  supino: {
    start: { ...LYING_ON_BENCH, upperArm: 35, foreArm: -100 },
    end: { ...LYING_ON_BENCH, upperArm: -88, foreArm: -90 },
    scenery: BENCH,
    anchor: [108, GROUND_Y],
  },
  crucifixo: {
    start: { ...LYING_ON_BENCH, upperArm: 50, foreArm: 30 },
    end: { ...LYING_ON_BENCH, upperArm: -90, foreArm: -88 },
    scenery: BENCH,
    anchor: [108, GROUND_Y],
  },
  flexao: {
    start: { hip: [112, 118], torso: 194, upperArm: 92, foreArm: 92, thigh: 29, shin: 29, foot: 80 },
    end: { hip: [112, 132], torso: 190, upperArm: 120, foreArm: 20, thigh: 12, shin: 12, foot: 80 },
    scenery: { kind: 'none' },
    anchor: FLOOR_FRONT,
  },
  desenvolvimento: {
    start: { ...STANDING, upperArm: 60, foreArm: -75 },
    end: { ...STANDING, upperArm: -85, foreArm: -90 },
    scenery: { kind: 'none' },
    anchor: [110, GROUND_Y],
  },
  elevacao: {
    start: { ...STANDING, upperArm: 85, foreArm: 88 },
    end: { ...STANDING, upperArm: -5, foreArm: -8 },
    scenery: { kind: 'none' },
    anchor: [110, GROUND_Y],
  },
  remada: {
    start: { hip: [100, 96], torso: -20, upperArm: 90, foreArm: 90, thigh: 80, shin: 100 },
    end: { hip: [100, 96], torso: -20, upperArm: 150, foreArm: 70, thigh: 80, shin: 100 },
    scenery: { kind: 'none' },
    anchor: [200, 104],
  },
  puxada: {
    start: { hip: [110, 122], torso: -90, upperArm: -72, foreArm: -82, thigh: 0, shin: 90 },
    end: { hip: [110, 122], torso: -90, upperArm: 120, foreArm: -70, thigh: 0, shin: 90 },
    scenery: { kind: 'seat', x: 94, y: 126, width: 30 },
    anchor: [114, 6],
  },
  rosca: {
    start: { ...STANDING, upperArm: 92, foreArm: 92 },
    end: { ...STANDING, upperArm: 95, foreArm: -60 },
    scenery: { kind: 'none' },
    anchor: [130, GROUND_Y],
  },
  triceps: {
    start: { hip: [108, 98], torso: -80, upperArm: 100, foreArm: -40, thigh: 90, shin: 90 },
    end: { hip: [108, 98], torso: -80, upperArm: 100, foreArm: 85, thigh: 90, shin: 90 },
    scenery: { kind: 'none' },
    anchor: [128, 6],
  },
  agachamento: {
    start: { ...STANDING, upperArm: 80, foreArm: 80, ankle: [110, GROUND_Y] },
    end: { hip: [96, 122], torso: -55, upperArm: 10, foreArm: 5, thigh: 10, shin: 116, ankle: [110, GROUND_Y] },
    scenery: { kind: 'none' },
    anchor: [110, GROUND_Y],
  },
  afundo: {
    start: { hip: [106, 106], torso: -90, upperArm: 90, foreArm: 90, thigh: 57, shin: 58, ankle: [134, GROUND_Y], ankle2: [80, GROUND_Y] },
    end: { hip: [106, 124], torso: -90, upperArm: 90, foreArm: 90, thigh: 0, shin: 86, ankle: [134, GROUND_Y], ankle2: [80, GROUND_Y] },
    scenery: { kind: 'none' },
    anchor: [134, GROUND_Y],
  },
  terra: {
    start: { hip: [96, 102], torso: -15, upperArm: 90, foreArm: 90, thigh: 75, shin: 100, ankle: [101, GROUND_Y] },
    end: { hip: [101, 98], torso: -90, upperArm: 90, foreArm: 90, thigh: 90, shin: 90, ankle: [101, GROUND_Y] },
    scenery: { kind: 'none' },
    anchor: [104, GROUND_Y],
  },
  elevacao_pelvica: {
    start: { hip: [120, 140], torso: 185, upperArm: 10, foreArm: 0, thigh: -35, shin: 75, ankle: [148, GROUND_Y] },
    end: { hip: [120, 112], torso: 147, upperArm: 10, foreArm: 0, thigh: 29, shin: 79, ankle: [148, GROUND_Y] },
    scenery: { kind: 'none' },
    anchor: [120, GROUND_Y],
  },
  leg_press: {
    start: { hip: [110, 112], torso: -135, upperArm: 60, foreArm: 0, thigh: -40, shin: 40 },
    end: { hip: [110, 112], torso: -135, upperArm: 60, foreArm: 0, thigh: -25, shin: -25 },
    scenery: { kind: 'seat', x: 94, y: 116, width: 30 },
    anchor: FLOOR_FRONT,
    load: 'ankle',
  },
  extensora: {
    start: { hip: [110, 104], torso: -90, upperArm: 90, foreArm: 20, thigh: 0, shin: 95 },
    end: { hip: [110, 104], torso: -90, upperArm: 90, foreArm: 20, thigh: 0, shin: 5 },
    scenery: { kind: 'seat', x: 92, y: 108, width: 46 },
    anchor: [170, 130],
    load: 'ankle',
  },
  flexora: {
    start: { hip: [130, 112], torso: 180, upperArm: 170, foreArm: 170, thigh: 0, shin: 0 },
    end: { hip: [130, 112], torso: 180, upperArm: 170, foreArm: 170, thigh: 0, shin: -100 },
    scenery: { kind: 'bench', x: 70, y: 116, width: 100 },
    anchor: [200, 112],
    load: 'ankle',
  },
  panturrilha: {
    start: { ...STANDING, upperArm: 90, foreArm: 90, foot: 0 },
    end: { ...STANDING, hip: [110, 90], upperArm: 90, foreArm: 90, foot: 63 },
    scenery: { kind: 'none' },
    anchor: [110, GROUND_Y],
  },
  abdominal: {
    start: { hip: [118, 144], torso: 180, upperArm: 0, foreArm: 0, thigh: -55, shin: 60 },
    end: { hip: [118, 144], torso: 210, upperArm: -20, foreArm: -20, thigh: -55, shin: 60 },
    scenery: { kind: 'none' },
    anchor: FLOOR_FRONT,
  },
  prancha: {
    start: { hip: [110, 128], torso: 195, upperArm: 90, foreArm: 0, thigh: 15, shin: 15, foot: 90 },
    end: { hip: [110, 124], torso: 196, upperArm: 90, foreArm: 0, thigh: 13, shin: 13, foot: 90 },
    scenery: { kind: 'none' },
    anchor: FLOOR_FRONT,
  },
};
