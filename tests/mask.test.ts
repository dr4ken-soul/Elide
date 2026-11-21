import { describe, expect, it } from 'vitest'
import { detectRuleSpans } from '../src/lib/scrub/deterministic'
import { mask } from '../src/lib/scrub/mask'
import { restoreDocument } from '../src/lib/scrub/restore'
import { DEFAULT_POLICY } from '../src/lib/store/policy'

const DOCUMENT = 'Patient Ada Lovelace, ref 482-91-7365. Card 4111 1111 1111 1111. ada@example.com'

describe('mask', () => {
  it('replaces every rule span and records its original', () => {
    const spans = detectRuleSpans(DOCUMENT, DEFAULT_POLICY)
    const { redacted, map } = mask(DOCUMENT, spans)
    expect(map.length).toBeGreaterThan(2)
    expect(redacted).toContain('⟦CONTACT_1⟧')
    expect(map.every((entry) => entry.original.length > 0)).toBe(true)
    expect(new Set(map.map((entry) => entry.token)).size).toBe(map.length)
  })

  it('leaves an empty, single-character and whitespace-only document unchanged', () => {
    for (const document of ['', 'a', '   \n\t ']) {
      const { redacted, map } = mask(document, detectRuleSpans(document, DEFAULT_POLICY))
      expect(map).toEqual([])
      expect(redacted).toBe(document)
    }
  })

  it('round-trips CRLF and zero-width characters byte for byte', () => {
    const original = 'Patient Alice\r\nref QQ123456C\u200B; email alice@example.org\r\n'
    const spans = detectRuleSpans(original.replace(/\r/g, '').replace(/\u200B/g, ''), DEFAULT_POLICY)
    const normalised = original.replace(/\r/g, '').replace(/\u200B/g, '')
    const { map } = mask(normalised, spans)
    expect(restoreDocument(original, map)).toBe(original)
  })

  it('handles an identifier at index zero and at the final character', () => {
    const original = 'ada@example.com end 4111111111111111'
    const normalised = original
    const { redacted, map } = mask(normalised, detectRuleSpans(normalised, DEFAULT_POLICY))
    expect(redacted.startsWith('⟦CONTACT_1⟧')).toBe(true)
    expect(redacted.endsWith('⟦ACCT_1⟧')).toBe(true)
    expect(map[0]?.start).toBe(0)
    expect(map[map.length - 1]?.end).toBe(original.length)
    expect(restoreDocument(original, map)).toBe(original)
  })
})
