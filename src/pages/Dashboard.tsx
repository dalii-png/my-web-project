import { AppData, MODULES, Task } from '../types'
import { saveData } from '../utils/storage'
import { getTodayStudyMinutes, getWeekStudyMinutes, getMonthStudyMinutes, getTodayPomodoros, getWeekPomodoros, getMonthPomodoros } from '../utils/studyStats'

function calcCompletion(tasks: Task[]): number {
  if (tasks.length === 0) return 0
  return Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100)
}

function calcTodayCompletion(tasks: Task[], day: number): number {
  const today = new Date().toISOString().split("T")[0]
  const todayTasks = tasks.filter(t => t.date === today || (t.date === undefined && t.day === day))
  if (todayTasks.length === 0) return 100
  return Math.round((todayTasks.filter(t => t.completed).length / todayTasks.length) * 100)
}

const moduleTaskMap: Record<string, string[]> = {
  '目标定位': ['跨专业'],
  '论文攻坚': ['论文'],
  '专业基础': ['专业课', '文献热点'],
  '简历深挖': ['材料', '跨专业'],
  '中英文面试': ['中文面试', '英语面试'],
  '压力面': ['复盘'],
  '材料归档': ['材料'],
}

export default function Dashboard({ data }: { data: AppData }) {
  const tasks = data.tasks
  const total = tasks.length
  const completed = tasks.filter(t => t.completed).length
  const totalRate = total > 0 ? Math.round((completed / total) * 100) : 0

  const startDate = new Date(data.startDate)
  const today = new Date()
  const elapsedDays = Math.max(1, Math.min(30, Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1))
  const remainingDays = Math.max(0, 30 - elapsedDays)
  const todayRate = calcTodayCompletion(tasks, elapsedDays)

  const todayStr = new Date().toISOString().split("T")[0]
  const todayTasks = tasks.filter(t => t.date === todayStr || (t.date === undefined && t.day === elapsedDays))
  const morningTasks = todayTasks.filter(t => t.period === '上午')
  const afternoonTasks = todayTasks.filter(t => t.period === '下午')
  const eveningTasks = todayTasks.filter(t => t.period === '晚上')

  const moduleProgress = MODULES.map(m => {
    const cats = moduleTaskMap[m] || []
    const modTasks = tasks.filter(t => cats.includes(t.category))
    return {
      name: m,
      completed: modTasks.filter(t => t.completed).length,
      total: modTasks.length,
      rate: modTasks.length > 0 ? Math.round((modTasks.filter(t => t.completed).length / modTasks.length) * 100) : 0,
    }
  })

  const papers = data.papers

  const handleToggle = (task: Task) => {
    task.completed = !task.completed
    task.completedAt = task.completed ? new Date().toISOString() : undefined
    saveData(data)
  }

  return (
    <div>
      <div className="page-header">
        <h2>总进度看板</h2>
        <p>保研冲刺30天，第 {elapsedDays}/30 天，剩余 {remainingDays} 天</p>
      </div>
      <div className="stat-cards">
        <div className="stat-card"><div className="stat-label">总任务数</div><div className="stat-value">{total}</div></div>
        <div className="stat-card"><div className="stat-label">已完成</div><div className="stat-value">{completed}</div></div>
        <div className="stat-card"><div className="stat-label">总体完成率</div><div className="stat-value">{totalRate}%</div><div className="progress-bar" style={{ marginTop: 8 }}><div className="progress-fill" style={{ width: totalRate + '%' }} /></div></div>
        <div className="stat-card"><div className="stat-label">今日完成率</div><div className="stat-value">{todayRate}%</div><div className="progress-bar" style={{ marginTop: 8 }}><div className="progress-fill green" style={{ width: todayRate + '%' }} /></div></div>
        <div className="stat-card"><div className="stat-label">当前天数</div><div className="stat-value">{elapsedDays}<span className="stat-sub">/30天</span></div></div>
        <div className="stat-card"><div className="stat-label">剩余天数</div><div className="stat-value" style={{ color: remainingDays <= 5 ? '#ef4444' : undefined }}>{remainingDays}<span className="stat-sub">天</span></div></div>
      </div>
      <div className="grid-2">
        <div className="card">
          <div className="section-title">七大模块进度</div>
          {moduleProgress.map(m => (
            <div key={m.name} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 500 }}>{m.name}</span>
                <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{m.completed}/{m.total} · {m.rate}%</span>
              </div>
              <div className="progress-bar" style={{ height: 6 }}>
                <div className={`progress-fill ${m.rate >= 80 ? 'green' : ''}`} style={{ width: m.rate + '%' }} />
              </div>
            </div>
          ))}
        </div>
        <div className="card">
          <div className="section-title">今日任务（Day {elapsedDays}）</div>
          {todayTasks.length === 0 ? (
            <div className="empty-state">今日任务已完成</div>
          ) : (
            <>
              {['上午', '下午', '晚上'].map(period => {
                const pts = period === '上午' ? morningTasks : period === '下午' ? afternoonTasks : eveningTasks
                if (pts.length === 0) return null
                return (
                  <div className="task-period" key={period}>
                    <h4>{period}</h4>
                    {pts.map(t => (
                      <div key={t.id} className={`task-item ${t.completed ? 'task-completed' : ''}`}>
                        <input type="checkbox" checked={t.completed} onChange={() => handleToggle(t)} />
                        <div className="task-info">
                          <div className="task-title">{t.title}</div>
                          <div className="task-meta">
                            <span className="badge badge-blue">{t.category}</span>
                            {t.priority === '高' && <span className="badge badge-red">高优先</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              })}
            </>
          )}
        </div>
      </div>
      <div className="card" style={{ marginTop: 20 }}>
        <div className="section-title">论文状态</div>
        <div className="grid-2">
          {papers.map(p => (
            <div key={p.id} style={{ padding: 12, background: 'var(--color-bg)', borderRadius: 8 }}>
              <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8 }}>{p.title}</div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <span className="badge badge-orange">{p.status}</span>
                <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>v{p.version}</span>
                <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>修改于 {p.lastModified}</span>
              </div>
              <div style={{ marginTop: 10 }}>
                <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                  问题: {p.issues.filter(i => i.status === '已完成').length}/{p.issues.length} 已完成
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="card" style={{ marginTop: 20 }}>
        <div className="section-title">今日提醒</div>
        {todayTasks.filter(t => !t.completed).length === 0 ? (
          <div className="empty-state">今日任务已完成</div>
        ) : (
          <div>
            <p style={{ marginBottom: 8, color: 'var(--color-accent)', fontWeight: 500 }}>
              当前未完成任务：{todayTasks.filter(t => !t.completed).length} 个
            </p>
            <ul style={{ paddingLeft: 18, fontSize: 13 }}>
              {todayTasks.filter(t => !t.completed).map(t => (
                <li key={t.id} style={{ marginBottom: 4 }}>{t.title} <span className={`badge ${t.priority === '高' ? 'badge-red' : t.priority === '中' ? 'badge-orange' : 'badge-gray'}`}>{t.priority}</span></li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}