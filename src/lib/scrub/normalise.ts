export interface RemovedChar {
  normalisedIndex: number
  value: string
}

export interface NormalisedText {
  text: string
  toOriginal: number[]
  removed: RemovedChar[]
}

const ZERO_WIDTH = new Set(['\u200B', '\u200C', '\u200D', '\u200E', '\u200F', '\u2060', '\uFEFF', '\u00AD'])

/**
 * Collapses CRLF to LF and strips zero-width characters, recording the exact
 * position of every removed character so a restored document can be rebuilt byte for byte.
 */
export function normalise(input: string): NormalisedText {
  let text = ''
  const toOriginal: number[] = []
  const removed: RemovedChar[] = []

  for (let index = 0; index < input.length; index += 1) {
    const character = input[index] ?? ''
    if (character === '\r' && input[index + 1] === '\n') {
      removed.push({ normalisedIndex: text.length, value: '\r' })
      continue
    }
    if (ZERO_WIDTH.has(character)) {
      removed.push({ normalisedIndex: text.length, value: character })
      continue
    }
    text += character
    toOriginal.push(index)
  }

  return { text, toOriginal, removed }
}

/**
 * Re-inserts the characters removed by normalisation. The input is restored
 * text, so its offsets align with the normalised document and the recorded
 * indices are the exact insertion points.
 */
export function denormalise(text: string, info: NormalisedText): string {
  const insertions = info.removed
    .map((item) => ({ at: item.normalisedIndex, value: item.value }))
    .sort((left, right) => left.at - right.at)

  let result = ''
  let cursor = 0
  for (const insertion of insertions) {
    const at = Math.max(cursor, Math.min(insertion.at, text.length))
    result += text.slice(cursor, at) + insertion.value
    cursor = at
  }
  return result + text.slice(cursor)
}
