import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { AppData, DiaryEntry, DailyCheckIn } from "../types";
import { saveData } from "../utils/storage";
import { getStudyMinutesForDate, getCompletedPomodorosForDate, getTaskStatsForDate } from "../utils/studyStats";

function genId(): string { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }

function todayStr(): string { return new Date().toISOString().split("T")[0]; }

const defaultDiaryForm: Omit<DiaryEntry, "id"> = {
  date: todayStr(), completedTasks: "", mostImportantProgress: "", weaknesses: "",
  knowledgeMemo: "", interviewPractice: "", moodScore: 3, efficiencyScore: 3,
  tomorrowTop3: "", note: ""
};

export default function Diary({ data }: { data: AppData }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlDate = searchParams.get("date");
  const initialDate = urlDate || todayStr();
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [diaries, setDiaries] = useState<DiaryEntry[]>(data.diaries);
  useEffect(() => { setDiaries(data.diaries) }, [data.diaries]);
  const [checkIns, setCheckIns] = useState<DailyCheckIn[]>(data.dailyCheckIns || []);
  useEffect(() => { setCheckIns(data.dailyCheckIns || []) }, [data.dailyCheckIns]);
  const [showForm, setShowForm] = useState(false);
  const [editDiary, setEditDiary] = useState<DiaryEntry | null>(null);
  const [form, setForm] = useState<Omit<DiaryEntry, "id">>({ ...defaultDiaryForm, date: initialDate });
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [checkInContent, setCheckInContent] = useState("");
  const [checkInNote, setCheckInNote] = useState("");

  // Sync all data
  const syncAll = (d: DiaryEntry[], ci: DailyCheckIn[]) => {
    setDiaries(d); setCheckIns(ci);
    data.diaries = d;
    data.dailyCheckIns = ci;
    saveData(data);
  };

  const syncDiaries = (d: DiaryEntry[]) => {
    setDiaries(d); data.diaries = d; saveData(data);
  };

  const updateCheckIns = (ci: DailyCheckIn[]) => {
    setCheckIns(ci); data.dailyCheckIns = ci; saveData(data);
  };

  // Stats for selected date
  const stats = useMemo(() => ({
    studyMinutes: getStudyMinutesForDate(data, selectedDate),
    pomodoros: getCompletedPomodorosForDate(data, selectedDate),
    tasks: getTaskStatsForDate(data, selectedDate),
  }), [selectedDate, data.tasks, data.studySessions]);

  // Current diary entry for selected date
  const currentDiary = useMemo(() => diaries.find(d => d.date === selectedDate), [diaries, selectedDate]);

  // Current check-in for selected date
  const currentCheckIn = useMemo(() => checkIns.find(c => c.date === selectedDate), [checkIns, selectedDate]);

  // All diary entries sorted (for the list below)
  const sortedDiaries = useMemo(() => [...diaries].sort((a, b) => b.date.localeCompare(a.date)), [diaries]);

  // Streak
  const streakDays = useMemo(() => {
    if (checkIns.length === 0) return 0;
    const dates = [...new Set(checkIns.map(c => c.date))].sort().reverse();
    let streak = 1;
    for (let i = 1; i < dates.length; i++) {
      const prev = new Date(dates[i - 1]), curr = new Date(dates[i]);
      if (Math.abs((prev.getTime() - curr.getTime()) / 86400000 - 1) < 0.1) streak++; else break;
    }
    return streak;
  }, [checkIns]);

  // Week efficiency
  const weekEfficiency = useMemo(() => {
    return sortedDiaries.slice(0, 7).reverse().map(d => ({ date: d.date, score: d.efficiencyScore }));
  }, [sortedDiaries]);

  // Common weaknesses
  const commonWeaknesses = useMemo(() => {
    const words: Record<string, number> = {};
    diaries.forEach(d => { d.weaknesses.split(/[,，、\s]+/).filter(Boolean).forEach(w => { words[w] = (words[w] || 0) + 1; }); });
    return Object.entries(words).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [diaries]);

  // ---- Handlers ----
  const openAdd = () => {
    setForm({ ...defaultDiaryForm, date: selectedDate });
    setEditDiary(null); setShowForm(true);
  };

  const openEdit = (d: DiaryEntry) => {
    setForm(d); setEditDiary(d); setShowForm(true);
  };

  const saveDiary = () => {
    if (editDiary) {
      syncDiaries(diaries.map(d => d.id === editDiary.id ? { ...d, ...form } : d));
    } else {
      syncDiaries([...diaries, { ...form, id: genId() }]);
    }
    setShowForm(false);
  };

  const deleteDiary = (id: string) => syncDiaries(diaries.filter(d => d.id !== id));

  const doCheckIn = () => {
    const ci = [...checkIns];
    const existing = ci.find(c => c.date === selectedDate);
    const now = new Date().toISOString();
    if (existing) {
      existing.checkInTimes.push(now);
      existing.updatedAt = now;
    } else {
      ci.push({
        id: genId(), date: selectedDate, checkInTimes: [now],
        note: "", content: "", createdAt: now, updatedAt: now,
      });
    }
    updateCheckIns(ci);
  };

  const removeCheckInTime = (date: string, idx: number) => {
    const ci = [...checkIns];
    const entry = ci.find(c => c.date === date);
    if (!entry) return;
    entry.checkInTimes.splice(idx, 1);
    if (entry.checkInTimes.length === 0) {
      updateCheckIns(ci.filter(c => c.date !== date));
    } else {
      entry.updatedAt = new Date().toISOString();
      updateCheckIns(ci);
    }
  };

  const saveCheckInContent = () => {
    const ci = [...checkIns];
    const existing = ci.find(c => c.date === selectedDate);
    const now = new Date().toISOString();
    if (existing) {
      existing.content = checkInContent;
      existing.note = checkInNote;
      existing.updatedAt = now;
    } else if (checkInContent.trim() || checkInNote.trim()) {
      ci.push({
        id: genId(), date: selectedDate, checkInTimes: [],
        note: checkInNote, content: checkInContent, createdAt: now, updatedAt: now,
      });
    }
    updateCheckIns(ci);
    setCheckInContent("");
    setCheckInNote("");
  };

  // Handle date change
  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    setSearchParams(date === todayStr() ? {} : { date });
    // Load existing content for new date
    const ci = checkIns.find(c => c.date === date);
    setCheckInContent(ci?.content || "");
    setCheckInNote(ci?.note || "");
  };

  return (
    <div>
      <div className="page-header">
        <h2>每日反思日记</h2>
        <p>记录每日学习心得与打卡</p>
      </div>

      {/* Date selector */}
      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 20 }}>
        <input type="date" className="form-input" style={{ width: 180 }} value={selectedDate} onChange={e => handleDateChange(e.target.value)} />
        <button className="btn btn-outline btn-sm" onClick={() => handleDateChange(todayStr())}>今天</button>
        <span style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>
          连续打卡 {streakDays} 天
        </span>
      </div>

      {/* Day stats */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="section-title">{selectedDate} 学习概览</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
          <div style={{ textAlign: "center", padding: 8, background: "var(--color-bg)", borderRadius: 6 }}>
            <div style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>学习时长</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: "var(--color-primary)" }}>{stats.studyMinutes} 分钟</div>
          </div>
          <div style={{ textAlign: "center", padding: 8, background: "var(--color-bg)", borderRadius: 6 }}>
            <div style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>完成任务</div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>{stats.tasks.completed}/{stats.tasks.total}</div>
          </div>
          <div style={{ textAlign: "center", padding: 8, background: "var(--color-bg)", borderRadius: 6 }}>
            <div style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>番茄钟</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: "var(--color-accent)" }}>{stats.pomodoros} 个</div>
          </div>
        </div>
      </div>

      {/* Check-in section */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="section-title">打卡记录</div>
        <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12 }}>
          <button className="btn btn-accent" onClick={doCheckIn}>📝 打卡</button>
          <span style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>
            {currentCheckIn?.checkInTimes.length || 0} 次打卡
          </span>
        </div>

        {currentCheckIn && currentCheckIn.checkInTimes.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            {currentCheckIn.checkInTimes.map((time, idx) => (
              <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0", fontSize: 13 }}>
                <span>{new Date(time).toLocaleString("zh-CN")}</span>
                <button className="btn btn-outline btn-sm" style={{ color: "#ef4444", fontSize: 11, padding: "2px 8px" }}
                  onClick={() => removeCheckInTime(selectedDate, idx)}>×</button>
              </div>
            ))}
          </div>
        )}

        <div className="form-group">
          <label>学习内容</label>
          <textarea className="form-textarea" rows={3} value={checkInContent}
            onChange={e => setCheckInContent(e.target.value)} placeholder="今天学了什么..." />
        </div>
        <div className="form-group">
          <label>备注</label>
          <textarea className="form-textarea" rows={2} value={checkInNote}
            onChange={e => setCheckInNote(e.target.value)} placeholder="其他备注..." />
        </div>
        <button className="btn btn-primary btn-sm" onClick={saveCheckInContent}>保存打卡</button>
      </div>

      {/* Diary entry form */}
      <div style={{ marginBottom: 14, display: "flex", gap: 8 }}>
        {currentDiary ? (
          <button className="btn btn-outline btn-sm" onClick={() => openEdit(currentDiary)}>编辑当天日记</button>
        ) : (
          <button className="btn btn-accent btn-sm" onClick={openAdd}>+ 写今日日记</button>
        )}
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowForm(false); }}>
          <div className="modal" style={{ maxWidth: 600 }}><h3>{editDiary ? "编辑日记" : "新增日记"}</h3>
            <div className="form-group"><label>日期</label><input type="date" className="form-input" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
            <div className="grid-2" style={{ gap: 10 }}>
              <div className="form-group"><label>情绪评分 (1-5)</label>
                <div style={{ display: "flex", gap: 4, fontSize: 20 }}>{[1,2,3,4,5].map(n => <span key={n} style={{ cursor: "pointer", opacity: n <= form.moodScore ? 1 : 0.3 }} onClick={() => setForm({ ...form, moodScore: n })}>{n <= form.moodScore ? "😊" : "😐"}</span>)}</div>
              </div>
              <div className="form-group"><label>学习效率 (1-5)</label>
                <input type="range" min={1} max={5} value={form.efficiencyScore} onChange={e => setForm({ ...form, efficiencyScore: Number(e.target.value) })} style={{ width: "100%", marginTop: 8 }} />
                <div style={{ textAlign: "center", fontSize: 16, fontWeight: 600 }}>{form.efficiencyScore}/5</div>
              </div>
            </div>
            <div className="form-group"><label>今日完成任务</label><textarea className="form-textarea" rows={2} value={form.completedTasks} onChange={e => setForm({ ...form, completedTasks: e.target.value })} /></div>
            <div className="form-group"><label>今日最重要进展</label><textarea className="form-textarea" rows={2} value={form.mostImportantProgress} onChange={e => setForm({ ...form, mostImportantProgress: e.target.value })} /></div>
            <div className="form-group"><label>暴露的弱点</label><textarea className="form-textarea" rows={2} value={form.weaknesses} onChange={e => setForm({ ...form, weaknesses: e.target.value })} placeholder="用逗号分隔多个弱点" /></div>
            <div className="form-group"><label>记住的专业知识</label><textarea className="form-textarea" rows={2} value={form.knowledgeMemo} onChange={e => setForm({ ...form, knowledgeMemo: e.target.value })} /></div>
            <div className="form-group"><label>练习的面试题</label><textarea className="form-textarea" rows={2} value={form.interviewPractice} onChange={e => setForm({ ...form, interviewPractice: e.target.value })} /></div>
            <div className="form-group"><label>明天最重要的三件事</label><textarea className="form-textarea" rows={2} value={form.tomorrowTop3} onChange={e => setForm({ ...form, tomorrowTop3: e.target.value })} /></div>
            <div className="form-group"><label>备注</label><textarea className="form-textarea" rows={2} value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} /></div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button className="btn btn-outline" onClick={() => setShowForm(false)}>取消</button>
              <button className="btn btn-accent" onClick={saveDiary}>保存</button>
            </div>
          </div>
        </div>
      )}

      {/* History list */}
      <div className="grid-2" style={{ marginTop: 20 }}>
        <div className="card">
          <div className="section-title">最近7天学习效率</div>
          {weekEfficiency.length === 0 ? <div className="empty-state">暂无数据</div> : (
            <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 120, paddingTop: 10 }}>
              {weekEfficiency.map(d => (
                <div key={d.date} style={{ flex: 1, textAlign: "center" }}>
                  <div style={{ height: 80, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
                    <div style={{ width: 24, height: (d.score / 5 * 72) + "px", background: d.score >= 4 ? "#22c55e" : d.score >= 3 ? "#f47920" : "#ef4444", borderRadius: "4px 4px 0 0" }} />
                  </div>
                  <div style={{ fontSize: 10, color: "var(--color-text-secondary)" }}>{d.date.slice(5)}</div>
                  <div style={{ fontSize: 11, fontWeight: 600 }}>{d.score}/5</div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="card">
          <div className="section-title">最常出现的弱点</div>
          {commonWeaknesses.length === 0 ? <div className="empty-state">暂无数据</div> : (
            <div>{commonWeaknesses.map(([word, count]) => <div key={word} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--color-border)", fontSize: 13 }}><span>{word}</span><span className="badge badge-orange">{count}次</span></div>)}</div>
          )}
        </div>
      </div>

      {/* Diary list */}
      <div className="card" style={{ marginTop: 20 }}>
        <div className="section-title">历史日记</div>
        {sortedDiaries.map(d => {
          const expanded = expandedId === d.id;
          return (
            <div key={d.id} className="card" style={{ marginBottom: 10, padding: 14, background: "var(--color-bg)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }} onClick={() => setExpandedId(expanded ? null : d.id)}>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <span style={{ fontWeight: 600, fontSize: 15 }}>{d.date}</span>
                  <span style={{ fontSize: 12 }}>情绪: {"😊".repeat(d.moodScore)}{"😐".repeat(5 - d.moodScore)}</span>
                  <span style={{ fontSize: 12 }}>效率: {"★".repeat(d.efficiencyScore)}{"☆".repeat(5 - d.efficiencyScore)}</span>
                </div>
                <div style={{ display: "flex", gap: 4 }}>
                  <button className="btn btn-outline btn-sm" onClick={e => { e.stopPropagation(); openEdit(d); }}>编辑</button>
                  <button className="btn btn-outline btn-sm" style={{ color: "#ef4444" }} onClick={e => { e.stopPropagation(); deleteDiary(d.id); }}>删除</button>
                </div>
              </div>
              {expanded && (
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--color-border)" }}>
                  <div className="grid-2" style={{ gap: 10, fontSize: 13 }}>
                    <div><strong>完成任务：</strong><div style={{ color: "var(--color-text-secondary)", whiteSpace: "pre-wrap" }}>{d.completedTasks || "无"}</div></div>
                    <div><strong>最重要进展：</strong><div style={{ color: "var(--color-text-secondary)", whiteSpace: "pre-wrap" }}>{d.mostImportantProgress || "无"}</div></div>
                    <div><strong>暴露弱点：</strong><div style={{ color: "#ef4444", whiteSpace: "pre-wrap" }}>{d.weaknesses || "无"}</div></div>
                    <div><strong>专业知识：</strong><div style={{ color: "var(--color-text-secondary)", whiteSpace: "pre-wrap" }}>{d.knowledgeMemo || "无"}</div></div>
                    <div><strong>面试练习：</strong><div style={{ color: "var(--color-text-secondary)", whiteSpace: "pre-wrap" }}>{d.interviewPractice || "无"}</div></div>
                    <div><strong>明日三件事：</strong><div style={{ color: "var(--color-primary)", whiteSpace: "pre-wrap" }}>{d.tomorrowTop3 || "无"}</div></div>
                  </div>
                  {d.note && <div style={{ marginTop: 8, fontSize: 12, color: "var(--color-text-secondary)" }}>📝 {d.note}</div>}
                </div>
              )}
            </div>
          );
        })}
        {sortedDiaries.length === 0 && <div className="empty-state">还没有日记，选择日期后写第一篇吧</div>}
      </div>
    </div>
  );
}