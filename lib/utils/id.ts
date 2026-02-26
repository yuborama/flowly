export function generateId() {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }

  return `id_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}
