import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './app/App'
import { SessionProvider } from './lib/store/session'
import './styles/globals.css'

const container = document.getElementById('root')
if (!container) throw new Error('Elide could not find the root element')

createRoot(container).render(
  <StrictMode>
    <SessionProvider>
      <App />
    </SessionProvider>
  </StrictMode>,
)
