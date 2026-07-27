import { NavLink } from 'react-router-dom'
import { ReactNode } from 'react'
import { AppData } from '../../types'

const navItems = [
  { label: '总进度看板', path: '/dashboard' },
  { label: '30天任务清单', path: '/tasks' },
  { label: '论文攻坚', path: '/papers' },
  { label: '材料收纳库', path: '/materials' },
  { label: '导师问题库', path: '/questions' },
  { label: '压力面题库', path: '/pressure' },
  { label: '每日反思日记', path: '/diary' },
  { label: '日历', path: '/calendar' },
  { label: '番茄钟', path: '/pomodoro' },
  { label: '院校预推免', path: '/schools' },
   { label: '数据备份与设置', path: '/settings' },
]

export default function Layout({ children }: { children: ReactNode; data: AppData }) {
  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1>郭欣雨</h1>
          <div className="subtitle">保研冲刺作战仪表盘</div>
        </div>
        <nav className="sidebar-nav">
          <div className="nav-section">导航</div>
          {navItems.map(item => (
            <NavLink key={item.path} to={item.path}
              className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="main-content">{children}</main>
    </div>
  )
}