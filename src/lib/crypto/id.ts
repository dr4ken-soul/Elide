import type { EntityType } from '../scene/schema'

/** Prefix used in placeholder tokens. Account and address use the short forms from the product copy. */
export function tokenPrefix(type: EntityType): string {
  switch (type) {
    case 'ACCOUNT': return 'ACCT'
    case 'ADDRESS': return 'ADDR'
    default: return type
  }
}

/** Allocates the next collision-free token for a type within one document. */
export function allocateToken(type: EntityType, used: Set<string>): string {
  let number = 1
  let candidate = `⟦${tokenPrefix(type)}_${number}⟧`
  while (used.has(candidate)) {
    number += 1
    candidate = `⟦${tokenPrefix(type)}_${number}⟧`
  }
  used.add(candidate)
  return candidate
}
