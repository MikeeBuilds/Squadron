/**
 * Debug Logger
 * Only logs when DEBUG=true in environment
 */

const isDebugEnabled = (): boolean => {
  if (typeof window !== 'undefined' && window.DEBUG) {
    return true;
  }
  return false;
};

export const debugLog = (...args: unknown[]): void => {
  if (isDebugEnabled()) {
    console.warn(...args);
  }
};

export const debugWarn = (...args: unknown[]): void => {
  if (isDebugEnabled()) {
    console.warn(...args);
  }
};

export const debugError = (...args: unknown[]): void => {
  if (isDebugEnabled()) {
    console.error(...args);
  }
};
