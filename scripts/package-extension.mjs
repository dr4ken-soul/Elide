import { cpSync, existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const dist = join(root, 'dist')
const build = join(root, 'extension', 'build')

if (!existsSync(dist)) throw new Error('Build the web app before packaging the extension')

mkdirSync(build, { recursive: true })
cpSync(dist, build, { recursive: true })
cpSync(join(root, 'extension', 'manifest.json'), join(build, 'manifest.json'))
cpSync(join(root, 'extension', 'icons'), join(build, 'icons'), { recursive: true })
console.log('Extension packaged into extension/build')
