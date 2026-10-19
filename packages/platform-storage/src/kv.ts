import { Storage as SqliteKeyValue } from 'expo-sqlite/kv-store';
import { createJSONStorage, type StateStorage } from 'zustand/middleware';

type MmkvModule = typeof import('react-native-mmkv');

/**
 * MMKV é o padrão (mais rápido), mas exige um development build: no Expo Go
 * o módulo nativo não existe e carregá-lo lança erro. Por isso ele é carregado
 * sob demanda e, se falhar, as preferências vão para o key-value do SQLite,
 * que funciona no Expo Go. Os dois são síncronos, como o Zustand espera.
 */
const createMmkvStorage = (): StateStorage | undefined => {
  try {
    // `require` (e não `import`) para o erro do módulo nativo ausente cair neste try.
    const mmkvModule: MmkvModule = require('react-native-mmkv');
    const mmkv = mmkvModule.createMMKV({ id: 'fitpro-preferences' });
    return {
      getItem: (key) => mmkv.getString(key) ?? null,
      setItem: (key, value) => mmkv.set(key, value),
      removeItem: (key) => {
        mmkv.remove(key);
      },
    };
  } catch {
    return undefined;
  }
};

const sqliteStorage: StateStorage = {
  getItem: (key) => SqliteKeyValue.getItemSync(key),
  setItem: (key, value) => SqliteKeyValue.setItemSync(key, value),
  removeItem: (key) => {
    SqliteKeyValue.removeItemSync(key);
  },
};

let resolved: StateStorage | undefined;

const keyValueStorage = (): StateStorage => {
  resolved ??= createMmkvStorage() ?? sqliteStorage;
  return resolved;
};

/** Storage síncrono para `persist` do Zustand: MMKV no build nativo, SQLite no Expo Go. */
export const persistentStorage = createJSONStorage(keyValueStorage);
