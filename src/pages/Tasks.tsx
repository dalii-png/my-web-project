import { useState, useMemo, useEffect } from "react";
import { AppData, Task, TaskCategory, Priority, Period } from "../types";
import { saveData } from "../utils/storage";

function genId(): string { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }

const CATEGORIES: TaskCategory[] = ["论文", "专业课", "跨专业", "文献热点", "材料", "中文面试", "英语面试", "复盘"];
const PRIORITIES: Priority[] = ["高", "中", "低"];
const PERIODS: Period[] = ["上午", "下午", "晚上", "全天"];
const IS_RECAP_DAYS = [7, 14, 21, 28];

type DateFilter = "全部" | "今日" | "明日" | "本周" | "30天计划" | "自定义";

const defaultForm = (): Partial<Task> => ({
  title: "", description: "", minimumTask: "",
  day: 0, phase: "", date: new Date().toISOString().split("T")[0],
  period: "全天" as Period, category: "跨专业" as TaskCategory,
  completed: false, priority: "中" as Priority, note: "",
  estimatedMinutes: 45, parentId: undefined, source: "user",
});

function todayStr(): string { return new Date().toISOString().split("T")[0]; }
function tomorrowStr(): string { const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().split("T")[0]; }
function weekStartStr(): string {
  const d = new Date(); d.setDate(d.getDate() - d.getDay()); return d.toISOString().split("T")[0];
}
function weekEndStr(): string {
  const d = new Date(); d.setDate(d.getDate() - d.getDay() + 6); return d.toISOString().split("T")[0];
}

export default function Tasks({ data }: { data: AppData }) {
  const [tasks, setTasks] = useState<Task[]>(data.tasks);
  useEffect(() => { setTasks(data.tasks) }, [data.tasks]);
  const [dateFilter, setDateFilter] = useState<DateFilter>("全部");
  const [customDate, setCustomDate] = useState(todayStr());
  const [filterCategory, setFilterCategory] = useState<TaskCategory | "全部">("全部");
  const [filterCompleted, setFilterCompleted] = useState<"全部" | "未完成" | "已完成">("全部");
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<Task | null>(null);
  const [form, setForm] = useState<Partial<Task>>(defaultForm());
  const [deferTarget, setDeferTarget] = useState<Task | null>(null);
  const [deferDate, setDeferDate] = useState(tomorrowStr());

  const syncSave = (updated: Task[]) => { setTasks(updated); data.tasks = updated; saveData(data); };

  const toggleComplete = (task: Task) => {
    syncSave(tasks.map(t => t.id === task.id ? { ...t, completed: !t.completed, completedAt: !t.completed ? new Date().toISOString() : undefined, updatedAt: new Date().toISOString() } : t));
  };

  const completeAllDay = (dateKey: string, taskList: Task[]) => {
    syncSave(tasks.map(t => taskList.some(dt => dt.id === t.id) ? { ...t, completed: true, completedAt: new Date().toISOString(), updatedAt: new Date().toISOString() } : t));
  };

  const deleteTask = (taskId: string) => {
    const hasChildren = tasks.some(t => t.parentId === taskId);
    const children = tasks.filter(t => t.parentId === taskId);
    if (hasChildren && !confirm("该任务有子任务删除时将一并删除。确定删除？")) return;
    syncSave(tasks.filter(t => t.id !== taskId && !children.some(c => c.id === t.id)));
  };

  const openAdd = () => { setForm(defaultForm()); setEditTarget(null); setShowForm(true); };

  const openEdit = (task: Task) => { setForm({ ...task }); setEditTarget(task); setShowForm(true); };

  const saveTask = () => {
    if (!form.title) return;
    const now = new Date().toISOString();
    if (editTarget) {
      syncSave(tasks.map(t => t.id === editTarget.id ? { ...t, ...form, updatedAt: now } as Task : t));
    } else {
      const newT: Task = {
        id: genId(), day: form.day || 0, phase: form.phase || "",
        period: (form.period as Period) || "全天",
        category: (form.category as TaskCategory) || "跨专业",
        title: form.title || "", description: form.description || "",
        minimumTask: form.minimumTask || "", completed: false,
        priority: (form.priority as Priority) || "中", note: form.note || "",
        createdAt: now, completedAt: undefined,
        date: form.date || todayStr(), startTime: form.startTime,
        endTime: form.endTime, estimatedMinutes: form.estimatedMinutes ?? 45,
        actualMinutes: form.actualMinutes ?? 0, parentId: form.parentId,
        sortOrder: form.sortOrder ?? 0, source: form.source || "user",
        updatedAt: now,
      };
      syncSave([...tasks, newT]);
    }
    setShowForm(false);
  };

  const openDefer = (task: Task) => { setDeferTarget(task); setDeferDate(tomorrowStr()); };

  const executeDefer = () => {
    if (!deferTarget) return;
    syncSave(tasks.map(t => t.id === deferTarget.id ? { ...t, date: deferDate, day: 0, updatedAt: new Date().toISOString() } : t));
    setDeferTarget(null);
  };

  const openSubtask = (parent: Task) => {
    setForm({ ...defaultForm(), parentId: parent.id, category: parent.category, title: "" });
    setEditTarget(null); setShowForm(true);
  };

  // --- Filtering ---
  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      if (filterCategory !== "全部" && t.category !== filterCategory) return false;
      if (filterCompleted === "已完成" && !t.completed) return false;
      if (filterCompleted === "未完成" && t.completed) return false;
      return true;
    });
  }, [tasks, filterCategory, filterCompleted]);

  // Date-filtered tasks
  const dateFiltered = useMemo(() => {
    if (dateFilter === "30天计划") return filteredTasks.filter(t => t.day >= 1 && t.day <= 30);
    if (dateFilter === "今日") return filteredTasks.filter(t => t.date === todayStr() || (t.day > 0 && t.date === undefined && t.day === dayOf30()));
    if (dateFilter === "明日") return filteredTasks.filter(t => t.date === tomorrowStr());
    if (dateFilter === "本周") return filteredTasks.filter(t => t.date && t.date >= weekStartStr() && t.date <= weekEndStr());
    if (dateFilter === "自定义") return filteredTasks.filter(t => t.date === customDate);
    return filteredTasks;
  }, [filteredTasks, dateFilter, customDate]);

  function dayOf30(): number {
    const start = new Date(data.startDate);
    const now = new Date();
    return Math.max(1, Math.min(30, Math.floor((now.getTime() - start.getTime()) / 86400000) + 1));
  }

  // Group by date or day
  const grouped = useMemo(() => {
    if (dateFilter === "30天计划") {
      const map: Record<number, Task[]> = {};
      dateFiltered.forEach(t => { if (!map[t.day]) map[t.day] = []; map[t.day].push(t); });
      return Object.entries(map).sort((a, b) => Number(a[0]) - Number(b[0])).map(([day, ts]) => ({ key: "Day " + day, label: "Day " + day, isRecap: IS_RECAP_DAYS.includes(Number(day)), tasks: ts }));
    }
    const map: Record<string, Task[]> = {};
    dateFiltered.forEach(t => {
      const k = t.date || "无日期";
      if (!map[k]) map[k] = []; map[k].push(t);
    });
    return Object.entries(map).sort((a, b) => a[0].localeCompare(b[0])).map(([key, ts]) => ({ key, label: key, isRecap: false, tasks: ts }));
  }, [dateFiltered, dateFilter]);

  const toggleGroup = (key: string) => {
    const next = new Set(expandedDays);
    if (next.has(key)) next.delete(key); else next.add(key);
    setExpandedDays(next);
  };

  const parentTasks = tasks.filter(t => !t.parentId);

  return (
    <div>
      <div className="page-header"><h2>30天任务清单</h2><p>管理每日学习任务</p></div>

      {/* Date filter buttons */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
        <div className="filter-bar">
          {(["全部","今日","明日","本周","30天计划","自定义"] as DateFilter[]).map(f => (
            <button key={f} className={`btn btn-outline btn-sm ${dateFilter === f ? "active" : ""}`} onClick={() => setDateFilter(f)}>{f}</button>
          ))}
          {dateFilter === "自定义" && (
            <input type="date" className="form-input" style={{ width: 150 }} value={customDate} onChange={e => setCustomDate(e.target.value)} />
          )}
        </div>
        <button className="btn btn-accent btn-sm" onClick={openAdd}>+ 新建任务</button>
      </div>

      {/* Category & Completion filters */}
      <div className="filter-bar">
        <select className="form-select" style={{ width: 140 }} value={filterCategory} onChange={e => setFilterCategory(e.target.value as TaskCategory | "全部")}>
          <option value="全部">全部模块</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className="form-select" style={{ width: 120 }} value={filterCompleted} onChange={e => setFilterCompleted(e.target.value as "全部" | "未完成" | "已完成")}>
          <option value="全部">全部状态</option><option value="未完成">未完成</option><option value="已完成">已完成</option>
        </select>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowForm(false); }}>
          <div className="modal" style={{ maxWidth: 620 }}><h3>{editTarget ? "编辑任务" : "新建任务"}</h3>
            <div className="form-group"><label>标题 *</label><input className="form-input" value={form.title || ""} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
            <div className="grid-2" style={{ gap: 10 }}>
              <div className="form-group"><label>日期</label><input type="date" className="form-input" value={form.date || ""} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
              <div className="form-group"><label>时间段</label><select className="form-select" value={form.period} onChange={e => setForm({ ...form, period: e.target.value as Period })}>{PERIODS.map(p => <option key={p} value={p}>{p}</option>)}</select></div>
              <div className="form-group"><label>开始时间</label><input type="time" className="form-input" value={form.startTime || ""} onChange={e => setForm({ ...form, startTime: e.target.value })} /></div>
              <div className="form-group"><label>结束时间</label><input type="time" className="form-input" value={form.endTime || ""} onChange={e => setForm({ ...form, endTime: e.target.value })} /></div>
              <div className="form-group"><label>预计时长(分钟)</label><input type="number" min={1} className="form-input" value={form.estimatedMinutes ?? 45} onChange={e => setForm({ ...form, estimatedMinutes: Number(e.target.value) })} /></div>
              <div className="form-group"><label>类别</label><select className="form-select" value={form.category} onChange={e => setForm({ ...form, category: e.target.value as TaskCategory })}>{CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
              <div className="form-group"><label>优先级</label><select className="form-select" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value as Priority })}>{PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}</select></div>
              <div className="form-group"><label>父任务</label><select className="form-select" value={form.parentId || ""} onChange={e => setForm({ ...form, parentId: e.target.value || undefined })}>
                <option value="">无</option>
                {parentTasks.filter(t => t.id !== editTarget?.id).map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
              </select></div>
            </div>
            <div className="form-group"><label>描述</label><textarea className="form-textarea" rows={2} value={form.description || ""} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
            <div className="form-group"><label>最小任务</label><input className="form-input" value={form.minimumTask || ""} onChange={e => setForm({ ...form, minimumTask: e.target.value })} /></div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button className="btn btn-outline" onClick={() => setShowForm(false)}>取消</button>
              <button className="btn btn-accent" onClick={saveTask}>{editTarget ? "保存" : "添加"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Defer Modal */}
      {deferTarget && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setDeferTarget(null); }}>
          <div className="modal" style={{ maxWidth: 400 }}><h3>延期任务</h3>
            <p style={{ marginBottom: 14, fontSize: 13 }}>将 <strong>{deferTarget.title}</strong> 延期到：</p>
            <div className="form-group"><input type="date" className="form-input" value={deferDate} onChange={e => setDeferDate(e.target.value)} /></div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button className="btn btn-outline" onClick={() => setDeferTarget(null)}>取消</button>
              <button className="btn btn-accent" onClick={executeDefer}>确认延期</button>
            </div>
          </div>
        </div>
      )}

      {/* Task Groups */}
      {grouped.map(g => {
        const expanded = expandedDays.has(g.key);
        const gCompleted = g.tasks.filter(t => t.completed).length;
        const gTotal = g.tasks.length;
        const gRate = gTotal > 0 ? Math.round((gCompleted / gTotal) * 100) : 0;

        return (
          <div key={g.key} className="card task-card">
            <div className="task-card-header" onClick={() => toggleGroup(g.key)} style={{ cursor: "pointer" }}>
              <div>
                <h3>{g.label} {g.isRecap && <span className="badge badge-orange">机动/复盘日</span>}</h3>
                <span style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>完成 {gCompleted}/{gTotal} &middot; {gRate}%</span>
              </div>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <div className="progress-bar" style={{ width: 100 }}>
                  <div className={`progress-fill ${gRate === 100 ? "green" : ""}`} style={{ width: gRate + "%" }} />
                </div>
                <button className="btn btn-outline btn-sm" onClick={e => { e.stopPropagation(); completeAllDay(g.key, g.tasks); }}>全部完成</button>
                <span style={{ fontSize: 18, transition: "transform 0.2s", transform: expanded ? "rotate(90deg)" : "" }}>&#9654;</span>
              </div>
            </div>

            {expanded && (
              <>
                {g.isRecap && (
                  <div style={{ padding: "8px 12px", background: "#ffedd5", borderRadius: 6, marginBottom: 12, fontSize: 12 }}>
                    <strong>当天验收标准：</strong>完成本周所有核心任务的复盘检查。
                  </div>
                )}
                {PERIODS.filter(p => p !== "全天").map(period => {
                  const pts = g.tasks.filter(t => t.period === period);
                  if (pts.length === 0) return null;
                  return renderTaskGroup(period, pts, toggleComplete, tasks, syncSave, openEdit, openDefer, openSubtask, deleteTask); })}
                {(() => {
                  const pts = g.tasks.filter(t => t.period === "全天" || !t.period);
                  if (pts.length === 0) return null;
                  return renderTaskGroup("全天", pts, toggleComplete, tasks, syncSave, openEdit, openDefer, openSubtask, deleteTask); })()}
              </>
            )}
          </div>
        );
      })}
      {grouped.length === 0 && <div className="empty-state">无匹配任务</div>}

      {/* Inline helper: render task group */}
    </div>
  );
}

// === Inline render helpers (extracted to avoid JSX-hoisting issues) ===

function renderTaskItem(t: Task, allInGroup: Task[], toggleComplete: (t: Task) => void, tasks: Task[], syncSave: (updated: Task[]) => void, openEdit: (t: Task) => void, openDefer: (t: Task) => void, openSubtask: (t: Task) => void, deleteTask: (id: string) => void): JSX.Element {
  const subtasks = allInGroup.filter(st => st.parentId === t.id);
  const isChild = !!t.parentId;

  return (
    <div key={t.id}>
      <div className="task-item" style={isChild ? { marginLeft: 24, borderLeft: "2px solid var(--color-accent)", paddingLeft: 10 } : {}}>
        <input type="checkbox" checked={t.completed} onChange={() => toggleComplete(t)} />
        <div className="task-info">
          <div className="task-title" style={t.completed ? { textDecoration: "line-through", opacity: 0.6 } : {}}>
            {isChild && <span style={{ fontSize: 10, color: "var(--color-accent)", marginRight: 4 }}>&#8627;</span>}
            {t.title}
            {t.source === "user" && <span className="badge badge-blue" style={{ marginLeft: 6, fontSize: 9 }}>自定义</span>}
          </div>
          <div className="task-meta">
            <span className="badge badge-blue">{t.category}</span>
            <span className={`badge ${t.priority === "高" ? "badge-red" : t.priority === "中" ? "badge-orange" : "badge-gray"}`}>{t.priority}</span>
            {t.startTime && <span style={{ fontSize: 11 }}>{t.startTime}{t.endTime ? "-" + t.endTime : ""}</span>}
            {t.estimatedMinutes ? <span style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>{t.estimatedMinutes}分钟</span> : null}
          </div>
          {t.description && <div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginTop: 2 }}>{t.description}</div>}
          <input className="note-input" placeholder="备注..." value={t.note} onChange={e => {
            syncSave(tasks.map(x => x.id === t.id ? { ...x, note: e.target.value, updatedAt: new Date().toISOString() } : x));
          }} />
          <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
            <button className="btn btn-outline btn-sm" onClick={() => openEdit(t)}>编辑</button>
            <button className="btn btn-outline btn-sm" onClick={() => openDefer(t)}>延期</button>
            {!t.parentId && <button className="btn btn-outline btn-sm" onClick={() => openSubtask(t)}>+子任务</button>}
            <button className="btn btn-outline btn-sm" style={{ color: "#ef4444" }} onClick={() => deleteTask(t.id)}>删除</button>
          </div>
        </div>
      </div>
      {subtasks.map(st => renderTaskItem(st, allInGroup, toggleComplete, tasks, syncSave, openEdit, openDefer, openSubtask, deleteTask))}
    </div>
  );
}

function renderTaskGroup(label: string, pts: Task[], toggleComplete: (t: Task) => void, tasks: Task[], syncSave: (updated: Task[]) => void, openEdit: (t: Task) => void, openDefer: (t: Task) => void, openSubtask: (t: Task) => void, deleteTask: (id: string) => void): JSX.Element {
  const parents = pts.filter(t => !t.parentId);
  const orphans = pts.filter(t => t.parentId && !parents.some(p => p.id === t.parentId));

  return (
    <div className="task-period" key={label}>
      <h4>{label}</h4>
      {parents.map(t => renderTaskItem(t, pts, toggleComplete, tasks, syncSave, openEdit, openDefer, openSubtask, deleteTask))}
      {orphans.map(t => renderTaskItem(t, pts, toggleComplete, tasks, syncSave, openEdit, openDefer, openSubtask, deleteTask))}
    </div>
  );
}