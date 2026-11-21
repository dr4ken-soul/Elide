import type { GenerativeModel, Schema } from 'firebase/ai'
import { currentCloudModel, getAIInstance, isConfigured } from '../firebase'
import { detectRuleSpans } from '../scrub/deterministic'
import { mergeSpans } from '../scrub/merge'
import { normalise } from '../scrub/normalise'
import { SCRUB_SCHEMA } from '../scene/schema'
import { SCRUB_SYSTEM_PROMPT } from '../scene/prompt'
import type { EntityType, InferenceSource, PolicyConfig, Span } from '../scene/schema'

export interface ScrubResult {
  spans: Span[]
  source: InferenceSource
  ms: number
}

let scrubModel: GenerativeModel | null = null
let modelCloudName = ''
let prepared = false

async function modelFor(name: string): Promise<GenerativeModel | null> {
  const ai = getAIInstance()
  if (!ai) return null
  if (scrubModel && modelCloudName === name) return scrubModel
  const { InferenceMode, getGenerativeModel } = await import('firebase/ai')
  scrubModel = getGenerativeModel(ai, {
    mode: InferenceMode.PREFER_ON_DEVICE,
    onDeviceParams: {
      createOptions: {
        expectedInputs: [{ type: 'text', languages: ['en'] }],
        expectedOutputs: [{ type: 'text', languages: ['en'] }],
        initialPrompts: [{ role: 'system', content: [{ type: 'text', value: SCRUB_SYSTEM_PROMPT }] }],
      },
      promptOptions: { responseConstraint: SCRUB_SCHEMA },
    },
    inCloudParams: {
      model: name,
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: SCRUB_SCHEMA as unknown as Schema,
        temperature: 0,
      },
    },
  })
  modelCloudName = name
  prepared = false
  return scrubModel
}

/** True when Chrome exposes a built-in language model and Firebase has been configured. */
export function nanoAvailable(): boolean {
  const scope = globalThis as unknown as { LanguageModel?: unknown; ai?: unknown }
  return isConfigured && (Boolean(scope.LanguageModel) || Boolean(scope.ai))
}

/** Must be called from a user gesture before the first on-device request. */
export async function prepareOnDevice(onProgress: (progress: number) => void): Promise<void> {
  const model = await modelFor(currentCloudModel())
  if (!model) return
  try {
    await model.initializeDeviceModel((value) => onProgress(Math.round(value * 100)))
    prepared = true
    onProgress(100)
  } catch (error) {
    console.warn('Elide could not prepare the on-device model:', error)
    throw error
  }
}

export function isPrepared(): boolean {
  return prepared
}

interface Chunk {
  text: string
  offset: number
}

/** Splits at paragraph boundaries, falling back to sentence boundaries for long paragraphs. */
export function chunkDocument(text: string, wordsPerChunk: number): Chunk[] {
  const budget = Math.max(200, wordsPerChunk)
  const chunks: Chunk[] = []
  let buffer = ''
  let bufferOffset = 0
  let words = 0
  let cursor = 0

  const wordCount = (value: string): number => value.trim().split(/\s+/).filter(Boolean).length
  const flush = (): void => {
    if (buffer) chunks.push({ text: buffer, offset: bufferOffset })
    buffer = ''
    words = 0
  }

  for (const paragraph of text.split(/(?<=\n\n)/)) {
    if (wordCount(paragraph) > budget) {
      let withinParagraph = 0
      for (const sentence of paragraph.split(/(?<=[.!?])\s+/)) {
        const sentenceWords = wordCount(sentence)
        if (buffer && words + sentenceWords > budget) {
          flush()
          bufferOffset = cursor + withinParagraph
        }
        if (!buffer) bufferOffset = cursor + withinParagraph
        buffer += sentence
        words += sentenceWords
        withinParagraph += sentence.length
      }
    } else {
      if (buffer && words + wordCount(paragraph) > budget) {
        flush()
        bufferOffset = cursor
      }
      if (!buffer) bufferOffset = cursor
      buffer += paragraph
      words += wordCount(paragraph)
    }
    cursor += paragraph.length
  }
  flush()
  return chunks.length > 0 ? chunks : [{ text: '', offset: 0 }]
}

const VALID_TYPES: EntityType[] = ['NAME', 'ID', 'ACCOUNT', 'ADDRESS', 'CONTACT', 'CUSTOM']

function parseModelSpans(value: unknown, offset: number, limit: number): Span[] {
  if (!value || typeof value !== 'object') return []
  const raw = (value as { spans?: unknown }).spans
  if (!Array.isArray(raw)) return []
  const spans: Span[] = []
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue
    const candidate = item as Record<string, unknown>
    const type = candidate.type as EntityType
    const start = Number(candidate.start)
    const end = Number(candidate.end)
    if (!VALID_TYPES.includes(type) || !Number.isInteger(start) || !Number.isInteger(end)) continue
    if (start < 0 || end <= start || end > limit) continue
    spans.push({
      type,
      start: start + offset,
      end: end + offset,
      token: typeof candidate.token === 'string' ? candidate.token : '',
      confidence: candidate.confidence === 'low' ? 'low' : 'high',
      origin: 'model',
    })
  }
  return spans
}

/**
 * Runs the deterministic passes first, then one structured model call per chunk.
 * Provenance comes from the SDK's inferenceSource; no timing inference is used.
 */
export async function scrub(text: string, policy: PolicyConfig): Promise<ScrubResult> {
  const started = performance.now()
  const info = normalise(text)
  const rules = detectRuleSpans(info.text, policy)
  const model = await modelFor(currentCloudModel())

  if (!model || !navigator.onLine) {
    return { spans: mergeSpans(rules), source: 'RULES_ONLY', ms: performance.now() - started }
  }

  const modelSpans: Span[] = []
  let source: InferenceSource = 'RULES_ONLY'
  let modelResponded = false

  try {
    for (const chunk of chunkDocument(info.text, policy.chunkWords)) {
      if (!chunk.text) continue
      const response = await model.generateContent(chunk.text)
      const parsed = parseModelSpans(JSON.parse(response.response.text()), chunk.offset, info.text.length)
      modelSpans.push(...parsed)
      const inference = String(response.response.inferenceSource ?? '')
      if (inference === 'ON_DEVICE' || inference === 'IN_CLOUD') source = inference
      modelResponded = true
    }
  } catch (error) {
    console.warn('Elide fell back to deterministic rules for this scrub:', error)
  }

  if (!modelResponded) return { spans: mergeSpans(rules), source: 'RULES_ONLY', ms: performance.now() - started }

  return { spans: mergeSpans([...rules, ...modelSpans]), source, ms: performance.now() - started }
}
