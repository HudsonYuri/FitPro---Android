import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { createCatalogStore } from './catalog-store.ts';
import { createFreeSource } from './sources/exercisedb-free.ts';
import { createRapidApiSource } from './sources/rapidapi.ts';
import { UpstreamError, type ExerciseSource, type NormalizedExercise } from './types.ts';

const DEFAULT_PORT = 8787;
const SAFE_SEGMENT = /^[a-z0-9 %-]{1,40}$/i;
const LIST_ROUTE = /^\/exercises\/(bodyPart|target|equipment)\/([^/]+)$/;
const SINGLE_ROUTE = /^\/exercises\/exercise\/([^/]+)$/;
const GIF_ROUTE = /^\/gifs\/([^/]+)$/;
const ONE_HOUR_S = 60 * 60;
const ONE_DAY_S = 24 * ONE_HOUR_S;
const RETRY_AFTER_S = 30;
const DEFAULT_LIST_LIMIT = 30;
const MAX_LIST_LIMIT = 100;

const port = Number(process.env.PORT ?? DEFAULT_PORT);
const publicBaseUrl = (process.env.PUBLIC_BASE_URL ?? `http://localhost:${port}`).replace(/\/$/, '');

/** Padrão: API gratuita da ExerciseDB, sem chave. `EXERCISE_SOURCE=rapidapi` usa o plano pago. */
const createSource = (): ExerciseSource => {
  const sourceName = process.env.EXERCISE_SOURCE ?? 'exercisedb-free';
  if (sourceName === 'exercisedb-free') return createFreeSource();
  if (sourceName === 'rapidapi') {
    const apiKey = process.env.EXERCISEDB_API_KEY;
    if (!apiKey) throw new Error('EXERCISE_SOURCE=rapidapi exige EXERCISEDB_API_KEY (veja .env.example).');
    return createRapidApiSource({
      apiKey,
      host: process.env.EXERCISEDB_HOST ?? 'exercisedb.p.rapidapi.com',
      publicBaseUrl,
    });
  }
  throw new Error(`EXERCISE_SOURCE desconhecida: ${sourceName} (use exercisedb-free ou rapidapi).`);
};

const source = createSource();
const catalog = createCatalogStore(source, process.env.CATALOG_CACHE_FILE ?? '.cache/catalog.json');

const sendJson = (res: ServerResponse, status: number, body: unknown, maxAgeSeconds = 0): void => {
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': maxAgeSeconds > 0 ? `public, max-age=${maxAgeSeconds}` : 'no-store',
  });
  res.end(JSON.stringify(body));
};

const safeSegment = (raw: string): string | undefined => {
  try {
    const decoded = decodeURIComponent(raw);
    return SAFE_SEGMENT.test(decoded) ? decoded : undefined;
  } catch {
    return undefined;
  }
};

/** Enquanto o primeiro download não termina, o app recebe 503 e tenta de novo. */
const withCatalog = (res: ServerResponse, use: (exercises: NormalizedExercise[]) => void): void => {
  const state = catalog.get();
  switch (state.status) {
    case 'ready':
      return use(state.exercises);
    case 'preparing':
      res.setHeader('retry-after', String(RETRY_AFTER_S));
      return sendJson(res, 503, { error: 'Catálogo de exercícios sendo preparado. Tente em instantes.' });
    case 'failed':
      res.setHeader('retry-after', String(RETRY_AFTER_S));
      return sendJson(res, 503, { error: `Não foi possível baixar o catálogo: ${state.message}` });
  }
};

const route = async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
  const url = new URL(req.url ?? '/', 'http://localhost');
  if (req.method !== 'GET') return sendJson(res, 405, { error: 'Método não permitido' });

  if (url.pathname === '/health') {
    const state = catalog.get();
    return sendJson(res, 200, {
      ok: true,
      source: source.name,
      catalog: state.status,
      exercises: state.status === 'ready' ? state.exercises.length : 0,
    });
  }

  if (url.pathname === '/catalog') {
    return withCatalog(res, (exercises) => sendJson(res, 200, exercises, ONE_HOUR_S));
  }

  const list = LIST_ROUTE.exec(url.pathname);
  if (list?.[1] && list[2]) {
    const field = list[1] === 'bodyPart' ? 'bodyPart' : list[1] === 'target' ? 'target' : 'equipment';
    const value = safeSegment(list[2])?.toLowerCase();
    if (!value) return sendJson(res, 400, { error: 'Parâmetro inválido' });
    const limit = Math.min(Number(url.searchParams.get('limit')) || DEFAULT_LIST_LIMIT, MAX_LIST_LIMIT);
    const offset = Math.max(Number(url.searchParams.get('offset')) || 0, 0);
    return withCatalog(res, (exercises) =>
      sendJson(
        res,
        200,
        exercises.filter((exercise) => exercise[field].toLowerCase() === value).slice(offset, offset + limit),
        ONE_HOUR_S,
      ),
    );
  }

  const single = SINGLE_ROUTE.exec(url.pathname);
  if (single?.[1]) {
    const id = safeSegment(single[1]);
    if (!id) return sendJson(res, 400, { error: 'ID inválido' });
    return withCatalog(res, (exercises) => {
      const exercise = exercises.find((candidate) => candidate.id === id);
      return exercise ? sendJson(res, 200, exercise, ONE_DAY_S) : sendJson(res, 404, { error: 'Exercício não encontrado' });
    });
  }

  const gif = GIF_ROUTE.exec(url.pathname);
  if (gif?.[1]) {
    if (!source.fetchGif) return sendJson(res, 404, { error: 'Esta fonte entrega os GIFs por URL pública' });
    const id = safeSegment(gif[1]);
    if (!id) return sendJson(res, 400, { error: 'ID inválido' });
    const image = await source.fetchGif(id);
    res.writeHead(200, { 'content-type': image.contentType, 'cache-control': `public, max-age=${ONE_DAY_S * 30}, immutable` });
    res.end(image.body);
    return;
  }

  return sendJson(res, 404, { error: 'Rota não encontrada' });
};

await catalog.start();

createServer((req, res) => {
  route(req, res).catch((error: unknown) => {
    const status = error instanceof UpstreamError ? 502 : 500;
    console.error(`[${req.method} ${req.url}]`, error);
    if (!res.headersSent) sendJson(res, status, { error: 'Falha ao consultar a fonte de exercícios' });
  });
}).listen(port, () => {
  console.log(`FitPro backend em http://localhost:${port} (fonte: ${source.name})`);
});
