import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { AppData, StudySession, PomodoroMode, Task } from "../types";
import { saveData } from "../utils/storage";

function genId(): string { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }

const MODES: { mode: PomodoroMode; focus: number; break: number; label: string }[] = [
  { mode: "25/5", focus: 25, break: 5, label: "25/5 番茄钟" },
  { mode: "50/10", focus: 50, break: 10, label: "50/10 深度专注" },
  { mode: "custom", focus: 25, break: 5, label: "自定义" },
];

export default function Pomodoro({ data }: { data: AppData }) {
  const [searchParams] = useSearchParams();
  const preselectedTaskId = searchParams.get("taskId");

  // Mode
  const [selectedMode, setSelectedMode] = useState<PomodoroMode>("25/5");
  const [customFocus, setCustomFocus] = useState(25);
  const [customBreak, setCustomBreak] = useState(5);

  // Task binding
  const [boundTaskId, setBoundTaskId] = useState<string>(preselectedTaskId || "");

  // Session state
  const [status, setStatus] = useState<"idle" | "focusing" | "paused" | "break" | "completed">("idle");
  const [sessionId, setSessionId] = useState<string>("");
  const [sessionStartReal, setSessionStartReal] = useState<number>(0);
  const [accumulatedMs, setAccumulatedMs] = useState(0);
  const [pausedAtReal, setPausedAtReal] = useState<number>(0);
  const [focusMinutes, setFocusMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);
  const [displayTime, setDisplayTime] = useState("25:00");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Derived
  const modeConfig = useMemo(() => MODES.find(m => m.mode === selectedMode)!, [selectedMode]);
  const boundTask = useMemo(() => boundTaskId ? data.tasks.find(t => t.id === boundTaskId) : undefined, [boundTaskId, data.tasks]);
  const incompleteTasks = useMemo(() => data.tasks.filter(t => !t.completed && t.title), [data.tasks]);

  // Current session data for display
  const currentSession = useMemo(() => {
    if (!sessionId) return null;
    const actualMin = Math.max(0, Math.floor(accumulatedMs / 60000));
    return {
      startedAt: new Date(sessionStartReal).toLocaleString("zh-CN"),
      plannedFocus: focusMinutes,
      accumulatedMs,
    };
  }, [sessionId, sessionStartReal, accumulatedMs, focusMinutes]);

  // Timer tick
  const updateDisplay = useCallback(() => {
    if (status === "focusing") {
      const elapsed = Date.now() - sessionStartReal + accumulatedMs;
      const remaining = focusMinutes * 60 * 1000 - elapsed;
      const remainingSec = Math.max(0, Math.ceil(remaining / 1000));
      setDisplayTime(formatTime(remainingSec));

      // Auto-complete when time's up
      if (remainingSec <= 0) {
        completeSession();
      }
    } else if (status === "break") {
      const elapsed = Date.now() - sessionStartReal;
      const remaining = breakMinutes * 60 * 1000 - elapsed;
      const remainingSec = Math.max(0, Math.ceil(remaining / 1000));
      setDisplayTime(formatTime(remainingSec));
      if (remainingSec <= 0) {
        resetState();
      }
    }
  }, [status, sessionStartReal, accumulatedMs, focusMinutes, breakMinutes]);

  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (status === "focusing" || status === "break") {
      timerRef.current = setInterval(updateDisplay, 200);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [status, updateDisplay]);

  // Start
  const startSession = () => {
    let fm = 25, bm = 5;
    if (selectedMode === "25/5") { fm = 25; bm = 5; }
    else if (selectedMode === "50/10") { fm = 50; bm = 10; }
    else { fm = customFocus; bm = customBreak; }
    setFocusMinutes(fm); setBreakMinutes(bm);
    setDisplayTime(formatTime(fm * 60));

    const now = Date.now();
    const newSessionId = genId();

    // Save running session to localStorage
    const session: StudySession = {
      id: newSessionId, taskId: boundTaskId || undefined,
      mode: selectedMode, plannedMinutes: fm, breakMinutes: bm,
      actualMinutes: 0, startedAt: new Date().toISOString(),
      status: "running", createdAt: new Date().toISOString(),
    };
    data.studySessions = [...(data.studySessions || []), session];
    saveData(data);

    setSessionId(newSessionId); setSessionStartReal(now);
    setAccumulatedMs(0); setStatus("focusing");
  };

  // Pause
  const pauseSession = () => {
    if (status !== "focusing") return;
    const now = Date.now();
    const elapsed = now - sessionStartReal;
    const newAccumulated = accumulatedMs + elapsed;
    setAccumulatedMs(newAccumulated);
    setPausedAtReal(now);
    setStatus("paused");

    // Save paused state
    const sessions = [...(data.studySessions || [])];
    const idx = sessions.findIndex(s => s.id === sessionId);
    if (idx >= 0) {
      sessions[idx] = { ...sessions[idx], pausedAt: new Date().toISOString(), actualMinutes: Math.floor(newAccumulated / 60000), status: "paused", updatedAt: new Date().toISOString() };
      data.studySessions = sessions; saveData(data);
    }
  };

  // Resume
  const resumeSession = () => {
    if (status !== "paused") return;
    setSessionStartReal(Date.now()); setStatus("focusing");
    const sessions = [...(data.studySessions || [])];
    const idx = sessions.findIndex(s => s.id === sessionId);
    if (idx >= 0) {
      sessions[idx] = { ...sessions[idx], pausedAt: undefined, status: "running", updatedAt: new Date().toISOString() };
      data.studySessions = sessions; saveData(data);
    }
  };

  // Complete
  const completeSession = () => {
    if (status !== "focusing" && status !== "paused") return;
    const now = Date.now();
    let finalMs = accumulatedMs;
    if (status === "focusing") { finalMs += now - sessionStartReal; }

    const finalMin = Math.round(finalMs / 60000);
    const sessions = [...(data.studySessions || [])];
    const idx = sessions.findIndex(s => s.id === sessionId);

    if (finalMin > 0) {
      if (idx >= 0) {
        sessions[idx] = { ...sessions[idx], endedAt: new Date().toISOString(), actualMinutes: finalMin, status: "completed", pausedAt: undefined, updatedAt: new Date().toISOString() };
      } else {
        sessions.push({
          id: sessionId || genId(), taskId: boundTaskId || undefined, mode: selectedMode,
          plannedMinutes: focusMinutes, breakMinutes: breakMinutes,
          actualMinutes: finalMin, startedAt: new Date(sessionStartReal).toISOString(),
          endedAt: new Date().toISOString(), status: "completed", createdAt: new Date().toISOString(),
        });
      }

      // Update task actualMinutes
      if (boundTaskId) {
        const task = data.tasks.find(t => t.id === boundTaskId);
        if (task) {
          task.actualMinutes = (task.actualMinutes || 0) + finalMin;
          task.updatedAt = new Date().toISOString();
        }
      }
    } else {
      // Zero-minute session: remove it
      if (idx >= 0) { sessions.splice(idx, 1); }
    }

    data.studySessions = sessions; saveData(data);
    resetState();
  };

  // Reset state (internal only, no save)
  const resetState = () => {
    setSessionId(""); setSessionStartReal(0);
    setAccumulatedMs(0); setPausedAtReal(0); setStatus("idle");
    setDisplayTime(formatTime(focusMinutes * 60));
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  };

  // Abandon (explicit user action)
  const abandonSession = () => {
    const sessions = [...(data.studySessions || [])];
    const idx = sessions.findIndex(s => s.id === sessionId);
    if (idx >= 0) { sessions.splice(idx, 1); }
    data.studySessions = sessions; saveData(data);
    resetState();
  };

  const isRunning = status === "focusing" || status === "break";
  const isPaused = status === "paused";

  return (
    <div>
      <div className="page-header"><h2>番茄钟</h2><p>专注计时，提升学习效率</p></div>

      <div className="grid-2">
        {/* Left: Timer */}
        <div className="card" style={{ textAlign: "center" }}>
          {/* Mode selection */}
          <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 16 }}>
            {MODES.map(m => (
              <button key={m.mode}
                className={`btn ${selectedMode === m.mode ? "btn-accent" : "btn-outline"} btn-sm`}
                onClick={() => { setSelectedMode(m.mode); if (status === "idle") { setFocusMinutes(m.focus); setBreakMinutes(m.break); setDisplayTime(formatTime(m.focus * 60)); } }}
                disabled={isRunning || isPaused}>
                {m.label}
              </button>
            ))}
          </div>

          {/* Custom mode inputs */}
          {selectedMode === "custom" && status === "idle" && (
            <div style={{ display: "flex", gap: 10, justifyContent: "center", marginBottom: 14 }}>
              <div className="form-group" style={{ margin: 0 }}><label>专注(分钟)</label><input type="number" min={1} max={120} className="form-input" style={{ width: 80, textAlign: "center" }} value={customFocus} onChange={e => setCustomFocus(Number(e.target.value))} /></div>
              <div className="form-group" style={{ margin: 0 }}><label>休息(分钟)</label><input type="number" min={1} max={30} className="form-input" style={{ width: 80, textAlign: "center" }} value={customBreak} onChange={e => setCustomBreak(Number(e.target.value))} /></div>
            </div>
          )}

          {/* Timer display */}
          <div style={{ fontSize: 64, fontWeight: 700, fontFamily: "monospace", color: status === "break" ? "var(--color-success)" : "var(--color-primary)", margin: "16px 0" }}>
            {displayTime}
          </div>

          {/* Status badge */}
          <div style={{ marginBottom: 14 }}>
            {status === "idle" && <span className="badge badge-gray">就绪</span>}
            {status === "focusing" && <span className="badge badge-orange">专注中</span>}
            {status === "paused" && <span className="badge badge-blue">已暂停</span>}
            {status === "break" && <span className="badge badge-green">休息中</span>}
          </div>

          {/* Controls */}
          <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
            {status === "idle" && <button className="btn btn-accent" style={{ padding: "10px 28px", fontSize: 16 }} onClick={startSession}>开始专注</button>}
            {status === "focusing" && <button className="btn btn-outline" style={{ padding: "10px 28px", fontSize: 16 }} onClick={pauseSession}>暂停</button>}
            {status === "paused" && <>
              <button className="btn btn-accent" style={{ padding: "10px 28px", fontSize: 16 }} onClick={resumeSession}>继续</button>
              <button className="btn btn-primary" style={{ padding: "10px 20px", fontSize: 14 }} onClick={completeSession}>结束</button>
            </>}
            {status === "break" && <button className="btn btn-outline" style={{ padding: "10px 20px", fontSize: 14 }} onClick={resetState}>跳过休息</button>}
            {(isRunning || isPaused) && status !== "paused" && <button className="btn btn-primary" style={{ padding: "10px 20px", fontSize: 14 }} onClick={completeSession}>结束</button>}
            {(isRunning || isPaused) && <button className="btn btn-outline" style={{ padding: "8px 14px", fontSize: 12, color: "#ef4444" }} onClick={abandonSession}>放弃</button>}
          </div>
        </div>

        {/* Right: Info */}
        <div className="card">
          <div className="section-title">任务绑定</div>
          <select className="form-select" style={{ width: "100%", marginBottom: 14 }} value={boundTaskId} onChange={e => setBoundTaskId(e.target.value)} disabled={isRunning || isPaused}>
            <option value="">不绑定任务</option>
            {incompleteTasks.map(t => <option key={t.id} value={t.id}>{t.title}{t.date ? " (" + t.date + ")" : ""}</option>)}
          </select>

          {boundTask && (
            <div style={{ fontSize: 13, marginBottom: 14, padding: 10, background: "var(--color-bg)", borderRadius: 6 }}>
              <div style={{ fontWeight: 600 }}>{boundTask.title}</div>
              <div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginTop: 4 }}>
                {boundTask.category} · {boundTask.priority} · 已学 {boundTask.actualMinutes || 0} 分钟
              </div>
            </div>
          )}

          <div className="section-title">当前会话</div>
          {currentSession ? (
            <div style={{ fontSize: 13 }}>
              <div style={{ marginBottom: 4 }}>开始时间: {currentSession.startedAt}</div>
              <div style={{ marginBottom: 4 }}>预计专注: {currentSession.plannedFocus} 分钟</div>
              <div style={{ marginBottom: 4 }}>已学习: {Math.floor(currentSession.accumulatedMs / 60000)} 分钟</div>
            </div>
          ) : (
            <div style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>暂无活跃会话</div>
          )}
        </div>
      </div>
    </div>
  );
}

function formatTime(totalSec: number): string {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
}