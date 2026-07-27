import { useState, useMemo, useEffect } from "react";
import { AppData, Question, QuestionCategory, QuestionStatus, QUESTION_CATEGORIES } from "../types";
import { saveData } from "../utils/storage";

function genId(): string { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }

const STATUSES: QuestionStatus[] = ["未准备", "已写答案", "已背诵", "已模拟", "需要修改"];
const PRIORITIES: Array<"S级" | "A级" | "B级"> = ["S级", "A级", "B级"];

export default function Questions({ data }: { data: AppData }) {
  const [questions, setQuestions] = useState<Question[]>(data.questions);
  useEffect(() => { setQuestions(data.questions) }, [data.questions]);
  const [filterCategory, setFilterCategory] = useState<QuestionCategory | "全部">("全部");
  const [filterPriority, setFilterPriority] = useState<"S级" | "A级" | "B级" | "全部">("全部");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editQuestion, setEditQuestion] = useState<Question | null>(null);
  const [form, setForm] = useState<Partial<Question>>({ question: "", category: "自我介绍", priority: "B级", status: "未准备", keywords: [], answer: "", note: "", confidence: 0 });
  const [quiz, setQuiz] = useState<Question[] | null>(null);

  const syncSave = (updated: Question[]) => { setQuestions(updated); data.questions = updated; saveData(data); };

  const filtered = useMemo(() => questions.filter(q => {
    if (filterCategory !== "全部" && q.category !== filterCategory) return false;
    if (filterPriority !== "全部" && q.priority !== filterPriority) return false;
    if (search && !q.question.includes(search) && !q.answer.includes(search) && !q.keywords.some(k => k.includes(search))) return false;
    return true;
  }), [questions, filterCategory, filterPriority, search]);

  const stats = useMemo(() => {
    const total = questions.length;
    const withAnswer = questions.filter(q => q.status !== "未准备").length;
    const memorized = questions.filter(q => q.status === "已背诵" || q.status === "已模拟").length;
    return { total, withAnswer, memorized, answerRate: total > 0 ? Math.round((withAnswer / total) * 100) : 0 };
  }, [questions]);

  const updateField = (id: string, field: keyof Question, value: unknown) => {
    syncSave(questions.map(q => q.id === id ? { ...q, [field]: value, lastReviewedAt: new Date().toISOString() } : q));
  };

  const deleteQuestion = (id: string) => syncSave(questions.filter(q => q.id !== id));

  const openAdd = () => { setForm({ question: "", category: "自我介绍", priority: "B级", status: "未准备", keywords: [], answer: "", note: "", confidence: 0 }); setEditQuestion(null); setShowForm(true); };

  const saveQuestion = () => {
    if (!form.question) return;
    if (editQuestion) { syncSave(questions.map(q => q.id === editQuestion.id ? { ...q, ...form } as Question : q)); }
    else { syncSave([...questions, { ...form as Question, id: genId(), lastReviewedAt: undefined }]); }
    setShowForm(false);
  };

  const startQuiz = () => {
    const pool = questions.filter(q => q.status !== "未准备");
    if (pool.length < 5) { setQuiz(pool); return; }
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    setQuiz(shuffled.slice(0, 5));
  };

  return (
    <div>
      <div className="page-header"><h2>导师问题库</h2><p>面试问题准备与管理</p></div>
      <div className="stat-cards" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))" }}>
        <div className="stat-card" style={{ padding: "10px 14px" }}><div className="stat-label">总问题数</div><div className="stat-value" style={{ fontSize: 20 }}>{stats.total}</div></div>
        <div className="stat-card" style={{ padding: "10px 14px" }}><div className="stat-label">答题率</div><div className="stat-value" style={{ fontSize: 20 }}>{stats.answerRate}%</div></div>
        <div className="stat-card" style={{ padding: "10px 14px" }}><div className="stat-label">已背诵/模拟</div><div className="stat-value" style={{ fontSize: 20 }}>{stats.memorized}</div></div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
        <div className="filter-bar">
          <input className="search-input" placeholder="搜索问题或关键词..." value={search} onChange={e => setSearch(e.target.value)} />
          <select className="form-select" style={{ width: 120 }} value={filterCategory} onChange={e => setFilterCategory(e.target.value as QuestionCategory | "全部")}>
            <option value="全部">全部类别</option>
            {QUESTION_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select className="form-select" style={{ width: 100 }} value={filterPriority} onChange={e => setFilterPriority(e.target.value as "S级" | "A级" | "B级" | "全部")}>
            <option value="全部">全部优先级</option>
            {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button className="btn btn-accent btn-sm" onClick={startQuiz}>🎯 随机抽5题模拟</button>
          <button className="btn btn-primary btn-sm" onClick={openAdd}>+ 新增问题</button>
        </div>
      </div>

      {quiz && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setQuiz(null); }}>
          <div className="modal" style={{ maxWidth: 640 }}><h3>🎯 随机模拟面试（{quiz.length}题）</h3>
            {quiz.map((q, i) => (
              <div key={q.id} className="quiz-card" style={{ borderColor: "var(--color-primary)" }}>
                <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 4 }}>第{i + 1}题 · {q.category}</div>
                <div className="quiz-question">{q.question}</div>
                {q.answer && <details style={{ marginTop: 8 }}><summary style={{ cursor: "pointer", fontSize: 12, color: "var(--color-primary)" }}>查看答案</summary><div style={{ marginTop: 6, padding: "8px 12px", background: "var(--color-bg)", borderRadius: 6, fontSize: 13, whiteSpace: "pre-wrap" }}>{q.answer}</div></details>}
              </div>
            ))}
            <button className="btn btn-outline" style={{ width: "100%" }} onClick={() => setQuiz(null)}>关闭</button>
          </div>
        </div>
      )}

      {showForm && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowForm(false); }}>
          <div className="modal" style={{ maxWidth: 600 }}><h3>{editQuestion ? "编辑问题" : "新增问题"}</h3>
            <div className="form-group"><label>问题</label><textarea className="form-textarea" rows={2} value={form.question || ""} onChange={e => setForm({ ...form, question: e.target.value })} /></div>
            <div className="grid-2" style={{ gap: 10 }}>
              <div className="form-group"><label>类别</label><select className="form-select" value={form.category} onChange={e => setForm({ ...form, category: e.target.value as QuestionCategory })}>{QUESTION_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
              <div className="form-group"><label>优先级</label><select className="form-select" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value as "S级" | "A级" | "B级" })}>{PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}</select></div>
              <div className="form-group"><label>状态</label><select className="form-select" value={form.status} onChange={e => setForm({ ...form, status: e.target.value as QuestionStatus })}>{STATUSES.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
              <div className="form-group"><label>熟练度 (1-5)</label><input className="form-input" type="number" min={0} max={5} value={form.confidence || 0} onChange={e => setForm({ ...form, confidence: Number(e.target.value) })} /></div>
            </div>
            <div className="form-group"><label>答案</label><textarea className="form-textarea" rows={4} value={form.answer || ""} onChange={e => setForm({ ...form, answer: e.target.value })} /></div>
            <div className="form-group"><label>关键词（逗号分隔）</label><input className="form-input" value={(form.keywords || []).join(",")} onChange={e => setForm({ ...form, keywords: e.target.value.split(",").map(k => k.trim()).filter(Boolean) })} /></div>
            <div className="form-group"><label>备注</label><textarea className="form-textarea" rows={2} value={form.note || ""} onChange={e => setForm({ ...form, note: e.target.value })} /></div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}><button className="btn btn-outline" onClick={() => setShowForm(false)}>取消</button><button className="btn btn-accent" onClick={saveQuestion}>保存</button></div>
          </div>
        </div>
      )}

      {filtered.map(q => {
        const expanded = expandedId === q.id;
        return (
          <div key={q.id} className="card" style={{ marginBottom: 10, padding: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 4, flexWrap: "wrap" }}>
                  <span className={`badge ${q.priority === "S级" ? "badge-red" : q.priority === "A级" ? "badge-orange" : "badge-blue"}`}>{q.priority}</span>
                  <span className="badge badge-blue">{q.category}</span>
                  <span className={`badge ${q.status === "已模拟" ? "badge-green" : q.status === "未准备" ? "badge-red" : "badge-orange"}`}>{q.status}</span>
                  {q.confidence > 0 && <span style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>熟练度: {"★".repeat(q.confidence)}{"☆".repeat(5 - q.confidence)}</span>}
                </div>
                <div style={{ fontWeight: 600, fontSize: 14, cursor: "pointer" }} onClick={() => setExpandedId(expanded ? null : q.id)}>{q.question}</div>
                {q.lastReviewedAt && <div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginTop: 3 }}>最近复习: {new Date(q.lastReviewedAt).toLocaleDateString("zh-CN")}</div>}
              </div>
              <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                <select className="form-select" style={{ width: 90, fontSize: 11 }} value={q.status} onChange={e => updateField(q.id, "status", e.target.value as QuestionStatus)}>{STATUSES.map(s => <option key={s} value={s}>{s}</option>)}</select>
                <button className="btn btn-outline btn-sm" onClick={() => { setForm({ ...q }); setEditQuestion(q); setShowForm(true); }}>编辑</button>
                <button className="btn btn-outline btn-sm" style={{ color: "#ef4444" }} onClick={() => deleteQuestion(q.id)}>删除</button>
              </div>
            </div>
            {expanded && (
              <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid var(--color-border)" }}>
                <div style={{ marginBottom: 8 }}><div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>答案：</div>
                  <textarea className="form-textarea" rows={5} value={q.answer} onChange={e => updateField(q.id, "answer", e.target.value)} placeholder="在此编写或修改答案..." />
                </div>
                {q.keywords.length > 0 && <div style={{ marginBottom: 8 }}><span style={{ fontSize: 12, fontWeight: 600 }}>关键词：</span>{q.keywords.map(k => <span key={k} className="badge badge-blue" style={{ marginLeft: 4 }}>{k}</span>)}</div>}
                <input className="note-input" placeholder="添加备注..." value={q.note} onChange={e => updateField(q.id, "note", e.target.value)} />
              </div>
            )}
          </div>
        );
      })}
      {filtered.length === 0 && <div className="empty-state">无匹配问题</div>}
    </div>
  );
}