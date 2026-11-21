import { denormalise, normalise } from './normalise'
import type { ManifestEntry } from '../scene/schema'

export interface RestoredRange {
  token: string
  original: string
  start: number
  end: number
}

export interface RestoreResult {
  text: string
  restored: RestoredRange[]
  unknownTokens: string[]
}

const TOKEN_PATTERN = /⟦[A-Z]+_\d+⟧/g

/**
 * Substitutes known tokens with their originals. Unknown tokens are left
 * exactly as they arrived and are reported so the UI can say so plainly.
 */
export function restore(text: string, manifest: ManifestEntry[]): RestoreResult {
  const byToken = new Map(manifest.map((entry) => [entry.token, entry]))
  const unknownTokens: string[] = []
  const restored: RestoredRange[] = []
  let output = ''
  let cursor = 0

  for (const match of text.matchAll(TOKEN_PATTERN)) {
    const token = match[0]
    const start = match.index ?? 0
    const entry = byToken.get(token)
    if (!entry) {
      if (!unknownTokens.includes(token)) unknownTokens.push(token)
      continue
    }
    output += text.slice(cursor, start) + entry.original
    restored.push({ token, original: entry.original, start: output.length - entry.original.length, end: output.length })
    cursor = start + token.length
  }

  output += text.slice(cursor)
  return { text: output, restored, unknownTokens }
}

/** Restores an answer produced from a redacted document back to original bytes. */
export function restoreDocument(original: string, manifest: ManifestEntry[]): string {
  const info = normalise(original)
  const result = restore(info.text, manifest)
  return denormalise(result.text, info)
}
