import { allocateToken } from '../crypto/id'
import type { EntityType, PolicyConfig, Span } from '../scene/schema'

/** Luhn checksum, used to prevent formatting that merely looks like a card being withheld. */
export function passesLuhn(value: string): boolean {
  const digits = value.replace(/\D/g, '')
  if (digits.length < 13 || digits.length > 19) return false
  let sum = 0
  let double = false
  for (let index = digits.length - 1; index >= 0; index -= 1) {
    let digit = Number(digits[index])
    if (double) {
      digit *= 2
      if (digit > 9) digit -= 9
    }
    sum += digit
    double = !double
  }
  return sum % 10 === 0
}

function passesIban(value: string): boolean {
  const compact = value.replace(/\s/g, '').toUpperCase()
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(compact)) return false
  const rearranged = compact.slice(4) + compact.slice(0, 4)
  let remainder = 0
  for (const character of rearranged) {
    const numeric = /[A-Z]/.test(character)
      ? String(character.charCodeAt(0) - 55)
      : character
    for (const digit of numeric) remainder = (remainder * 10 + Number(digit)) % 97
  }
  return remainder === 1
}

interface Candidate {
  type: EntityType
  start: number
  end: number
}

function findPattern(text: string, source: string, flags = 'gi'): Candidate[] {
  let regex: RegExp
  try {
    regex = new RegExp(source, flags)
  } catch {
    return []
  }
  const found: Candidate[] = []
  let match = regex.exec(text)
  while (match) {
    if (match[0].length > 0) found.push({ type: 'CUSTOM', start: match.index, end: match.index + match[0].length })
    match = regex.exec(text)
  }
  return found
}

function escapeLiteral(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function isEnabled(type: EntityType, policy: PolicyConfig, isMandatory: boolean): boolean {
  return isMandatory || policy.enabledTypes.includes(type)
}

/**
 * Runs the deterministic backstop passes against normalised text. Every returned
 * span is high confidence and rule-origin; card and IBAN shapes are checksummed.
 */
export function detectRuleSpans(text: string, policy: PolicyConfig): Span[] {
  const candidates: Candidate[] = []

  if (isEnabled('CONTACT', policy, policy.mandatoryTypes.includes('CONTACT'))) {
    for (const match of findPattern(text, '[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}')) {
      candidates.push({ ...match, type: 'CONTACT' })
    }
    for (const match of findPattern(text, '\\+?\\d[\\d\\s().-]{6,}\\d')) {
      const value = text.slice(match.start, match.end)
      const digits = value.replace(/\D/g, '').length
      if (digits >= 8 && digits <= 15 && !passesLuhn(value)) {
        candidates.push({ ...match, type: 'CONTACT' })
      }
    }
  }

  if (isEnabled('ACCOUNT', policy, policy.mandatoryTypes.includes('ACCOUNT'))) {
    for (const match of findPattern(text, '\\b[A-Z]{2}\\d{2}(?:[ ]?[A-Z0-9]{4}){2,7}\\b')) {
      if (passesIban(text.slice(match.start, match.end))) candidates.push({ ...match, type: 'ACCOUNT' })
    }
    for (const match of findPattern(text, '\\b(?:\\d[ -]?){12,18}\\d\\b')) {
      if (passesLuhn(text.slice(match.start, match.end))) candidates.push({ ...match, type: 'ACCOUNT' })
    }
  }

  const typeFromKey = (key: string): EntityType => {
    const prefix = key.split('_')[0] ?? ''
    return (['NAME', 'ID', 'ACCOUNT', 'ADDRESS', 'CONTACT', 'CUSTOM'] as string[]).includes(prefix)
      ? (prefix as EntityType)
      : 'ID'
  }

  for (const [key, source] of Object.entries(policy.patternLibrary)) {
    const type = typeFromKey(key)
    if (!isEnabled(type, policy, policy.mandatoryTypes.includes(type))) continue
    for (const match of findPattern(text, source)) candidates.push({ ...match, type })
  }

  for (const term of [...policy.alwaysWithholdTerms, ...policy.customTerms]) {
    if (term.length === 0) continue
    for (const match of findPattern(text, escapeLiteral(term))) {
      candidates.push({ ...match, type: 'CUSTOM' })
    }
  }

  candidates.sort((left, right) => left.start - right.start || right.end - left.end)
  const used = new Set<string>()
  return candidates.map((candidate) => ({
    type: candidate.type,
    start: candidate.start,
    end: candidate.end,
    token: allocateToken(candidate.type, used),
    confidence: 'high',
    origin: 'rule',
  }))
}
