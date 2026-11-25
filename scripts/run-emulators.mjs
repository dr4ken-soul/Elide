import { spawn } from 'node:child_process'
import { existsSync, readdirSync } from 'node:fs'
import { join, resolve } from 'node:path'

const root = process.cwd()
const jdkRoot = join(root, 'tools', 'jdk')
const versions = existsSync(jdkRoot) ? readdirSync(jdkRoot) : []
const version = versions.find((name) => existsSync(join(jdkRoot, name, 'bin', 'java.exe')))

if (!version) throw new Error('Portable JDK missing. Download a JDK 21 zip into tools/jdk and extract it there.')

const javaHome = join(jdkRoot, version)
const environment = {
  ...process.env,
  JAVA_HOME: javaHome,
  PATH: `${join(javaHome, 'bin')};${process.env.PATH ?? ''}`,
  FIREBASE_EMULATORS_PATH: join(root, 'tools', 'emulators'),
  TMP: join(root, 'tools', 'tmp'),
  TEMP: join(root, 'tools', 'tmp'),
  NO_UPDATE_NOTIFIER: '1',
  CI: '1',
}

const child = spawn(
  process.execPath,
  [resolve('node_modules/firebase-tools/lib/bin/firebase.js'), 'emulators:start', '--only', 'firestore', '--project', 'demo-elide'],
  { cwd: root, env: environment, stdio: 'inherit' },
)

child.on('exit', (code) => process.exit(code ?? 0))
