import { AppData, Task } from '../types'

const STORAGE_KEY = 'baoyan_dashboard_data'
const VERSION_KEY = 'baoyan_dashboard_version'
const CURRENT_VERSION = 4

export function loadData(): AppData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const data = JSON.parse(raw) as AppData
    const version = data.version || 1
    if (version < CURRENT_VERSION) {
      const migrated = migrateData(data, version)
      saveDataSafe(migrated)
      return migrated
    }
    return data
  } catch (e) { console.warn('[baoyan] localStorage parse failed, clearing'); try { localStorage.removeItem(STORAGE_KEY) } catch {} return null }
}

export function saveData(data: AppData): void {
  data.version = CURRENT_VERSION
  data.lastUpdated = new Date().toISOString()
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function saveDataSafe(data: AppData): { success: boolean; error?: string } {
  try {
    data.version = CURRENT_VERSION
    data.lastUpdated = new Date().toISOString()
    const json = JSON.stringify(data)
    localStorage.setItem(STORAGE_KEY, json)
    return { success: true }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    const isQuota = (typeof DOMException !== "undefined" && e instanceof DOMException && (e.name === "QuotaExceededError" || e.name === "NS_ERROR_DOM_QUOTA_REACHED")) || msg.includes("quota") || msg.includes("Quota") || msg.includes("storage") || msg.includes("Quota")
    return { success: false, error: isQuota ? "localStorage 容量不足" : "保存失败: " + msg }
  }
}

export function clearData(): void {
  localStorage.removeItem(STORAGE_KEY)
  localStorage.removeItem(VERSION_KEY)
}

export function exportJSON(data: AppData): string { return JSON.stringify(data, null, 2) }

export function importJSON(json: string): AppData { return JSON.parse(json) as AppData }

export function exportTasksCSV(data: AppData): string {
  const h = ['天','阶段','时间段','类别','标题','描述','最小任务','已完成','优先级','备注','日期','开始时间','结束时间','预计时长']
  const rows = data.tasks.map(t => [t.day,t.phase,t.period,t.category,t.title,t.description,t.minimumTask,t.completed?'是':'否',t.priority,t.note,t.date||'',t.startTime||'',t.endTime||'',t.estimatedMinutes||''].map(v => '"'+String(v).replace(/"/g,'""')+'"').join(','))
  return [h.join(','), ...rows].join('\n')
}

// === Data Migration ===

function migrateData(data: AppData, fromVersion: number): AppData {
  try {
    const backupKey = 'baoyan_dashboard_backup_' + new Date().toISOString().replace(/[:.]/g, '-')
    if (!localStorage.getItem(backupKey)) {
      localStorage.setItem(backupKey, JSON.stringify(data))
    }
  } catch {}

  try {
    if (fromVersion < 2) { data = migrateV1toV2(data) }
    if (fromVersion < 3) { data = migrateV2toV3(data) }
    if (fromVersion < 4) { data = migrateV3toV4(data) }
    data.version = CURRENT_VERSION
  } catch { throw new Error('Migration failed') }
  return data
}

function migrateV3toV4(data: AppData): AppData {
  (data as unknown as Record<string, unknown>).dailyCheckIns = (data as unknown as Record<string, unknown>).dailyCheckIns || []
  return data
}

function migrateV2toV3(data: AppData): AppData {
  (data as unknown as Record<string, unknown>).studySessions = (data as unknown as Record<string, unknown>).studySessions || []
  return data
}

function migrateV1toV2(data: AppData): AppData {
  const now = new Date().toISOString()
  data.tasks = data.tasks.map(t => {
    const tAny = t as unknown as Record<string, unknown>
    return {
      ...t,
      source: (tAny.source === 'user' ? 'user' : 'default') as 'default' | 'user',
      updatedAt: (tAny.updatedAt as string) || t.createdAt || now,
      estimatedMinutes: typeof tAny.estimatedMinutes === 'number' ? tAny.estimatedMinutes as number : 45,
      actualMinutes: typeof tAny.actualMinutes === 'number' ? tAny.actualMinutes as number : 0,
      startTime: (tAny.startTime as string) || undefined,
      endTime: (tAny.endTime as string) || undefined,
      parentId: (tAny.parentId as string) || undefined,
      sortOrder: typeof tAny.sortOrder === 'number' ? tAny.sortOrder as number : 0,
    }
  })
  ;(data as unknown as Record<string, unknown>).studySessions = (data as unknown as Record<string, unknown>).studySessions || []
  return data
}