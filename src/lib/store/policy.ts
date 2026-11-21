import type { EntityType, PolicyConfig } from '../scene/schema'
import { ENTITY_TYPES } from '../scene/schema'

export const DEFAULT_POLICY: PolicyConfig = {
  version: 3,
  mandatoryTypes: ['ID', 'ACCOUNT'],
  enabledTypes: [...ENTITY_TYPES],
  patternLibrary: {
    ID_NINO: '\\b[A-Z]{2}\\d{6}[A-D]\\b',
    ID_SSN: '\\b\\d{3}-\\d{2}-\\d{4}\\b',
    ADDRESS_POSTCODE: '\\b[A-Z]{1,2}\\d[A-Z\\d]?\\s?\\d[A-Z]{2}\\b',
  },
  alwaysWithholdTerms: [],
  customTerms: [],
  chunkWords: 2800,
}

export const CATEGORY_LABELS: Record<EntityType, string> = {
  NAME: 'Person names',
  ID: 'Record and patient IDs',
  ACCOUNT: 'Account and card numbers',
  ADDRESS: 'Postal addresses',
  CONTACT: 'Email and phone',
  CUSTOM: 'Custom terms',
}

export interface RemotePolicy {
  policy_version?: number
  mandatory_types?: string[]
  pattern_library?: Record<string, string>
  always_withhold_terms?: string[]
  cloud_model?: string
  scrub_chunk_words?: number
}

/** Merges a Remote Config payload over the bundled defaults without ever trusting its shape. */
export function mergePolicy(base: PolicyConfig, remote: RemotePolicy | null | undefined): PolicyConfig {
  if (!remote) return base
  const validTypes: EntityType[] = ENTITY_TYPES
  return {
    version: typeof remote.policy_version === 'number' ? remote.policy_version : base.version,
    mandatoryTypes: Array.isArray(remote.mandatory_types)
      ? remote.mandatory_types.filter((type): type is EntityType => validTypes.includes(type as EntityType))
      : base.mandatoryTypes,
    enabledTypes: base.enabledTypes,
    patternLibrary: remote.pattern_library && typeof remote.pattern_library === 'object'
      ? Object.fromEntries(Object.entries(remote.pattern_library).filter(([, value]) => typeof value === 'string'))
      : base.patternLibrary,
    alwaysWithholdTerms: Array.isArray(remote.always_withhold_terms)
      ? remote.always_withhold_terms.filter((term): term is string => typeof term === 'string')
      : base.alwaysWithholdTerms,
    customTerms: base.customTerms,
    chunkWords: typeof remote.scrub_chunk_words === 'number' && remote.scrub_chunk_words > 0
      ? remote.scrub_chunk_words
      : base.chunkWords,
  }
}

export function patternCount(policy: PolicyConfig, type: EntityType): number {
  return Object.keys(policy.patternLibrary).filter((key) => key.startsWith(`${type}_`)).length
    + (type === 'CUSTOM' ? policy.customTerms.length + policy.alwaysWithholdTerms.length : 0)
    + (type === 'CONTACT' ? 2 : 0)
    + (type === 'ACCOUNT' ? 1 : 0)
}
