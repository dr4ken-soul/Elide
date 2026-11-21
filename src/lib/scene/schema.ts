export type EntityType = 'NAME' | 'ID' | 'ACCOUNT' | 'ADDRESS' | 'CONTACT' | 'CUSTOM'
export type Confidence = 'high' | 'low'
export type SpanOrigin = 'rule' | 'model'
export type InferenceSource = 'ON_DEVICE' | 'IN_CLOUD' | 'RULES_ONLY'

export interface Span {
  type: EntityType
  start: number
  end: number
  token: string
  confidence: Confidence
  origin: SpanOrigin
}

export interface ManifestEntry {
  token: string
  type: EntityType
  original: string
  start: number
  end: number
  confidence: Confidence
}

export interface PolicyConfig {
  version: number
  mandatoryTypes: EntityType[]
  enabledTypes: EntityType[]
  patternLibrary: Record<string, string>
  alwaysWithholdTerms: string[]
  customTerms: string[]
  chunkWords: number
}

export interface Crossing {
  id: string
  documentId: string
  documentTitle: string
  withheldCount: number
  byType: Record<EntityType, number>
  flaggedCount: number
  scrubInference: InferenceSource
  answerInference: InferenceSource
  scrubMs: number
  answerMs: number
  policyVersion: number
  createdAt: number
  outbound?: string
  manifest?: ManifestEntry[]
}

export interface FirestoreCrossing {
  uid: string
  counts: Record<EntityType, number>
  flagged: number
  scrubInference: InferenceSource
  answerInference: InferenceSource
  policyVersion: number
  createdAt: unknown
}

export const ENTITY_TYPES: EntityType[] = ['NAME', 'ID', 'ACCOUNT', 'ADDRESS', 'CONTACT', 'CUSTOM']

export function emptyByType(): Record<EntityType, number> {
  return { NAME: 0, ID: 0, ACCOUNT: 0, ADDRESS: 0, CONTACT: 0, CUSTOM: 0 }
}

export const SCRUB_SCHEMA = {
  type: 'object',
  properties: {
    spans: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          type: { type: 'string', enum: ['NAME', 'ID', 'ACCOUNT', 'ADDRESS', 'CONTACT', 'CUSTOM'] },
          start: { type: 'integer' },
          end: { type: 'integer' },
          token: { type: 'string' },
          confidence: { type: 'string', enum: ['high', 'low'] },
        },
        required: ['type', 'start', 'end', 'token', 'confidence'],
      },
    },
  },
  required: ['spans'],
}
