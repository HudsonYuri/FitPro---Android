import type { Point } from './kinematics';

/** Caminho SVG de uma linha quebrada ("M x y L x y …"). */
export const polylinePath = (points: readonly Point[]): string => {
  'worklet';
  let path = '';
  for (let index = 0; index < points.length; index++) {
    const point = points[index];
    if (!point) continue;
    path += `${index === 0 ? 'M' : 'L'}${point.x.toFixed(1)} ${point.y.toFixed(1)}`;
  }
  return path;
};

/** Círculo como caminho, para animar a posição sem trocar de componente. */
export const circlePath = (center: Point, radius: number): string => {
  'worklet';
  const left = (center.x - radius).toFixed(1);
  const y = center.y.toFixed(1);
  const diameter = (radius * 2).toFixed(1);
  return `M${left} ${y}a${radius} ${radius} 0 1 0 ${diameter} 0a${radius} ${radius} 0 1 0 -${diameter} 0`;
};

/** Retângulo arredondado centrado num ponto (pegador, almofada da máquina). */
export const roundedBoxPath = (center: Point, width: number, height: number, radius: number): string => {
  'worklet';
  const x = center.x - width / 2;
  const y = center.y - height / 2;
  const innerWidth = width - radius * 2;
  const innerHeight = height - radius * 2;
  return (
    `M${(x + radius).toFixed(1)} ${y.toFixed(1)}h${innerWidth}a${radius} ${radius} 0 0 1 ${radius} ${radius}` +
    `v${innerHeight}a${radius} ${radius} 0 0 1 -${radius} ${radius}h-${innerWidth}` +
    `a${radius} ${radius} 0 0 1 -${radius} -${radius}v-${innerHeight}a${radius} ${radius} 0 0 1 ${radius} -${radius}z`
  );
};
