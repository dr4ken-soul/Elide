import type { Crossing, FirestoreCrossing } from '../scene/schema'

const CAPACITY = 200
const ledger: Crossing[] = []

/** Adds a crossing to the in-memory ring buffer. No content is written to storage. */
export function addCrossing(entry: Crossing): Crossing[] {
  ledger.unshift(entry)
  if (ledger.length > CAPACITY) ledger.length = CAPACITY
  return [...ledger]
}

export function listCrossings(): Crossing[] {
  return [...ledger]
}

export function clearCrossings(): Crossing[] {
  ledger.length = 0
  return []
}

/** Builds the Firestore record: counts, provenance and policy version only. */
export function toFirestoreRecord(entry: Crossing, uid: string): FirestoreCrossing {
  return {
    uid,
    counts: entry.byType,
    flagged: entry.flaggedCount,
    scrubInference: entry.scrubInference,
    answerInference: entry.answerInference,
    policyVersion: entry.policyVersion,
    createdAt: entry.createdAt,
  }
}

/** Triggers a user-initiated JSON export. The manifest is included because the user asked for it. */
export function exportLedger(entries: Crossing[]): void {
  const blob = new Blob([JSON.stringify(entries, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `elide-ledger-${new Date().toISOString().slice(0, 10)}.json`
  anchor.click()
  URL.revokeObjectURL(url)
}
