import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import Tasks from './pages/Tasks'
import Papers from './pages/Papers'
import Materials from './pages/Materials'
import Questions from './pages/Questions'
import Pressure from './pages/Pressure'
import Diary from './pages/Diary'
import Schools from './pages/Schools'
import Pomodoro from './pages/Pomodoro'
import Calendar from './pages/Calendar'
import Settings from './pages/Settings'
import { useState } from 'react'
import { loadData, saveDataSafe } from './utils/storage'
import { getDefaultData } from './data/defaultData'
import { AppData } from './types'

function App() {
  const [data, setData] = useState<AppData>(() => {
    const existing = loadData()
    if (existing) return existing
    const defaults = getDefaultData()
    saveDataSafe(defaults) // best-effort initial save
    return defaults
  })

  const handleDataChange = (nextData: AppData): boolean => {
    const result = saveDataSafe(nextData)
    if (!result.success) {
      console.error('[App] saveDataSafe failed:', result.error)
      return false
    }
    setData(nextData)
    return true
  }

  return (
    <Layout data={data}>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard data={data} />} />
        <Route path="/tasks" element={<Tasks data={data} />} />
        <Route path="/papers" element={<Papers data={data} />} />
        <Route path="/materials" element={<Materials data={data} />} />
        <Route path="/questions" element={<Questions data={data} />} />
        <Route path="/pressure" element={<Pressure data={data} />} />
        <Route path="/diary" element={<Diary data={data} />} />
        <Route path="/calendar" element={<Calendar data={data} />} />
        <Route path="/pomodoro" element={<Pomodoro data={data} />} />
        <Route path="/schools" element={<Schools data={data} />} />
        <Route path="/settings" element={<Settings data={data} onDataChange={handleDataChange} />} />
      </Routes>
    </Layout>
  )
}

export default App