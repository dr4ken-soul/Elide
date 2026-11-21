import type { GenerativeModel } from 'firebase/ai'
import { currentCloudModel, getAIInstance } from '../firebase'
import { buildAnswerPrompt } from '../scene/prompt'
import type { InferenceSource } from '../scene/schema'

export const CLOUD_FAILURE_COPY = 'The cloud call failed. Nothing was sent again. Your document is unchanged.'

export class CloudCallError extends Error {
  constructor() {
    super(CLOUD_FAILURE_COPY)
    this.name = 'CloudCallError'
  }
}

let answerModel: GenerativeModel | null = null
let modelName = ''

async function modelFor(name: string): Promise<GenerativeModel | null> {
  const ai = getAIInstance()
  if (!ai) return null
  if (answerModel && modelName === name) return answerModel
  const { InferenceMode, getGenerativeModel } = await import('firebase/ai')
  answerModel = getGenerativeModel(ai, {
    mode: InferenceMode.ONLY_IN_CLOUD,
    inCloudParams: { model: name, generationConfig: { temperature: 0.2 } },
  })
  modelName = name
  return answerModel
}

/** Streams a cloud-only answer. The prompt contains redacted text and the question, never originals. */
export async function answer(
  redacted: string,
  question: string,
  onToken: (token: string) => void,
): Promise<{ text: string; source: InferenceSource; ms: number }> {
  const started = performance.now()
  const model = await modelFor(currentCloudModel())
  if (!model || !navigator.onLine) throw new CloudCallError()

  try {
    const stream = await model.generateContentStream(buildAnswerPrompt(redacted, question))
    let text = ''
    for await (const chunk of stream.stream) {
      const token = chunk.text()
      if (token) {
        text += token
        onToken(token)
      }
    }
    const finalResponse = await stream.response
    const source: InferenceSource = String(finalResponse.inferenceSource ?? 'IN_CLOUD') === 'ON_DEVICE'
      ? 'ON_DEVICE'
      : 'IN_CLOUD'
    return { text, source, ms: performance.now() - started }
  } catch (error) {
    if (error instanceof CloudCallError) throw error
    console.warn('Elide cloud call failed:', error)
    throw new CloudCallError()
  }
}
