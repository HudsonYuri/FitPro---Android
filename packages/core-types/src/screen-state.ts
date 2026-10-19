export type ScreenState<TData> =
  | { status: 'loading' }
  | { status: 'error'; message: string; retry: () => void }
  | { status: 'ready'; data: TData };

export const assertNever = (value: never): never => {
  throw new Error(`Caso não tratado: ${JSON.stringify(value)}`);
};
