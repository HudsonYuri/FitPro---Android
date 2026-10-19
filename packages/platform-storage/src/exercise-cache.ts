import { getDatabase } from './database';

type CacheRow = { payload: string };

/**
 * Guarda o catálogo já validado para uso offline.
 * O conteúdo é revalidado por quem lê: o storage não conhece o schema.
 */
export const writeExerciseCache = async (entries: readonly { id: string }[]): Promise<void> => {
  const db = getDatabase();
  const cachedAt = Date.now();
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM exercise_cache');
    for (const entry of entries) {
      await db.runAsync(
        'INSERT INTO exercise_cache (id, payload, cached_at) VALUES (?, ?, ?)',
        entry.id,
        JSON.stringify(entry),
        cachedAt,
      );
    }
  });
};

export const readExerciseCache = async (): Promise<unknown[]> => {
  const rows = await getDatabase().getAllAsync<CacheRow>('SELECT payload FROM exercise_cache');
  return rows.map((row): unknown => JSON.parse(row.payload));
};
