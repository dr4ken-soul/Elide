import { createWriteStream, existsSync, statSync } from 'node:fs'
import { pipeline } from 'node:stream/promises'

const url = process.argv[2]
const destination = process.argv[3]
if (!url || !destination) throw new Error('Usage: node download-file.mjs <url> <destination>')

const headers = {}
if (existsSync(destination)) {
  headers.Range = `bytes=${statSync(destination).size}-`
}

const response = await fetch(url, { headers, signal: AbortSignal.timeout(600000) })
if (!response.ok && response.status !== 206) throw new Error(`Download failed: ${response.status}`)
if (response.status === 200 && existsSync(destination)) {
  const { rmSync } = await import('node:fs')
  rmSync(destination)
}

await pipeline(response.body, createWriteStream(destination, { flags: headers.Range ? 'a' : 'w' }))
console.log(`Downloaded ${destination}`)
