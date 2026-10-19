import type { Exercise } from '@fitpro/core-types';
import { parseExternalCatalog } from './to-exercise';

const REQUEST_TIMEOUT_MS = 15_000;

/**
 * O app nunca fala direto com a ExerciseDB: a chave fica no backend proxy.
 * `EXPO_PUBLIC_API_URL` é público por definição e só aponta para esse proxy.
 */
const apiBaseUrl = (): string => {
  const url = process.env.EXPO_PUBLIC_API_URL;
  if (!url) throw new Error('EXPO_PUBLIC_API_URL não configurada (veja o README).');
  return url.replace(/\/$/, '');
};

export const fetchExerciseCatalog = async (): Promise<Exercise[]> => {
  const response = await fetch(`${apiBaseUrl()}/catalog`, { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
  if (response.status === 503) {
    // Primeira execução do backend: ele ainda está baixando o catálogo da fonte.
    throw new Error('O catálogo de exercícios está sendo preparado. Tente de novo em instantes.');
  }
  if (!response.ok) {
    throw new Error(`Falha ao carregar exercícios (HTTP ${response.status}).`);
  }
  const { exercises, rejected } = parseExternalCatalog(await response.json());
  if (rejected > 0 && __DEV__) {
    console.warn(`[exercises] ${rejected} registros descartados pela validação`);
  }
  return exercises;
};
