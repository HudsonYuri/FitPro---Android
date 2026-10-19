/** Cópia local: core-ui não depende de core-types (só de core-theme). */
export const assertNever = (value: never): never => {
  throw new Error(`Caso não tratado: ${JSON.stringify(value)}`);
};
