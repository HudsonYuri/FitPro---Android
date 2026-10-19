import { describe, expect, it } from 'vitest';
import { MOVEMENT_PATTERNS } from '@fitpro/core-types';
import { BONES, interpolatePose, solvePose, type Joints } from '../kinematics';
import { FIGURE_SCENES, FIGURE_VIEWBOX, GROUND_Y } from '../poses';
import { circlePath, polylinePath } from '../paths';

const distance = (a: { x: number; y: number }, b: { x: number; y: number }): number => Math.hypot(a.x - b.x, a.y - b.y);

const allPoints = (joints: Joints) => Object.values(joints);

describe('cinemática do bonequinho', () => {
  it('os ossos mantêm o comprimento em qualquer ponto da animação', () => {
    const { start, end } = FIGURE_SCENES.agachamento;
    for (const progress of [0, 0.25, 0.5, 0.75, 1]) {
      const joints = solvePose(interpolatePose(start, end, progress));
      expect(distance(joints.hip, joints.shoulder)).toBeCloseTo(BONES.torso, 1);
      expect(distance(joints.hip, joints.knee)).toBeCloseTo(BONES.thigh, 1);
      expect(distance(joints.knee, joints.ankle)).toBeCloseTo(BONES.shin, 1);
      expect(distance(joints.shoulder, joints.elbow)).toBeCloseTo(BONES.upperArm, 1);
    }
  });

  it('interpola ângulos pelo caminho mais curto', () => {
    const base = FIGURE_SCENES.supino.start;
    const halfway = interpolatePose({ ...base, torso: 170 }, { ...base, torso: -170 }, 0.5);
    expect(Math.abs(halfway.torso)).toBeCloseTo(180);
  });

  it('todo movimento tem cena e cabe na área de desenho, sem atravessar o chão', () => {
    for (const pattern of MOVEMENT_PATTERNS) {
      const scene = FIGURE_SCENES[pattern];
      for (const progress of [0, 0.5, 1]) {
        for (const point of allPoints(solvePose(interpolatePose(scene.start, scene.end, progress)))) {
          expect(point.x, `${pattern} x`).toBeGreaterThanOrEqual(0);
          expect(point.x, `${pattern} x`).toBeLessThanOrEqual(FIGURE_VIEWBOX.width);
          expect(point.y, `${pattern} y`).toBeGreaterThanOrEqual(0);
          expect(point.y, `${pattern} acima do chão`).toBeLessThanOrEqual(GROUND_Y + 4);
        }
      }
    }
  });

  it('agachamento: os pés ficam no lugar enquanto o quadril desce', () => {
    const { start, end } = FIGURE_SCENES.agachamento;
    const standing = solvePose(start);
    const bottom = solvePose(end);
    expect(bottom.hip.y).toBeGreaterThan(standing.hip.y + 15);
    expect(distance(standing.ankle, bottom.ankle)).toBeLessThan(1.5);
  });
});

describe('caminhos SVG', () => {
  it('monta linhas e círculos', () => {
    expect(polylinePath([{ x: 0, y: 0 }, { x: 10, y: 5 }])).toBe('M0.0 0.0L10.0 5.0');
    expect(circlePath({ x: 10, y: 10 }, 5)).toBe('M5.0 10.0a5 5 0 1 0 10.0 0a5 5 0 1 0 -10.0 0');
  });
});
