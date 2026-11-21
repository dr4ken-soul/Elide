import type { FirebaseApp } from 'firebase/app'
import type { AI } from 'firebase/ai'
import type { Auth } from 'firebase/auth'
import type { Firestore } from 'firebase/firestore'
import type { RemoteConfig } from 'firebase/remote-config'
import type { RemotePolicy } from './store/policy'

const environment = import.meta.env

export const firebaseConfig = {
  apiKey: environment.VITE_FIREBASE_API_KEY ?? '',
  authDomain: environment.VITE_FIREBASE_AUTH_DOMAIN ?? '',
  projectId: environment.VITE_FIREBASE_PROJECT_ID ?? '',
  appId: environment.VITE_FIREBASE_APP_ID ?? '',
}

export const cloudModelDefault = environment.VITE_CLOUD_MODEL || 'gemini-3.5-flash-lite'
export const isConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId)

const debugToken = environment.VITE_APP_CHECK_DEBUG_TOKEN ?? ''
const siteKey = environment.VITE_RECAPTCHA_ENTERPRISE_SITE_KEY ?? ''

let app: FirebaseApp | null = null
let ai: AI | null = null
let auth: Auth | null = null
let database: Firestore | null = null
let remoteConfig: RemoteConfig | null = null
let uid: string | null = null
let remotePolicy: RemotePolicy | null = null

export interface FirebaseStatus {
  configured: boolean
  uid: string | null
  appCheck: 'debug token' | 'enforced' | 'not configured'
  remotePolicy: RemotePolicy | null
  cloudModel: string
}

export function currentUid(): string | null {
  return uid
}

export function getAIInstance(): AI | null {
  return ai
}

export function getDb(): Firestore | null {
  return database
}

export function currentCloudModel(): string {
  const fromConfig = remotePolicy?.cloud_model
  return typeof fromConfig === 'string' && fromConfig ? fromConfig : cloudModelDefault
}

export function firebaseStatus(): FirebaseStatus {
  return {
    configured: isConfigured,
    uid,
    appCheck: !isConfigured ? 'not configured' : debugToken ? 'debug token' : siteKey ? 'enforced' : 'not configured',
    remotePolicy,
    cloudModel: currentCloudModel(),
  }
}

/** Loads Firebase only when credentials exist, so the offline app stays small and usable. */
export async function initialiseFirebase(): Promise<FirebaseStatus> {
  if (!isConfigured || app) return firebaseStatus()

  const [{ initializeApp }, aiModule, { initializeAppCheck, ReCaptchaEnterpriseProvider }, { getAuth, signInAnonymously }, { getFirestore }, configModule] = await Promise.all([
    import('firebase/app'),
    import('firebase/ai'),
    import('firebase/app-check'),
    import('firebase/auth'),
    import('firebase/firestore'),
    import('firebase/remote-config'),
  ])

  if (debugToken) {
    ;(self as unknown as { FIREBASE_APPCHECK_DEBUG_TOKEN?: string }).FIREBASE_APPCHECK_DEBUG_TOKEN = debugToken
  }

  app = initializeApp(firebaseConfig)
  if (siteKey) {
    initializeAppCheck(app, {
      provider: new ReCaptchaEnterpriseProvider(siteKey),
      isTokenAutoRefreshEnabled: true,
    })
  }
  auth = getAuth(app)
  database = getFirestore(app)
  ai = aiModule.getAI(app, { backend: new aiModule.GoogleAIBackend() })
  remoteConfig = configModule.getRemoteConfig(app)
  remoteConfig.settings.minimumFetchIntervalMillis = 60_000

  try {
    const credential = await signInAnonymously(auth)
    uid = credential.user.uid
  } catch (error) {
    console.warn('Elide could not create an anonymous principal:', error)
  }

  try {
    await configModule.fetchAndActivate(remoteConfig)
    const getValue = configModule.getValue
    const read = (key: string): string => getValue(remoteConfig!, key).asString()
    const parse = <T,>(key: string): T | undefined => {
      const raw = read(key)
      if (!raw) return undefined
      try {
        return JSON.parse(raw) as T
      } catch {
        return undefined
      }
    }
    const version = Number(read('policy_version'))
    remotePolicy = {
      policy_version: Number.isFinite(version) && version > 0 ? version : undefined,
      mandatory_types: parse<string[]>('mandatory_types'),
      pattern_library: parse<Record<string, string>>('pattern_library'),
      always_withhold_terms: parse<string[]>('always_withhold_terms'),
      cloud_model: read('cloud_model') || undefined,
      scrub_chunk_words: Number(read('scrub_chunk_words')) || undefined,
    }
  } catch (error) {
    console.warn('Elide is using the bundled policy:', error)
  }

  return firebaseStatus()
}
