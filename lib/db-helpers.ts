/**
 * Helpers pour gérer la compatibilité SQLite/PostgreSQL
 */

// Convertir un array de strings en string pour SQLite
export function serializeServices(services: string[]): string {
  return services.join(',')
}

// Convertir une string en array de strings
export function deserializeServices(services: string | null): string[] {
  if (!services) return []
  return services.split(',').filter(s => s.length > 0)
}

// Sérialiser un objet JSON
export function serializeJson(obj: any): string {
  return JSON.stringify(obj)
}

// Désérialiser un string JSON
export function deserializeJson<T>(str: string | null): T | null {
  if (!str) return null
  try {
    return JSON.parse(str) as T
  } catch {
    return null
  }
}
