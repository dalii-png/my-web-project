import React from 'react'
// Pre-app: remove personal profile data from localStorage if it exists.
// This handles the case where old cached JS loads old localStorage data.
(function cleanupLegacyProfile() {
  const CLEANUP_MARKER = 'baoyan_profile_cleanup_v1'
  const DATA_KEY = 'baoyan_dashboard_data'
  try {
    if (localStorage.getItem(CLEANUP_MARKER)) return
    const raw = localStorage.getItem(DATA_KEY)
    if (!raw) return
    const data = JSON.parse(raw)
    if (data && typeof data === 'object' && data.profile) {
      data.profile = undefined
      localStorage.setItem(DATA_KEY, JSON.stringify(data))
    }
  } catch (e) {
    // Silently ignore - do not let corrupt localStorage crash the app
  }
  try { localStorage.setItem(CLEANUP_MARKER, '1') } catch {}
})();
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>,
)
