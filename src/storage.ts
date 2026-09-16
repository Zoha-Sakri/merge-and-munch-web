export const SAVE_SCHEMA_VERSION = 1

export function readSaved<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    const value = JSON.parse(raw) as T
    return value ?? fallback
  } catch {
    localStorage.removeItem(key)
    return fallback
  }
}

export function writeSaved<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify({ schemaVersion: SAVE_SCHEMA_VERSION, value }))
  } catch {
    // Gameplay remains usable if browser storage is unavailable or full.
  }
}

export function readVersioned<T>(key: string, fallback: T): T {
  const saved = readSaved<{ schemaVersion?: number; value?: T } | T>(key, fallback)
  if (typeof saved === 'object' && saved !== null && 'value' in saved) return saved.value ?? fallback
  return saved as T
}
