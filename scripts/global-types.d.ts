// Tipos globales para Node.js (simulación)
declare global {
  namespace NodeJS {
    interface Global {
      window: {
        setTimeout: (fn: () => void, delay: number) => number;
      } | undefined;
      localStorage: {
        getItem: (key: string) => string | null;
        setItem: (key: string, value: string) => void;
        removeItem: (key: string) => void;
      } | undefined;
    }
  }
  var window: {
    setTimeout: (fn: () => void, delay: number) => number;
  } | undefined;
  var localStorage: {
    getItem: (key: string) => string | null;
    setItem: (key: string, value: string) => void;
    removeItem: (key: string) => void;
  } | undefined;
}

export {};

