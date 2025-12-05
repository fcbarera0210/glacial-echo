export const rand = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const formatTime = (): string => {
  return new Date().toLocaleTimeString('es-ES');
};

