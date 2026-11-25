import { afterEach, describe, expect, it, vi } from 'vitest'
import { readRoute } from '../src/app/router'

afterEach(() => vi.unstubAllGlobals())

describe('route detection', () => {
  it('opens the panel by default inside sidepanel.html', () => {
    vi.stubGlobal('window', { location: { pathname: '/sidepanel.html', hash: '' } })
    expect(readRoute()).toBe('/panel')
  })

  it('honours an explicit hash inside sidepanel.html', () => {
    vi.stubGlobal('window', { location: { pathname: '/sidepanel.html', hash: '#/ledger' } })
    expect(readRoute()).toBe('/ledger')
  })

  it('opens the landing page by default in the web app', () => {
    vi.stubGlobal('window', { location: { pathname: '/index.html', hash: '' } })
    expect(readRoute()).toBe('/')
  })

  it('reads an explicit hash in the web app', () => {
    vi.stubGlobal('window', { location: { pathname: '/index.html', hash: '#/app' } })
    expect(readRoute()).toBe('/app')
  })
})
