import { useEffect, useState, type FC } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedProps,
  useDerivedValue,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Line, Path, Rect } from 'react-native-svg';
import { assertNever, type ExerciseEquipment, type MovementPattern } from '@fitpro/core-types';
import { radii, spacing, useTheme } from '@fitpro/core-theme';
import { interpolatePose, solvePose } from '../figure/kinematics';
import { circlePath, polylinePath, roundedBoxPath } from '../figure/paths';
import { FIGURE_SCENES, FIGURE_VIEWBOX, GROUND_Y, type Scenery } from '../figure/poses';
import { Text } from '../atoms/Text';
import { Touchable } from '../atoms/Touchable';

const AnimatedPath = Animated.createAnimatedComponent(Path);

/** Uma repetição completa (descer e subir) leva o dobro disso. */
const HALF_REP_MS = 1100;
const LIMB_WIDTH = 5;
const HEAD_RADIUS = 9;
const BARBELL_PLATE_RADIUS = 10;
const DUMBBELL_RADIUS = 6;
const KETTLEBELL_RADIUS = 7;

type LoadKind = 'disco' | 'halter' | 'kettlebell' | 'cabo' | 'elastico' | 'nenhum';

const loadKindFor = (equipment: ExerciseEquipment): LoadKind => {
  switch (equipment) {
    case 'barra':
      return 'disco';
    case 'halteres':
      return 'halter';
    case 'kettlebell':
      return 'kettlebell';
    case 'cabo':
    case 'maquina':
      return 'cabo';
    case 'elastico':
      return 'elastico';
    case 'peso_corporal':
    case 'outro':
      return 'nenhum';
    default:
      return assertNever(equipment);
  }
};

const SceneryShape: FC<{ scenery: Scenery; color: string }> = ({ scenery, color }) => {
  switch (scenery.kind) {
    case 'bench':
      return (
        <>
          <Rect x={scenery.x} y={scenery.y} width={scenery.width} height={5} rx={2} fill={color} />
          <Line x1={scenery.x + 6} y1={scenery.y} x2={scenery.x + 6} y2={GROUND_Y} stroke={color} strokeWidth={3} />
          <Line
            x1={scenery.x + scenery.width - 6}
            y1={scenery.y}
            x2={scenery.x + scenery.width - 6}
            y2={GROUND_Y}
            stroke={color}
            strokeWidth={3}
          />
        </>
      );
    case 'seat':
      return (
        <>
          <Rect x={scenery.x} y={scenery.y} width={scenery.width} height={6} rx={2} fill={color} />
          <Line
            x1={scenery.x + scenery.width / 2}
            y1={scenery.y}
            x2={scenery.x + scenery.width / 2}
            y2={GROUND_Y}
            stroke={color}
            strokeWidth={3}
          />
        </>
      );
    case 'none':
      return null;
    default:
      return assertNever(scenery);
  }
};

export type ExerciseFigureProps = {
  pattern: MovementPattern;
  equipment: ExerciseEquipment;
  /** Descrição do movimento, lida pelo TalkBack/VoiceOver. */
  accessibilityLabel: string;
  height: number;
  /** Miniaturas de lista ficam paradas na posição de esforço. */
  animated?: boolean;
};

/**
 * Bonequinho demonstrando o exercício. Desenhado pelo próprio app (não depende
 * de GIF nem de internet): cada padrão de movimento tem uma pose inicial e uma
 * final, e o equipamento muda conforme o exercício. Com "reduzir movimento",
 * começa parado e mostra um botão de play.
 */
export const ExerciseFigure: FC<ExerciseFigureProps> = ({ pattern, equipment, accessibilityLabel, height, animated = true }) => {
  const { colors } = useTheme();
  const reduceMotion = useReducedMotion();
  const [isPlaying, setIsPlaying] = useState(animated && !reduceMotion);
  const scene = FIGURE_SCENES[pattern];
  const loadKind = loadKindFor(equipment);
  const progress = useSharedValue(animated ? 0 : 1);

  useEffect(() => {
    if (!isPlaying) {
      cancelAnimation(progress);
      return;
    }
    progress.value = withRepeat(
      withTiming(1, { duration: HALF_REP_MS, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
    return () => cancelAnimation(progress);
  }, [isPlaying, progress]);

  const joints = useDerivedValue(() => solvePose(interpolatePose(scene.start, scene.end, progress.value)));

  const backLegProps = useAnimatedProps(() => {
    const j = joints.value;
    return { d: polylinePath([j.hip, j.knee2, j.ankle2, j.toe2]) };
  });
  const torsoProps = useAnimatedProps(() => {
    const j = joints.value;
    return { d: polylinePath([j.hip, j.shoulder]) };
  });
  const headProps = useAnimatedProps(() => ({ d: circlePath(joints.value.head, HEAD_RADIUS) }));
  const frontLegProps = useAnimatedProps(() => {
    const j = joints.value;
    return { d: polylinePath([j.hip, j.knee, j.ankle, j.toe]) };
  });
  const armProps = useAnimatedProps(() => {
    const j = joints.value;
    return { d: polylinePath([j.shoulder, j.elbow, j.hand]) };
  });

  const loadPoint = scene.load === 'ankle' ? 'ankle' : 'hand';
  const cableProps = useAnimatedProps(() => {
    const point = loadPoint === 'ankle' ? joints.value.ankle : joints.value.hand;
    return { d: `M${scene.anchor[0]} ${scene.anchor[1]}L${point.x.toFixed(1)} ${point.y.toFixed(1)}` };
  });
  const loadProps = useAnimatedProps(() => {
    const j = joints.value;
    if (loadPoint === 'ankle') return { d: roundedBoxPath(j.ankle, 12, 12, 4) };
    switch (loadKind) {
      case 'disco':
        return { d: circlePath(j.hand, BARBELL_PLATE_RADIUS) };
      case 'halter':
        return { d: circlePath(j.hand, DUMBBELL_RADIUS) };
      case 'kettlebell':
        return { d: circlePath({ x: j.hand.x, y: j.hand.y + 8 }, KETTLEBELL_RADIUS) };
      case 'cabo':
        return { d: roundedBoxPath(j.hand, 10, 4, 2) };
      case 'elastico':
      case 'nenhum':
        return { d: '' };
    }
  });

  const showsCable = loadKind === 'cabo' || loadKind === 'elastico';
  const showsLoad = loadPoint === 'ankle' || (loadKind !== 'elastico' && loadKind !== 'nenhum');
  const loadIsRing = loadPoint === 'hand' && loadKind === 'disco';

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel}
      style={[styles.frame, { height, backgroundColor: colors.surfaceRaised }]}
    >
      <Svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${FIGURE_VIEWBOX.width} ${FIGURE_VIEWBOX.height}`}
        preserveAspectRatio="xMidYMid meet"
      >
        <Line x1={10} y1={GROUND_Y} x2={FIGURE_VIEWBOX.width - 10} y2={GROUND_Y} stroke={colors.border} strokeWidth={2} />
        <SceneryShape scenery={scene.scenery} color={colors.textMuted} />
        {showsCable && (
          <>
            <Path d={circlePath({ x: scene.anchor[0], y: scene.anchor[1] }, 5)} fill={colors.textMuted} />
            <AnimatedPath
              animatedProps={cableProps}
              stroke={colors.primary}
              strokeWidth={loadKind === 'elastico' ? 3 : 2}
              {...(loadKind === 'elastico' && { strokeDasharray: [4, 3] })}
              fill="none"
            />
          </>
        )}
        <AnimatedPath
          animatedProps={backLegProps}
          stroke={colors.text}
          strokeOpacity={0.45}
          strokeWidth={LIMB_WIDTH}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <AnimatedPath animatedProps={torsoProps} stroke={colors.text} strokeWidth={LIMB_WIDTH} strokeLinecap="round" fill="none" />
        <AnimatedPath animatedProps={headProps} stroke={colors.text} strokeWidth={4} fill={colors.surfaceRaised} />
        <AnimatedPath
          animatedProps={frontLegProps}
          stroke={colors.text}
          strokeWidth={LIMB_WIDTH}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <AnimatedPath
          animatedProps={armProps}
          stroke={colors.text}
          strokeWidth={LIMB_WIDTH}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {showsLoad && (
          <AnimatedPath
            animatedProps={loadProps}
            fill={loadIsRing ? 'none' : colors.primary}
            stroke={loadIsRing ? colors.primary : 'none'}
            strokeWidth={loadIsRing ? 5 : 0}
          />
        )}
      </Svg>
      {animated && reduceMotion && (
        <Touchable
          onPress={() => setIsPlaying((playing) => !playing)}
          accessibilityLabel={isPlaying ? 'Pausar demonstração' : 'Reproduzir demonstração'}
          style={[styles.playButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <Text variant="label">{isPlaying ? 'Pausar' : '▶ Reproduzir'}</Text>
        </Touchable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  frame: { width: '100%', borderRadius: radii.lg, overflow: 'hidden' },
  playButton: {
    position: 'absolute',
    right: spacing.sm,
    bottom: spacing.sm,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    borderRadius: radii.pill,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
