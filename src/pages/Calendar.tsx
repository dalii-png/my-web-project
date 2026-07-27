import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AppData, Task } from "../types";
import { saveData } from "../utils/storage"
import { ymd, daysInMonth, dayOfWeek, todayStr, dateStr, parseYmd } from "../utils/dateUtils";
import {
  getTaskStatsForDate, getStudyMinutesForDate,
  getCompletedPomodorosForDate
} from "../utils/studyStats";

function genId(): string { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }

const WEEKDAY_LABELS = ["一", "二", "三", "四", "五", "六", "日"];

export default function Calendar({ data }: { data: AppData }) {
  const navigate = useNavigate();
  const today = useMemo(() => {
    const d = new Date();
    return ymd(d.getFullYear(), d.getMonth() + 1, d.getDate());
  }, []);
  const dt = parseYmd(today)!;

  const [year, setYear] = useState(dt.year);
  const [month, setMonth] = useState(dt.month);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");

  const prevMonth = () => { if (month === 1) { setYear(year - 1); setMonth(12); } else { setMonth(month - 1); } setSelectedDate(null); setShowTaskForm(false); };
  const nextMonth = () => { if (month === 12) { setYear(year + 1); setMonth(1); } else { setMonth(month + 1); } setSelectedDate(null); setShowTaskForm(false); };
  const goToday = () => { setYear(dt.year); setMonth(dt.month); setSelectedDate(today); };

  // Build calendar grid
  const { grid, firstDate, lastDate } = useMemo(() => {
    const firstDay = 1;
    const totalDays = daysInMonth(year, month);
    const startDow = dayOfWeek(year, month, firstDay);

    // Build 42-cell grid (6 weeks)
    const cells: { date: string; isCurrentMonth: boolean }[] = [];
    const first = ymd(year, month, 1);
    const last = ymd(year, month, totalDays);

    // Previous month fill
    let prevYear = year, prevMonth = month - 1;
    if (prevMonth === 0) { prevMonth = 12; prevYear--; }
    const prevDays = daysInMonth(prevYear, prevMonth);
    for (let i = startDow - 2; i >= 0; i--) {
      cells.push({ date: ymd(prevYear, prevMonth, prevDays - i), isCurrentMonth: false });
    }

    // Current month
    for (let d = 1; d <= totalDays; d++) {
      cells.push({ date: ymd(year, month, d), isCurrentMonth: true });
    }

    // Next month fill
    let nextYear = year, nextMonth = month + 1;
    if (nextMonth === 13) { nextMonth = 1; nextYear++; }
    const remaining = 42 - cells.length;
    for (let d = 1; d <= remaining; d++) {
      cells.push({ date: ymd(nextYear, nextMonth, d), isCurrentMonth: false });
    }

    return { grid: cells, firstDate: first, lastDate: last };
  }, [year, month]);

  // Pre-compute stats for all visible dates
  const statsMap = useMemo(() => {
    const map: Record<string, { total: number; completed: number; minutes: number; pomodoros: number }> = {};
    grid.forEach(cell => {
      map[cell.date] = {
        total: getTaskStatsForDate(data, cell.date).total,
        completed: getTaskStatsForDate(data, cell.date).completed,
        minutes: getStudyMinutesForDate(data, cell.date),
        pomodoros: getCompletedPomodorosForDate(data, cell.date),
      };
    });
    return map;
  }, [grid, data.tasks, data.studySessions]);

  // Selected date details
  const selectedStats = selectedDate ? (statsMap[selectedDate] || { total: 0, completed: 0, minutes: 0, pomodoros: 0 }) : null;
  const selectedTasks = useMemo(() => {
    if (!selectedDate) return [];
    return data.tasks.filter(t => t.date === selectedDate);
  }, [selectedDate, data.tasks]);

  const createTask = () => {
    if (!newTaskTitle.trim() || !selectedDate) return;
    const now = new Date().toISOString();
    const t: Task = {
      id: genId(), day: 0, phase: "", date: selectedDate,
      period: "全天", category: "跨专业",
      title: newTaskTitle.trim(), description: "", minimumTask: "",
      completed: false, priority: "中", note: "",
      createdAt: now, updatedAt: now,
      estimatedMinutes: 45, actualMinutes: 0, source: "user",
      parentId: undefined, sortOrder: 0, startTime: undefined, endTime: undefined, completedAt: undefined,
    };
    data.tasks = [...data.tasks, t];
    saveData(data);
    setNewTaskTitle("");
    setShowTaskForm(false);
  };

  // Navigate to pomodoro
  const openPomodoro = () => {
    if (selectedTasks.length === 1) {
      navigate("/pomodoro?taskId=" + selectedTasks[0].id);
    } else {
      navigate("/pomodoro");
    }
  };

  // Calculate if we have data for navigating
  const hasSelectedTasks = selectedTasks.length > 0;

  return (
    <div>
      <div className="page-header"><h2>日历</h2><p>月视图 - 查看每日任务和学习记录</p></div>

      {/* Month navigation */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button className="btn btn-outline btn-sm" onClick={prevMonth}>◀ 上月</button>
          <span style={{ fontSize: 18, fontWeight: 700, color: "var(--color-primary)" }}>{year} 年 {String(month).padStart(2, "0")} 月</span>
          <button className="btn btn-outline btn-sm" onClick={nextMonth}>下月 ▶</button>
        </div>
        <button className="btn btn-outline btn-sm" onClick={goToday}>今天</button>
      </div>

      {/* Calendar grid */}
      <div className="card">
        {/* Weekday headers */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 8 }}>
          {WEEKDAY_LABELS.map(d => (
            <div key={d} style={{ textAlign: "center", fontSize: 12, fontWeight: 600, color: "var(--color-text-secondary)", padding: "6px 0" }}>{d}</div>
          ))}
        </div>

        {/* Day cells */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
          {grid.map(cell => {
            const s = statsMap[cell.date] || { total: 0, completed: 0, minutes: 0, pomodoros: 0 };
            const isToday = cell.date === today;
            const isSelected = cell.date === selectedDate;
            const hasActivity = s.total > 0 || s.minutes > 0;
            return (
              <div
                key={cell.date}
                onClick={() => setSelectedDate(cell.date)}
                style={{
                  padding: 6, minHeight: 72, cursor: "pointer",
                  borderRadius: 6,
                  border: isSelected ? "2px solid var(--color-accent)" : "1px solid var(--color-border)",
                  background: isToday ? "#e8f0fe" : isSelected ? "#fff3e0" : cell.isCurrentMonth ? "var(--color-card)" : "#f9fafb",
                  opacity: cell.isCurrentMonth ? 1 : 0.5,
                }}
              >
                <div style={{ fontSize: 13, fontWeight: isToday ? 700 : 500, marginBottom: 4, color: isToday ? "var(--color-accent)" : "var(--color-text)" }}>
                  {cell.date.split("-")[2]}
                </div>
                {hasActivity && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    {s.total > 0 && <div style={{ fontSize: 10, color: "var(--color-text-secondary)" }}>{s.total} 任务{s.completed > 0 ? "(" + s.completed + "✓)" : ""}</div>}
                    {s.minutes > 0 && <div style={{ fontSize: 10, color: "var(--color-primary)" }}>{s.minutes} 分钟</div>}
                    {s.pomodoros > 0 && <div style={{ fontSize: 10, color: "var(--color-accent)" }}>{s.pomodoros} 🍅</div>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected date details */}
      {selectedDate && selectedStats && (
        <div className="card" style={{ marginTop: 20 }}>
          <div className="section-title">{selectedDate} 详情</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 14 }}>
            <div style={{ textAlign: "center", padding: 8, background: "var(--color-bg)", borderRadius: 6 }}>
              <div style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>任务</div>
              <div style={{ fontSize: 20, fontWeight: 700 }}>{selectedStats.total} <span style={{ fontSize: 12, color: "var(--color-success)" }}>({selectedStats.completed} 完成)</span></div>
            </div>
            <div style={{ textAlign: "center", padding: 8, background: "var(--color-bg)", borderRadius: 6 }}>
              <div style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>学习时长</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "var(--color-primary)" }}>{selectedStats.minutes} 分钟</div>
            </div>
            <div style={{ textAlign: "center", padding: 8, background: "var(--color-bg)", borderRadius: 6 }}>
              <div style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>番茄钟</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "var(--color-accent)" }}>{selectedStats.pomodoros} 个</div>
            </div>
            <div style={{ textAlign: "center", padding: 8, background: "var(--color-bg)", borderRadius: 6, display: "flex", flexDirection: "column", gap: 6, alignItems: "center", justifyContent: "center" }}>
              <button className="btn btn-outline btn-sm" style={{ width: "100%" }} onClick={() => setShowTaskForm(!showTaskForm)}>+ 新建任务</button>
              <button className="btn btn-accent btn-sm" style={{ width: "100%" }} onClick={openPomodoro}>🍅 番茄钟</button><button className="btn btn-outline btn-sm" style={{ width: "100%" }} onClick={() => navigate("/diary?date=" + selectedDate)}>📖 查看反思</button>
            </div>
          </div>

          {/* Task form */}
          {showTaskForm && (
            <div style={{ marginBottom: 14, padding: 12, background: "var(--color-bg)", borderRadius: 6 }}>
              <div className="form-group"><label>任务标题</label>
                <input className="form-input" value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") createTask(); }}
                  placeholder="输入任务名称，按回车创建" autoFocus />
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn btn-accent btn-sm" onClick={createTask}>创建</button>
                <button className="btn btn-outline btn-sm" onClick={() => setShowTaskForm(false)}>取消</button>
              </div>
            </div>
          )}

          {/* Task list */}
          {selectedTasks.length === 0 ? (
            <div style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>当天无任务</div>
          ) : (
            <div>
              {selectedTasks.map(t => (
                <div key={t.id} className="task-item" style={t.completed ? { opacity: 0.6 } : {}}>
                  <input type="checkbox" checked={t.completed} onChange={() => {
                    t.completed = !t.completed;
                    t.completedAt = t.completed ? new Date().toISOString() : undefined;
                    t.updatedAt = new Date().toISOString();
                    saveData(data);
                  }} />
                  <div className="task-info">
                    <div className="task-title" style={t.completed ? { textDecoration: "line-through" } : {}}>{t.title}</div>
                    <div className="task-meta">
                      <span className="badge badge-blue">{t.category}</span>
                      <span className={`badge ${t.priority === "高" ? "badge-red" : t.priority === "中" ? "badge-orange" : "badge-gray"}`}>{t.priority}</span>
                      {t.estimatedMinutes ? <span style={{ fontSize: 11 }}>{t.estimatedMinutes} 分钟</span> : null}
                      {t.actualMinutes ? <span style={{ fontSize: 11, color: "var(--color-primary)" }}>已学 {t.actualMinutes} 分钟</span> : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}