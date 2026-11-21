import { describe, expect, it } from 'vitest'
import { mask } from '../src/lib/scrub/mask'
import { restore, restoreDocument } from '../src/lib/scrub/restore'
import { detectRuleSpans } from '../src/lib/scrub/deterministic'
import { DEFAULT_POLICY } from '../src/lib/store/policy'
import type { Span } from '../src/lib/scene/schema'

describe('restore', () => {
  it('restores a token that appears twice in an answer', () => {
    const map = [{
      token: '⟦NAME_1⟧',
      type: 'NAME' as const,
      original: 'Ada Lovelace',
      start: 0,
      end: 12,
      confidence: 'high' as const,
    }]
    const result = restore('⟦NAME_1⟧ asked ⟦NAME_1⟧ to check the file.', map)
    expect(result.text).toBe('Ada Lovelace asked Ada Lovelace to check the file.')
    expect(result.restored).toHaveLength(2)
    expect(result.unknownTokens).toEqual([])
  })

  it('leaves an unknown token in place and reports it', () => {
    const result = restore('Ask ⟦UNKNOWN_9⟧ about it', [])
    expect(result.text).toBe('Ask ⟦UNKNOWN_9⟧ about it')
    expect(result.unknownTokens).toEqual(['⟦UNKNOWN_9⟧'])
  })

  it('returns the answer untouched when nothing restored', () => {
    const answer = 'No placeholders here.'
    const result = restore(answer, [])
    expect(result.text).toBe(answer)
    expect(result.restored).toEqual([])
  })

  it('satisfies the document round-trip invariant for every fixture', () => {
    const fixtures = [
      '',
      'a',
      '   ',
      'Client: Jane Doe. Record QQ123456C.',
      'a@example.com',
      '4111111111111111',
      'Line one\r\nLine two\r\nContact 07700 900123',
    ]
    for (const fixture of fixtures) {
      const normalised = fixture.replace(/\r/g, '')
      const { map } = mask(normalised, detectRuleSpans(normalised, DEFAULT_POLICY))
      expect(restoreDocument(fixture, map)).toBe(fixture)
    }
  })

  it('restores overlapping model spans after a merge', () => {
    const spans: Span[] = [
      { type: 'NAME', start: 0, end: 9, token: '⟦NAME_1⟧', confidence: 'high', origin: 'model' },
      { type: 'NAME', start: 4, end: 9, token: '⟦NAME_2⟧', confidence: 'low', origin: 'model' },
    ]
    const { redacted, map } = mask('Jane Doe', spans)
    expect(restore(redacted, map).text).toBe('Jane Doe')
    expect(map).toHaveLength(1)
  })
})
