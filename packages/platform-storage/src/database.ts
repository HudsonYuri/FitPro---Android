import { openDatabaseSync, type SQLiteDatabase } from 'expo-sqlite';

const MIGRATIONS: readonly string[] = [
  `CREATE TABLE IF NOT EXISTS workout_logs (
     id TEXT PRIMARY KEY NOT NULL,
     session_id TEXT NOT NULL,
     session_title TEXT NOT NULL,
     started_at INTEGER NOT NULL,
     finished_at INTEGER NOT NULL
   );
   CREATE TABLE IF NOT EXISTS set_logs (
     workout_id TEXT NOT NULL REFERENCES workout_logs(id) ON DELETE CASCADE,
     exercise_id TEXT NOT NULL,
     set_index INTEGER NOT NULL,
     load_kg REAL NOT NULL,
     reps INTEGER NOT NULL,
     PRIMARY KEY (workout_id, exercise_id, set_index)
   );
   CREATE INDEX IF NOT EXISTS set_logs_exercise ON set_logs(exercise_id);
   CREATE TABLE IF NOT EXISTS exercise_cache (
     id TEXT PRIMARY KEY NOT NULL,
     payload TEXT NOT NULL,
     cached_at INTEGER NOT NULL
   );`,
];

let database: SQLiteDatabase | undefined;

const migrate = (db: SQLiteDatabase): void => {
  db.execSync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
  const row = db.getFirstSync<{ user_version: number }>('PRAGMA user_version');
  const currentVersion = row?.user_version ?? 0;
  MIGRATIONS.slice(currentVersion).forEach((sql, offset) => {
    db.withTransactionSync(() => {
      db.execSync(sql);
      db.execSync(`PRAGMA user_version = ${currentVersion + offset + 1}`);
    });
  });
};

/** Abre o banco uma vez e aplica as migrações pendentes. */
export const getDatabase = (): SQLiteDatabase => {
  if (!database) {
    database = openDatabaseSync('fitpro.db');
    migrate(database);
  }
  return database;
};
