import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { firebaseStatus, getDb, initialiseFirebase, type FirebaseStatus } from '../firebase'
import { answer, CloudCallError } from '../ai/answer'
import { nanoAvailable, prepareOnDevice, scrub } from '../ai/scrub'
import { normalise } from '../scrub/normalise'
import { mask } from '../scrub/mask'
import { restore, type RestoreResult } from '../scrub/restore'
import { addCrossing, clearCrossings, exportLedger, listCrossings, toFirestoreRecord } from './ledger'
import { DEFAULT_POLICY, mergePolicy, type RemotePolicy } from './policy'
import { SAMPLES } from '../samples'
import { currentUid } from '../firebase'
import type { Crossing, InferenceSource, ManifestEntry, PolicyConfig, Span } from '../scene/schema'
import { emptyByType } from '../scene/schema'

export type DeviceAvailability = 'available' | 'downloadable' | 'downloading' | 'unavailable'

export interface DeviceState {
  availability: DeviceAvailability
  progress: number
  initialising: boolean
}

export interface AnswerState {
  stream: string
  result: RestoreResult | null
  source: InferenceSource | null
  error: string | null
  sending: boolean
  ms: number
  unknownTokens: string[]
}

interface SessionValue {
  status: FirebaseStatus
  policy: PolicyConfig
  remoteAvailable: boolean
  device: DeviceState
  text: string
  title: string
  question: string
  spans: Span[]
  manifest: ManifestEntry[]
  redacted: string
  scan: { source: InferenceSource; ms: number } | null
  scanning: boolean
  online: boolean
  answerState: AnswerState
  crossings: Crossing[]
  teamLedger: boolean
  toast: string | null
  setText: (value: string) => void
  setTitle: (value: string) => void
  setQuestion: (value: string) => void
  loadSample: (id: string) => void
  scanNow: () => Promise<void>
  prepare: () => Promise<void>
  send: () => Promise<void>
  setTeamLedger: (value: boolean) => void
  clearLedger: () => void
  exportLedger: () => void
  showToast: (message: string) => void
  savePolicy: (policy: PolicyConfig) => void
  applyRemotePolicy: () => void
}

const SessionContext = createContext<SessionValue | null>(null)

function useOnline(): boolean {
  const [online, setOnline] = useState(() => navigator.onLine)
  useEffect(() => {
    const up = (): void => setOnline(true)
    const down = (): void => setOnline(false)
    window.addEventListener('online', up)
    window.addEventListener('offline', down)
    return () => {
      window.removeEventListener('online', up)
      window.removeEventListener('offline', down)
    }
  }, [])
  return online
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<FirebaseStatus>(() => firebaseStatus())
  const [policy, setPolicy] = useState<PolicyConfig>(DEFAULT_POLICY)
  const [remoteAvailable, setRemoteAvailable] = useState(false)
  const [device, setDevice] = useState<DeviceState>(() => ({
    availability: nanoAvailable() ? 'downloadable' : 'unavailable',
    progress: 0,
    initialising: false,
  }))
  const [text, setText] = useState('')
  const [title, setTitle] = useState('')
  const [question, setQuestion] = useState('')
  const [spans, setSpans] = useState<Span[]>([])
  const [manifest, setManifest] = useState<ManifestEntry[]>([])
  const [redacted, setRedacted] = useState('')
  const [scan, setScan] = useState<{ source: InferenceSource; ms: number } | null>(null)
  const [scanning, setScanning] = useState(false)
  const [answerState, setAnswerState] = useState<AnswerState>({
    stream: '', result: null, source: null, error: null, sending: false, ms: 0, unknownTokens: [],
  })
  const [crossings, setCrossings] = useState<Crossing[]>(listCrossings)
  const [teamLedger, setTeamLedger] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const online = useOnline()
  const textRef = useRef(text)
  const policyRef = useRef(policy)
  textRef.current = text
  policyRef.current = policy

  useEffect(() => {
    let active = true
    initialiseFirebase().then((next) => {
      if (!active) return
      setStatus(next)
      if (next.remotePolicy) {
        setRemoteAvailable(true)
        setPolicy((current) => mergePolicy(current, next.remotePolicy as RemotePolicy))
      }
    })
    return () => { active = false }
  }, [])

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(null), 3200)
    return () => window.clearTimeout(timer)
  }, [toast])

  const scanNow = useCallback(async (): Promise<void> => {
    const current = textRef.current
    if (!current.trim()) {
      setSpans([])
      setManifest([])
      setRedacted('')
      setScan(null)
      return
    }
    setScanning(true)
    try {
      const result = await scrub(current, policyRef.current)
      const normalised = normalise(current).text
      const masked = mask(normalised, result.spans)
      setSpans(result.spans)
      setManifest(masked.map)
      setRedacted(masked.redacted)
      setScan({ source: result.source, ms: result.ms })
    } catch (error) {
      console.warn('Elide scan failed:', error)
      setSpans([])
      setScan(null)
    } finally {
      setScanning(false)
    }
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(() => { void scanNow() }, 400)
    return () => window.clearTimeout(timer)
  }, [text, policy, scanNow])

  const prepare = useCallback(async (): Promise<void> => {
    setDevice((current) => ({ ...current, initialising: true, availability: 'downloading' }))
    try {
      await prepareOnDevice((progress) => setDevice((current) => ({ ...current, progress })))
      setDevice({ availability: 'available', progress: 100, initialising: false })
      showToast('On-device model ready.')
      await scanNow()
    } catch (error) {
      console.warn('Elide device preparation failed:', error)
      setDevice({ availability: 'unavailable', progress: 0, initialising: false })
    }
  }, [scanNow])

  function showToast(message: string): void {
    setToast(message)
  }

  const send = useCallback(async (): Promise<void> => {
    const currentText = textRef.current
    if (!currentText.trim() || !question.trim() || !online) return

    setAnswerState((current) => ({ ...current, sending: true, error: null, stream: '', result: null, unknownTokens: [] }))
    let activeManifest = manifest
    let outbound = redacted
    if (scan === null || scan.source === undefined) {
      const result = await scrub(currentText, policyRef.current)
      const masked = mask(normalise(currentText).text, result.spans)
      activeManifest = masked.map
      outbound = masked.redacted
      setManifest(masked.map)
      setRedacted(masked.redacted)
      setScan({ source: result.source, ms: result.ms })
    }

    try {
      const result = await answer(outbound, question, (token) => {
        setAnswerState((current) => ({ ...current, stream: current.stream + token }))
      })
      const restored = restore(result.text, activeManifest)
      setAnswerState({
        stream: result.text,
        result: restored,
        source: result.source,
        error: null,
        sending: false,
        ms: result.ms,
        unknownTokens: restored.unknownTokens,
      })

      const byType = emptyByType()
      for (const entry of activeManifest) byType[entry.type] += 1
      const entry: Crossing = {
        id: crypto.randomUUID(),
        documentId: 'current',
        documentTitle: title || 'Untitled document',
        withheldCount: activeManifest.length,
        byType,
        flaggedCount: activeManifest.filter((item) => item.confidence === 'low').length,
        scrubInference: scan?.source ?? 'RULES_ONLY',
        answerInference: result.source,
        scrubMs: scan?.ms ?? 0,
        answerMs: result.ms,
        policyVersion: policyRef.current.version,
        createdAt: Date.now(),
        outbound,
        manifest: activeManifest,
      }
      setCrossings(addCrossing(entry))

      const database = getDb()
      if (teamLedger && database && currentUid()) {
        const record = toFirestoreRecord(entry, currentUid() ?? '')
        try {
          const { addDoc, collection, serverTimestamp } = await import('firebase/firestore')
          await addDoc(collection(database, 'crossings'), { ...record, createdAt: serverTimestamp() })
        } catch (error) {
          console.warn('Elide could not write the team ledger:', error)
        }
      }
    } catch (error) {
      setAnswerState((current) => ({
        ...current,
        sending: false,
        error: error instanceof CloudCallError ? error.message : 'The cloud call failed. Nothing was sent again. Your document is unchanged.',
      }))
    }
  }, [manifest, redacted, scan, question, online, title, teamLedger])

  function loadSample(id: string): void {
    const sample = SAMPLES.find((item) => item.id === id)
    if (!sample) return
    setTitle(sample.title)
    setText(sample.text)
    setQuestion(sample.question)
    setAnswerState({ stream: '', result: null, source: null, error: null, sending: false, ms: 0, unknownTokens: [] })
  }

  function savePolicy(next: PolicyConfig): void {
    setPolicy(next)
    showToast('Policy saved.')
  }

  function applyRemotePolicy(): void {
    if (!status.remotePolicy) return
    setPolicy((current) => mergePolicy(current, status.remotePolicy as RemotePolicy))
    showToast('Workspace policy applied.')
  }

  const value = useMemo<SessionValue>(() => ({
    status, policy, remoteAvailable, device, text, title, question, spans, manifest, redacted,
    scan, scanning, online, answerState, crossings, teamLedger, toast,
    setText, setTitle, setQuestion, loadSample, scanNow, prepare, send,
    setTeamLedger,
    clearLedger: () => setCrossings(clearCrossings()),
    exportLedger: () => exportLedger(listCrossings()),
    showToast,
    savePolicy,
    applyRemotePolicy,
  }), [status, policy, remoteAvailable, device, text, title, question, spans, manifest, redacted,
    scan, scanning, online, answerState, crossings, teamLedger, toast, scanNow, prepare, send])

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

export function useSession(): SessionValue {
  const context = useContext(SessionContext)
  if (!context) throw new Error('useSession must be used inside SessionProvider')
  return context
}
