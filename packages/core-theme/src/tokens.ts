const GRID = 8;

/** Grade de 8pt: `xs` é a única exceção (meio passo) para ajustes finos. */
export const spacing = {
  none: 0,
  xs: GRID / 2,
  sm: GRID,
  md: GRID * 2,
  lg: GRID * 3,
  xl: GRID * 4,
  xxl: GRID * 6,
} as const;

export const radii = {
  sm: GRID,
  md: GRID * 1.75,
  lg: GRID * 2.5,
  pill: 999,
} as const;

export const sizes = {
  touchTarget: 48,
  iconSm: 16,
  icon: 24,
  thumbnail: GRID * 9,
  progressBar: GRID / 2,
  gifHero: GRID * 40,
  gifCompact: GRID * 28,
  chartHeight: GRID * 20,
  hairline: 1,
  weekDay: GRID * 5,
  setColumn: GRID * 9,
} as const;

export const typography = {
  display: { fontSize: 32, lineHeight: 40, fontWeight: '900', letterSpacing: -0.5 },
  title: { fontSize: 24, lineHeight: 32, fontWeight: '800', letterSpacing: -0.25 },
  heading: { fontSize: 18, lineHeight: 24, fontWeight: '700' },
  body: { fontSize: 16, lineHeight: 24, fontWeight: '400' },
  label: { fontSize: 14, lineHeight: 20, fontWeight: '600' },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '500' },
} as const;

export type TypographyVariant = keyof typeof typography;

export const durations = {
  fast: 120,
  normal: 220,
  slow: 360,
  stagger: 50,
} as const;

export const pressScale = 0.96;

/** Visual escuro esverdeado com acento verde neon, pensado primeiro para o modo escuro. */
const palette = {
  neon500: '#3BEA62',
  neon600: '#1FBF47',
  neon950: '#0C3A1E',
  abyss950: '#03131A',
  abyss900: '#0A1F27',
  abyss800: '#112A33',
  abyss700: '#1B3B45',
  abyss400: '#86A3A8',
  mist200: '#D3E2E0',
  mist100: '#EEF5F3',
  white: '#FFFFFF',
  red500: '#FF5A5F',
  red100: '#FFECEC',
  red900: '#3D1416',
  amber500: '#FFB020',
  amber100: '#FFF4DE',
  amber900: '#3A2A06',
} as const;

export type ColorTokens = {
  background: string;
  surface: string;
  surfaceRaised: string;
  border: string;
  text: string;
  textMuted: string;
  primary: string;
  onPrimary: string;
  primarySoft: string;
  danger: string;
  dangerSoft: string;
  warning: string;
  warningSoft: string;
  ripple: string;
  skeleton: string;
};

export const lightColors: ColorTokens = {
  background: palette.mist100,
  surface: palette.white,
  surfaceRaised: palette.white,
  border: palette.mist200,
  text: palette.abyss950,
  textMuted: '#4E6A70',
  primary: palette.neon600,
  onPrimary: palette.abyss950,
  primarySoft: '#DDF8E4',
  danger: '#D93A40',
  dangerSoft: palette.red100,
  warning: palette.amber500,
  warningSoft: palette.amber100,
  ripple: 'rgba(3,19,26,0.10)',
  skeleton: palette.mist200,
};

export const darkColors: ColorTokens = {
  background: palette.abyss950,
  surface: palette.abyss900,
  surfaceRaised: palette.abyss800,
  border: palette.abyss700,
  text: palette.mist100,
  textMuted: palette.abyss400,
  primary: palette.neon500,
  onPrimary: palette.abyss950,
  primarySoft: palette.neon950,
  danger: palette.red500,
  dangerSoft: palette.red900,
  warning: palette.amber500,
  warningSoft: palette.amber900,
  ripple: 'rgba(255,255,255,0.12)',
  skeleton: palette.abyss700,
};
