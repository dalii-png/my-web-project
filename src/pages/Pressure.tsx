import { useState, useEffect } from "react";
import { AppData, PressureQuestion } from "../types";
import { saveData } from "../utils/storage";

export default function Pressure({ data }: { data: AppData }) {
  const [questions, setQuestions] = useState<PressureQuestion[]>(data.pressureQuestions);
  useEffect(() => { setQuestions(data.pressureQuestions) }, [data.pressureQuestions]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const syncSave = (updated: PressureQuestion[]) => { setQuestions(updated); data.pressureQuestions = updated; saveData(data); };
  const updateField = (id: string, field: keyof PressureQuestion, value: unknown) => {
    syncSave(questions.map(q => q.id === id ? { ...q, [field]: value, lastSimulated: field === "personalAnswer" ? new Date().toISOString() : q.lastSimulated } : q));
  };
  const avgProficiency = questions.length > 0 ? Math.round(questions.reduce((s, q) => s + q.proficiency, 0) / questions.length * 20) : 0;

  return (
    <div>
      <div className="page-header"><h2>压力面题库</h2><p>25道高难度压力面试问题准备</p></div>
      <div className="stat-cards" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))" }}>
        <div className="stat-card" style={{ padding: "10px 14px" }}><div className="stat-label">压力题总数</div><div className="stat-value" style={{ fontSize: 20 }}>{questions.length}</div></div>
        <div className="stat-card" style={{ padding: "10px 14px" }}><div className="stat-label">平均熟练度</div><div className="stat-value" style={{ fontSize: 20 }}>{avgProficiency}%</div><div className="progress-bar" style={{ marginTop: 6, height: 5 }}><div className="progress-fill" style={{ width: avgProficiency + "%" }} /></div></div>
        <div className="stat-card" style={{ padding: "10px 14px" }}><div className="stat-label">已模拟题数</div><div className="stat-value" style={{ fontSize: 20 }}>{questions.filter(q => q.lastSimulated).length}</div></div>
      </div>

      {questions.map(q => {
        const expanded = expandedId === q.id;
        return (
          <div key={q.id} className="card" style={{ marginBottom: 10, padding: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 6, flexWrap: "wrap" }}>
                  <span className={`badge ${q.pressureLevel >= 5 ? "badge-red" : q.pressureLevel >= 4 ? "badge-orange" : "badge-blue"}`}>压力 Lv.{q.pressureLevel}</span>
                  <span style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>熟练度: {"★".repeat(q.proficiency)}{"☆".repeat(5 - q.proficiency)}</span>
                  {q.lastSimulated && <span style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>最近模拟: {new Date(q.lastSimulated).toLocaleDateString("zh-CN")}</span>}
                </div>
                <div style={{ fontWeight: 600, fontSize: 14, cursor: "pointer" }} onClick={() => setExpandedId(expanded ? null : q.id)}>{q.question}</div>
              </div>
              <input type="range" min={0} max={5} value={q.proficiency} style={{ width: 60 }} onChange={e => updateField(q.id, "proficiency", Number(e.target.value))} />
            </div>
            {expanded && (
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--color-border)" }}>
                <div className="grid-2" style={{ gap: 10 }}>
                  <div>
                    <div className="form-group"><label>标准回答框架</label><textarea className="form-textarea" rows={3} value={q.standardFramework} readOnly style={{ background: "var(--color-bg)" }} /></div>
                    <div className="form-group"><label>需要避免的表达</label><textarea className="form-textarea" rows={2} value={q.avoidExpressions} readOnly style={{ background: "var(--color-bg)", color: "#ef4444" }} /></div>
                  </div>
                  <div>
                    <div className="form-group"><label>我的个人答案</label><textarea className="form-textarea" rows={5} value={q.personalAnswer} onChange={e => updateField(q.id, "personalAnswer", e.target.value)} placeholder="在这里编写你的回答..." /></div>
                    <div className="form-group"><label>支撑证据</label><textarea className="form-textarea" rows={2} value={q.evidence} onChange={e => updateField(q.id, "evidence", e.target.value)} placeholder="能支撑你回答的具体证据..." /></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}