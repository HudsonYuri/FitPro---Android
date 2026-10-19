import type { MuscleGroup } from '@fitpro/core-types';
import { composePortugueseName } from './name-translator';

type Translation = {
  name: string;
  instructions?: readonly string[];
  commonMistakes?: readonly string[];
};

/**
 * Tradução local dos exercícios mais comuns, indexada pelo nome original
 * (minúsculo) da ExerciseDB. Itens ausentes caem no texto original.
 */
const TRANSLATIONS: Readonly<Record<string, Translation>> = {
  'barbell bench press': {
    name: 'Supino reto com barra',
    instructions: [
      'Deite no banco com os olhos alinhados à barra e os pés firmes no chão.',
      'Segure a barra um pouco além da largura dos ombros e retraia as escápulas.',
      'Desça a barra controlando até tocar levemente a parte baixa do peito.',
      'Empurre a barra para cima até estender os cotovelos, sem tirar o quadril do banco.',
    ],
    commonMistakes: [
      'Quicar a barra no peito para ganhar impulso.',
      'Abrir os cotovelos a 90° do tronco, sobrecarregando o ombro.',
      'Tirar o quadril do banco durante a subida.',
    ],
  },
  'dumbbell bench press': {
    name: 'Supino reto com halteres',
    instructions: [
      'Deite no banco com um halter em cada mão, apoiados nas coxas.',
      'Leve os halteres à linha do peito com os cotovelos a cerca de 45° do tronco.',
      'Empurre para cima aproximando levemente os halteres no topo.',
      'Desça de forma controlada até sentir alongar o peitoral.',
    ],
    commonMistakes: ['Descer rápido demais e perder o controle.', 'Bater os halteres no topo.'],
  },
  'push-up': {
    name: 'Flexão de braço',
    instructions: [
      'Apoie as mãos um pouco além da largura dos ombros e estenda as pernas.',
      'Mantenha o corpo alinhado da cabeça aos calcanhares, abdômen contraído.',
      'Desça o peito até perto do chão com os cotovelos a cerca de 45°.',
      'Empurre o chão até estender os braços.',
    ],
    commonMistakes: ['Deixar o quadril cair.', 'Fazer amplitude parcial.', 'Projetar a cabeça para a frente.'],
  },
  'barbell full squat': {
    name: 'Agachamento livre com barra',
    instructions: [
      'Apoie a barra no trapézio e afaste os pés na largura dos ombros.',
      'Inspire, contraia o abdômen e sente o quadril para trás e para baixo.',
      'Desça mantendo os joelhos alinhados com a ponta dos pés.',
      'Suba empurrando o chão com o pé inteiro, mantendo o tronco firme.',
    ],
    commonMistakes: [
      'Joelhos caindo para dentro.',
      'Tirar os calcanhares do chão.',
      'Arredondar a lombar no fundo do movimento.',
    ],
  },
  'dumbbell goblet squat': {
    name: 'Agachamento goblet com halter',
    instructions: [
      'Segure um halter junto ao peito com as duas mãos.',
      'Afaste os pés um pouco além da largura do quadril.',
      'Agache mantendo o peito aberto e os cotovelos entre os joelhos.',
      'Suba empurrando o chão até estender o quadril.',
    ],
    commonMistakes: ['Inclinar o tronco demais à frente.', 'Joelhos caindo para dentro.'],
  },
  'sled 45° leg press': {
    name: 'Leg press 45°',
    instructions: [
      'Sente com as costas e o quadril bem apoiados no encosto.',
      'Posicione os pés na plataforma na largura do quadril.',
      'Destrave e desça a plataforma até cerca de 90° de joelho.',
      'Empurre sem travar totalmente os joelhos no topo.',
    ],
    commonMistakes: ['Tirar o quadril do banco no fundo.', 'Travar os joelhos no topo.'],
  },
  'lever leg extension': {
    name: 'Cadeira extensora',
    instructions: [
      'Ajuste o encosto para o joelho ficar alinhado ao eixo da máquina.',
      'Estenda os joelhos até quase travar, contraindo o quadríceps.',
      'Desça devagar, sem deixar a carga bater.',
    ],
    commonMistakes: ['Usar impulso do quadril.', 'Descer a carga sem controle.'],
  },
  'lever seated leg curl': {
    name: 'Cadeira flexora',
    commonMistakes: ['Tirar o quadril do banco.', 'Encurtar a amplitude.'],
  },
  'lever lying leg curl': {
    name: 'Mesa flexora',
    instructions: [
      'Deite de bruços com o rolo logo acima dos calcanhares.',
      'Flexione os joelhos trazendo os calcanhares em direção ao glúteo.',
      'Volte devagar até quase estender as pernas.',
    ],
    commonMistakes: ['Tirar o quadril do banco.', 'Encurtar a amplitude.'],
  },
  'barbell deadlift': {
    name: 'Levantamento terra',
    instructions: [
      'Pés na largura do quadril, barra sobre o meio do pé.',
      'Segure a barra, abaixe o quadril e deixe a coluna neutra.',
      'Empurre o chão e estenda quadril e joelhos juntos, barra rente às pernas.',
      'Desça a barra invertendo o movimento, com controle.',
    ],
    commonMistakes: ['Arredondar a lombar.', 'Afastar a barra do corpo.', 'Hiperestender a coluna no topo.'],
  },
  'barbell romanian deadlift': {
    name: 'Stiff / levantamento terra romeno',
    instructions: [
      'Em pé, segure a barra na frente das coxas com joelhos levemente flexionados.',
      'Leve o quadril para trás deslizando a barra rente às pernas.',
      'Desça até sentir alongar o posterior, mantendo a coluna neutra.',
      'Volte estendendo o quadril e contraindo os glúteos.',
    ],
    commonMistakes: ['Flexionar demais os joelhos (vira terra).', 'Arredondar as costas para descer mais.'],
  },
  'barbell hip thrust': {
    name: 'Elevação pélvica com barra',
    instructions: [
      'Apoie a parte alta das costas no banco e a barra sobre o quadril.',
      'Pés firmes no chão, joelhos a cerca de 90° no topo.',
      'Eleve o quadril contraindo os glúteos até alinhar tronco e coxas.',
      'Desça com controle.',
    ],
    commonMistakes: ['Hiperestender a lombar no topo.', 'Empurrar com a ponta dos pés.'],
  },
  'cable pulldown': {
    name: 'Puxada na polia alta',
    instructions: [
      'Sente com as coxas presas sob o apoio e segure a barra além da largura dos ombros.',
      'Puxe a barra até a parte alta do peito levando os cotovelos para baixo.',
      'Volte devagar até estender os braços.',
    ],
    commonMistakes: ['Jogar o tronco para trás.', 'Puxar atrás da nuca.'],
  },
  'pull-up': {
    name: 'Barra fixa',
    instructions: [
      'Segure a barra com as palmas para a frente, mãos além da largura dos ombros.',
      'Puxe o corpo até o queixo passar a barra, escápulas para baixo.',
      'Desça controlando até estender os braços.',
    ],
    commonMistakes: ['Balançar o corpo.', 'Fazer meia amplitude.'],
  },
  'barbell bent over row': {
    name: 'Remada curvada com barra',
    instructions: [
      'Incline o tronco à frente com joelhos levemente flexionados e coluna neutra.',
      'Puxe a barra em direção ao umbigo levando os cotovelos para trás.',
      'Desça a barra com controle.',
    ],
    commonMistakes: ['Usar impulso do tronco.', 'Arredondar a lombar.'],
  },
  'dumbbell one arm bent-over row': {
    name: 'Remada unilateral com halter',
    instructions: [
      'Apoie joelho e mão do mesmo lado no banco, coluna neutra.',
      'Puxe o halter em direção ao quadril.',
      'Desça até estender o braço.',
    ],
    commonMistakes: ['Girar o tronco para subir o halter.', 'Puxar com o bíceps em vez das costas.'],
  },
  'dumbbell lateral raise': {
    name: 'Elevação lateral com halteres',
    instructions: [
      'Em pé, halteres ao lado do corpo e cotovelos levemente flexionados.',
      'Eleve os braços lateralmente até a altura dos ombros.',
      'Desça devagar.',
    ],
    commonMistakes: ['Subir acima da linha dos ombros.', 'Usar impulso do corpo.', 'Encolher o trapézio.'],
  },
  'barbell seated overhead press': {
    name: 'Desenvolvimento com barra sentado',
    instructions: [
      'Sente com as costas apoiadas e a barra na altura do queixo.',
      'Empurre a barra acima da cabeça até estender os braços.',
      'Desça até a altura do queixo.',
    ],
    commonMistakes: ['Arquear a lombar.', 'Descer atrás da nuca.'],
  },
  'barbell curl': {
    name: 'Rosca direta com barra',
    instructions: [
      'Em pé, segure a barra com as palmas para cima na largura dos ombros.',
      'Flexione os cotovelos mantendo-os junto ao corpo.',
      'Desça até estender os braços.',
    ],
    commonMistakes: ['Balançar o tronco.', 'Adiantar os cotovelos.'],
  },
  'dumbbell hammer curl': {
    name: 'Rosca martelo',
    instructions: [
      'Halteres ao lado do corpo com as palmas voltadas uma para a outra.',
      'Flexione os cotovelos sem girar os punhos.',
      'Desça com controle.',
    ],
    commonMistakes: ['Usar impulso.', 'Afastar os cotovelos do corpo.'],
  },
  'cable pushdown': {
    name: 'Tríceps na polia',
    instructions: [
      'De frente para a polia, segure a barra com os cotovelos junto ao corpo.',
      'Estenda os cotovelos até os braços ficarem retos.',
      'Volte até cerca de 90° sem mover os cotovelos.',
    ],
    commonMistakes: ['Abrir os cotovelos.', 'Inclinar o tronco sobre a barra.'],
  },
  'lever standing calf raise': {
    name: 'Panturrilha em pé na máquina',
    instructions: [
      'Apoie os ombros sob a almofada e a ponta dos pés na plataforma.',
      'Suba os calcanhares o máximo possível.',
      'Desça até alongar bem a panturrilha.',
    ],
    commonMistakes: ['Amplitude curta.', 'Quicar no fundo do movimento.'],
  },
  'crunch floor': {
    name: 'Abdominal no solo',
    instructions: [
      'Deite com joelhos flexionados e pés no chão.',
      'Enrole o tronco tirando as escápulas do chão.',
      'Volte devagar.',
    ],
    commonMistakes: ['Puxar o pescoço com as mãos.', 'Subir com impulso.'],
  },
  'dumbbell lunge': {
    name: 'Afundo com halteres',
    instructions: [
      'Em pé com um halter em cada mão, dê um passo à frente.',
      'Desça até os dois joelhos ficarem a cerca de 90°.',
      'Empurre com o pé da frente para voltar.',
    ],
    commonMistakes: ['Joelho da frente caindo para dentro.', 'Passo curto demais.'],
  },
};

const GENERIC_MISTAKES: Readonly<Record<MuscleGroup, readonly string[]>> = {
  peito: ['Perder a retração das escápulas.', 'Usar carga que impede a amplitude completa.'],
  costas: ['Puxar com os braços em vez das costas.', 'Usar impulso do tronco.'],
  ombros: ['Arquear a lombar para empurrar.', 'Usar carga excessiva e compensar com o trapézio.'],
  biceps: ['Balançar o corpo.', 'Afastar os cotovelos do tronco.'],
  triceps: ['Abrir os cotovelos.', 'Encurtar a amplitude.'],
  quadriceps: ['Joelhos caindo para dentro.', 'Tirar os calcanhares do chão.'],
  posterior: ['Arredondar a lombar.', 'Descer sem controle.'],
  gluteos: ['Compensar com a lombar.', 'Não contrair os glúteos no topo.'],
  panturrilha: ['Amplitude curta.', 'Quicar no fundo do movimento.'],
  abdomen: ['Puxar o pescoço.', 'Prender a respiração.'],
};

/** Mesmo exercício com o nome usado pela API gratuita da ExerciseDB. */
const ALIASES: Readonly<Record<string, string>> = {
  'machine leg extension': 'lever leg extension',
  'machine lying leg curl': 'lever lying leg curl',
  'dumbbell single-arm bent-over row': 'dumbbell one arm bent-over row',
  'smith standing leg calf raise': 'lever standing calf raise',
  'machine seated leg curl': 'lever seated leg curl',
};

const findTranslation = (originalName: string): Translation | undefined => {
  const key = originalName.toLowerCase();
  return TRANSLATIONS[key] ?? TRANSLATIONS[ALIASES[key] ?? ''];
};

export type TranslatedText = { name: string; instructions: string[]; commonMistakes: string[] };

export const translateExercise = (
  originalName: string,
  originalInstructions: readonly string[],
  target: MuscleGroup,
): TranslatedText => {
  const translation = findTranslation(originalName);
  return {
    name: translation?.name ?? composePortugueseName(originalName, target) ?? capitalize(originalName),
    instructions: [...(translation?.instructions ?? originalInstructions)],
    commonMistakes: [...(translation?.commonMistakes ?? GENERIC_MISTAKES[target])],
  };
};

const capitalize = (text: string): string => text.charAt(0).toUpperCase() + text.slice(1);
