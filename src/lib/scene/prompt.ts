import { SCRUB_SCHEMA } from './schema'

export const SCRUB_SYSTEM_PROMPT = `You are an identifier detector for one document. You run on the user's own device.

Return JSON matching the supplied schema only. Find spans that identify a real person, organisation, account or location, plus contact details. Do not return generic job titles, product names, dates or ordinary prose.

Offsets are character indices counted in the exact input string. The end index is exclusive. Allocate tokens as two square brackets, the type, an underscore, a number that restarts per type in document order, then two closing square brackets, for example ⟦NAME_1⟧. Use only these types: NAME, ID, ACCOUNT, ADDRESS, CONTACT, CUSTOM.

Set confidence to "low" when a span is plausibly an identifier but could be ordinary prose. Never guess high confidence on an ambiguous span. Return an empty spans array rather than inventing a span.

Schema: ${JSON.stringify(SCRUB_SCHEMA)}`

/** Builds the single cloud prompt. It never includes the original document or its manifest. */
export function buildAnswerPrompt(redacted: string, question: string): string {
  return `${redacted}\n\nQuestion: ${question}\n\nText in ⟦DOUBLE_BRACKETS⟧ is a placeholder for a value withheld for privacy. Refer to them as written. Do not ask what they contain.`
}
