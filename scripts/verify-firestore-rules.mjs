import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { assertFails, assertSucceeds, initializeTestEnvironment } from '@firebase/rules-unit-testing'

const rules = readFileSync(resolve('firestore.rules'), 'utf8')

const validRecord = (uid) => ({
  uid,
  counts: { NAME: 1, ID: 0, ACCOUNT: 0, ADDRESS: 0, CONTACT: 0, CUSTOM: 0 },
  flagged: 0,
  scrubInference: 'RULES_ONLY',
  answerInference: 'IN_CLOUD',
  policyVersion: 3,
  createdAt: Date.now(),
})

const testEnv = await initializeTestEnvironment({
  projectId: 'demo-elide',
  firestore: { rules, host: '127.0.0.1', port: 8080 },
})

try {
  const alice = testEnv.authenticatedContext('alice').firestore()
  const docId = `alice-${Date.now()}`

  await assertFails(
    alice.collection('crossings').doc(`with-text-${docId}`).set({ ...validRecord('alice'), text: 'patient name' }),
  )
  console.log('PASS: create with a text field is rejected by the key allowlist')

  await assertSucceeds(alice.collection('crossings').doc(docId).set(validRecord('alice')))

  const bob = testEnv.authenticatedContext('bob').firestore()
  await assertFails(bob.collection('crossings').doc(docId).get())
  await assertSucceeds(alice.collection('crossings').doc(docId).get())
  console.log('PASS: reading another uid crossing is rejected, reading your own succeeds')

  await assertFails(alice.collection('crossings').doc(docId).delete())
  console.log('PASS: delete is rejected, the ledger is append-only')

  console.log('All Firestore rule rejection checks passed.')
} finally {
  await testEnv.cleanup()
}
