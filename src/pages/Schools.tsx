import { useState, useMemo, useEffect } from "react";
import { AppData, SchoolApplication, SchoolStatus, SchoolPriority } from "../types";
import { saveData } from "../utils/storage";

function genId(): string { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }

const STATUSES: SchoolStatus[] = ["待关注", "准备中", "已报名", "已提交", "已面试", "已录取", "已拒绝", "已截止"];
const PRIORITIES: SchoolPriority[] = ["冲刺", "重点", "保底", "待评估"];
const STATUS_COLORS: Record<SchoolStatus, string> = {
  "待关注": "badge-gray", "准备中": "badge-blue", "已报名": "badge-orange",
  "已提交": "badge-orange", "已面试": "badge-orange", "已录取": "badge-green",
  "已拒绝": "badge-red", "已截止": "badge-red"
};
const PRIORITY_COLORS: Record<SchoolPriority, string> = {
  "冲刺": "badge-red", "重点": "badge-orange", "保底": "badge-green", "待评估": "badge-gray"
};

const defaultForm: Partial<SchoolApplication> = {
  school: "", college: "", applicationTime: "", specificMajor: "", degreeType: "",
  recommendation: "", requirements: [], materials: [], status: "待关注", priority: "待评估",
  sourceUrl: "", notes: ""
};

export default function Schools({ data }: { data: AppData }) {
  const [schools, setSchools] = useState<SchoolApplication[]>(data.schools || []);
  useEffect(() => { setSchools(data.schools || []) }, [data.schools]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<SchoolStatus | "全部">("全部");
  const [filterPriority, setFilterPriority] = useState<SchoolPriority | "全部">("全部");
  const [onlyActive, setOnlyActive] = useState(false);
  const [sortBy, setSortBy] = useState<"time" | "school" | "default">("time");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editSchool, setEditSchool] = useState<SchoolApplication | null>(null);
  const [form, setForm] = useState<Partial<SchoolApplication>>({ ...defaultForm });
  const [deleteTarget, setDeleteTarget] = useState<SchoolApplication | null>(null);
  const [showCSVImport, setShowCSVImport] = useState(false);
  const [csvText, setCsvText] = useState("");
  const [csvPreview, setCsvPreview] = useState<SchoolApplication[]>([]);

  const syncSave = (updated: SchoolApplication[]) => {
    setSchools(updated); data.schools = updated; saveData(data);
  };

  const filtered = useMemo(() => {
    let result = schools.filter(s => {
      if (filterStatus !== "全部" && s.status !== filterStatus) return false;
      if (filterPriority !== "全部" && s.priority !== filterPriority) return false;
      if (onlyActive && (s.status === "已截止" || s.status === "已拒绝")) return false;
      if (search) {
        const q = search.toLowerCase();
        const haystack = (s.school + s.college + s.specificMajor + s.notes + s.degreeType).toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
    if (sortBy === "time") {
      result = [...result].sort((a, b) => {
        const ta = a.applicationTime || "", tb = b.applicationTime || "";
        if (!ta && !tb) return 0; if (!ta) return 1; if (!tb) return -1;
        return ta.localeCompare(tb);
      });
    } else if (sortBy === "school") {
      result = [...result].sort((a, b) => a.school.localeCompare(b.school));
    }
    return result;
  }, [schools, search, filterStatus, filterPriority, onlyActive, sortBy]);

  const stats = useMemo(() => {
    const active = schools.filter(s => s.status !== "已截止" && s.status !== "已拒绝").length;
    return {
      total: schools.length, active, attention: schools.filter(s => s.status === "待关注").length,
      preparing: schools.filter(s => s.status === "准备中").length,
      submitted: schools.filter(s => s.status === "已提交").length,
      closed: schools.filter(s => s.status === "已截止").length,
      cs: schools.filter(s => s.priority === "冲刺").length,
      zd: schools.filter(s => s.priority === "重点").length,
      bd: schools.filter(s => s.priority === "保底").length,
    };
  }, [schools]);

  const openAdd = () => { setForm({ ...defaultForm }); setEditSchool(null); setShowForm(true); };
  
  const openEdit = (s: SchoolApplication) => { setForm({ ...s }); setEditSchool(s); setShowForm(true); };

  const saveSchool = () => {
    if (!form.school) return;
    if (editSchool) {
      syncSave(schools.map(s => s.id === editSchool.id ? { ...s, ...form, updatedAt: new Date().toISOString() } as SchoolApplication : s));
    } else {
      syncSave([...schools, { ...form, id: genId(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), requirements: form.requirements || [], materials: form.materials || [] } as SchoolApplication]);
    }
    setShowForm(false);
  };

  const confirmDelete = (s: SchoolApplication) => { setDeleteTarget(s); };

  const executeDelete = () => {
    if (!deleteTarget) return;
    syncSave(schools.filter(s => s.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  const updateStatus = (id: string, status: SchoolStatus) => {
    syncSave(schools.map(s => s.id === id ? { ...s, status, updatedAt: new Date().toISOString() } : s));
  };

  const updatePriority = (id: string, priority: SchoolPriority) => {
    syncSave(schools.map(s => s.id === id ? { ...s, priority, updatedAt: new Date().toISOString() } : s));
  };

  const addReqItem = ( id: string ) => {
    const item = prompt("输入新申请要求:");
    if (!item) return;
    syncSave(schools.map(s => s.id === id ? { ...s, requirements: [...s.requirements, item], updatedAt: new Date().toISOString() } : s));
  };

  const removeReqItem = (id: string, idx: number) => {
    syncSave(schools.map(s => s.id === id ? { ...s, requirements: s.requirements.filter((_, i) => i !== idx), updatedAt: new Date().toISOString() } : s));
  };

  const parseCSV = () => {
    const lines = csvText.trim().split(/\r?\n/).filter(Boolean);
    const preview: SchoolApplication[] = [];
    const startIdx = lines[0] && (lines[0].includes("学校") || lines[0].includes("学院")) ? 1 : 0;
    for (let i = startIdx; i < lines.length; i++) {
      const cols = lines[i].split(",").map(c => c.trim().replace(/^"|"$/g, ""));
      if (cols.length < 3) continue;
      preview.push({
        id: genId(), school: cols[0] || "", college: cols[1] || "",
        applicationTime: cols[2] || "", specificMajor: cols[3] || "", degreeType: cols[4] || "",
        recommendation: cols[5] || "", requirements: [], materials: [], status: "待关注",
        priority: "待评估", sourceUrl: cols[7] || "", notes: cols[6] || "",
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
      });
    }
    setCsvPreview(preview);
  };

  const importCSV = () => {
    if (csvPreview.length === 0) return;
    syncSave([...schools, ...csvPreview]);
    setCsvText(""); setCsvPreview([]); setShowCSVImport(false);
  };

  const exportCSV = () => {
    const h = "学校,学院,申请时间,具体申请专业,学位类型,推荐信,备注,状态,优先级,网址";
    const rows = schools.map(s => [s.school, s.college, s.applicationTime, s.specificMajor, s.degreeType, s.recommendation, s.notes, s.status, s.priority, s.sourceUrl].map(v => '"' + String(v).replace(/"/g, '""') + '"').join(","));
    const csv = "\uFEFF" + [h, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "schools.csv"; a.click();
  };

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(schools, null, 2)], { type: "application/json" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "schools.json"; a.click();
  };

  return (
    <div>
      <div className="page-header"><h2>院校预推免</h2><p>管理目标院校预推免申请信息</p></div>

      {/* Stats */}
      <div className="stat-cards" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(90px, 1fr))" }}>
        <div className="stat-card" style={{ padding: "10px 14px" }}><div className="stat-label">院校总数</div><div className="stat-value" style={{ fontSize: 20 }}>{stats.total}</div></div>
        <div className="stat-card" style={{ padding: "10px 14px" }}><div className="stat-label">活跃中</div><div className="stat-value" style={{ fontSize: 20, color: "var(--color-primary)" }}>{stats.active}</div></div>
        <div className="stat-card" style={{ padding: "10px 14px" }}><div className="stat-label">待关注</div><div className="stat-value" style={{ fontSize: 20, color: "#6b7280" }}>{stats.attention}</div></div>
        <div className="stat-card" style={{ padding: "10px 14px" }}><div className="stat-label">准备中</div><div className="stat-value" style={{ fontSize: 20, color: "#3b82f6" }}>{stats.preparing}</div></div>
        <div className="stat-card" style={{ padding: "10px 14px" }}><div className="stat-label">已提交</div><div className="stat-value" style={{ fontSize: 20, color: "#22c55e" }}>{stats.submitted}</div></div>
        <div className="stat-card" style={{ padding: "10px 14px" }}><div className="stat-label">已截止</div><div className="stat-value" style={{ fontSize: 20, color: "#ef4444" }}>{stats.closed}</div></div>
        <div className="stat-card" style={{ padding: "10px 14px" }}><div className="stat-label">冲刺</div><div className="stat-value" style={{ fontSize: 20, color: "#ef4444" }}>{stats.cs}</div></div>
        <div className="stat-card" style={{ padding: "10px 14px" }}><div className="stat-label">重点</div><div className="stat-value" style={{ fontSize: 20, color: "#f47920" }}>{stats.zd}</div></div>
        <div className="stat-card" style={{ padding: "10px 14px" }}><div className="stat-label">保底</div><div className="stat-value" style={{ fontSize: 20, color: "#22c55e" }}>{stats.bd}</div></div>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
        <div className="filter-bar">
          <input className="search-input" placeholder="搜索学校、学院、专业..." value={search} onChange={e => setSearch(e.target.value)} />
          <select className="form-select" style={{ width: 100 }} value={filterStatus} onChange={e => setFilterStatus(e.target.value as SchoolStatus | "全部")}>
            <option value="全部">全部状态</option>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select className="form-select" style={{ width: 100 }} value={filterPriority} onChange={e => setFilterPriority(e.target.value as SchoolPriority | "全部")}>
            <option value="全部">全部优先级</option>
            {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <select className="form-select" style={{ width: 110 }} value={sortBy} onChange={e => setSortBy(e.target.value as "time" | "school" | "default")}>
            <option value="time">按申请时间</option>
            <option value="school">按学校名称</option>
          </select>
          <label className="checkbox-label"><input type="checkbox" checked={onlyActive} onChange={e => setOnlyActive(e.target.checked)} />只看活跃</label>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button className="btn btn-outline btn-sm" onClick={exportCSV}>导出 CSV</button>
          <button className="btn btn-outline btn-sm" onClick={exportJSON}>导出 JSON</button>
          <button className="btn btn-outline btn-sm" onClick={() => { setCsvText(""); setCsvPreview([]); setShowCSVImport(true); }}>CSV 批量导入</button>
          <button className="btn btn-accent btn-sm" onClick={openAdd}>+ 新增院校</button>
        </div>
      </div>

      {/* CSV Import Modal */}
      {showCSVImport && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowCSVImport(false); }}>
          <div className="modal" style={{ maxWidth: 640 }}><h3>CSV 批量导入</h3>
            <p style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 10 }}>
              格式：学校,学院,申请时间,具体申请专业,学位类型,推荐信,备注,网址（每行一条）
            </p>
            <textarea className="form-textarea" rows={8} value={csvText} onChange={e => setCsvText(e.target.value)} placeholder="粘贴 CSV 数据..."/>
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <button className="btn btn-outline btn-sm" onClick={parseCSV}>预览</button>
              <button className="btn btn-accent btn-sm" onClick={importCSV} disabled={csvPreview.length === 0}>确认导入 ({csvPreview.length} 条)</button>
              <button className="btn btn-outline btn-sm" onClick={() => setShowCSVImport(false)}>取消</button>
            </div>
            {csvPreview.length > 0 && (
              <div style={{ marginTop: 12, maxHeight: 200, overflowY: "auto", fontSize: 12, border: "1px solid var(--color-border)", borderRadius: 6, padding: 8 }}>
                {csvPreview.map((s, i) => <div key={i} style={{ padding: "3px 0", borderBottom: "1px solid var(--color-border)" }}>{s.school} - {s.college} - {s.specificMajor}</div>)}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowForm(false); }}>
          <div className="modal" style={{ maxWidth: 600 }}><h3>{editSchool ? "编辑院校" : "新增院校"}</h3>
            <div className="grid-2" style={{ gap: 10 }}>
              <div className="form-group"><label>学校</label><input className="form-input" value={form.school || ""} onChange={e => setForm({ ...form, school: e.target.value })} /></div>
              <div className="form-group"><label>学院</label><input className="form-input" value={form.college || ""} onChange={e => setForm({ ...form, college: e.target.value })} /></div>
              <div className="form-group"><label>申请时间</label><input className="form-input" value={form.applicationTime || ""} onChange={e => setForm({ ...form, applicationTime: e.target.value })} /></div>
              <div className="form-group"><label>具体专业</label><input className="form-input" value={form.specificMajor || ""} onChange={e => setForm({ ...form, specificMajor: e.target.value })} /></div>
              <div className="form-group"><label>学位类型</label><input className="form-input" value={form.degreeType || ""} onChange={e => setForm({ ...form, degreeType: e.target.value })} /></div>
              <div className="form-group"><label>推荐信</label><input className="form-input" value={form.recommendation || ""} onChange={e => setForm({ ...form, recommendation: e.target.value })} /></div>
            </div>
            <div className="grid-2" style={{ gap: 10 }}>
              <div className="form-group"><label>状态</label><select className="form-select" value={form.status} onChange={e => setForm({ ...form, status: e.target.value as SchoolStatus })}>{STATUSES.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
              <div className="form-group"><label>优先级</label><select className="form-select" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value as SchoolPriority })}>{PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}</select></div>
            </div>
            <div className="form-group"><label>网址</label><input className="form-input" value={form.sourceUrl || ""} onChange={e => setForm({ ...form, sourceUrl: e.target.value })} /></div>
            <div className="form-group"><label>备注</label><textarea className="form-textarea" rows={3} value={form.notes || ""} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button className="btn btn-outline" onClick={() => setShowForm(false)}>取消</button>
              <button className="btn btn-accent" onClick={saveSchool}>保存</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteTarget && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setDeleteTarget(null); }}>
          <div className="modal" style={{ maxWidth: 400 }}><h3>确认删除</h3>
            <p style={{ marginBottom: 16 }}>确定要删除 <strong>{deleteTarget.school}</strong> 的申请记录吗？此操作不可恢复。</p>
            <div className="confirm-actions"><button className="btn btn-outline" onClick={() => setDeleteTarget(null)}>取消</button><button className="btn btn-danger" onClick={executeDelete}>确认删除</button></div>
          </div>
        </div>
      )}

      {/* School Cards */}
      {filtered.map(s => {
        const expanded = expandedId === s.id;
        const isClosed = s.status === "已截止" || s.status === "已拒绝";
        return (
          <div key={s.id} className="card" style={{ marginBottom: 10, padding: 14, opacity: isClosed ? 0.6 : 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 6, flexWrap: "wrap" }}>
                  <span className={`badge ${STATUS_COLORS[s.status]}`}>{s.status}</span>
                  <span className={`badge ${PRIORITY_COLORS[s.priority]}`}>{s.priority}</span>
                  {s.degreeType && <span className="badge badge-blue">{s.degreeType}</span>}
                </div>
                <div style={{ fontWeight: 600, fontSize: 15, cursor: "pointer" }} onClick={() => setExpandedId(expanded ? null : s.id)}>
                  {s.school} {s.college ? "· " + s.college : ""}
                </div>
                <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginTop: 3 }}>
                  {s.specificMajor && <span>{s.specificMajor} · </span>}
                  申请时间: {s.applicationTime || "待确认"}
                </div>
                {s.notes && <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginTop: 2 }}>{s.notes}</div>}
              </div>
              <div style={{ display: "flex", gap: 6, flexShrink: 0, alignItems: "center", flexWrap: "wrap" }}>
                <select className="form-select" style={{ width: 80, fontSize: 11 }} value={s.status} onChange={e => updateStatus(s.id, e.target.value as SchoolStatus)}>
                  {STATUSES.map(st => <option key={st} value={st}>{st}</option>)}
                </select>
                <select className="form-select" style={{ width: 70, fontSize: 11 }} value={s.priority} onChange={e => updatePriority(s.id, e.target.value as SchoolPriority)}>
                  {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <button className="btn btn-outline btn-sm" onClick={() => openEdit(s)}>编辑</button>
                <button className="btn btn-outline btn-sm" style={{ color: "#ef4444" }} onClick={() => confirmDelete(s)}>删除</button>
              </div>
            </div>

            {expanded && (
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--color-border)" }}>
                <div className="grid-2" style={{ gap: 14 }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>申请要求</div>
                    {s.requirements.length === 0 && <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>暂无</div>}
                    {s.requirements.map((r, i) => (
                      <div key={i} style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 3, fontSize: 13 }}>
                        <span style={{ flex: 1 }}>{r}</span>
                        <button className="btn btn-outline btn-sm" style={{ fontSize: 10, padding: "1px 6px" }} onClick={() => removeReqItem(s.id, i)}>x</button>
                      </div>
                    ))}
                    <button className="btn btn-outline btn-sm" style={{ marginTop: 4 }} onClick={() => addReqItem(s.id)}>+ 添加</button>
                  </div>
                  <div>
                    {s.sourceUrl && <div style={{ marginBottom: 8 }}><a href={s.sourceUrl} target="_blank" rel="noopener noreferrer" style={{ color: "var(--color-primary)", fontSize: 12, textDecoration: "underline" }}>查看通知原文</a></div>}
                    <div className="form-group"><label>推荐信</label><div style={{ fontSize: 13 }}>{s.recommendation || "无"}</div></div>
                    <div className="form-group"><label>学位类型</label><div style={{ fontSize: 13 }}>{s.degreeType || "待确认"}</div></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
      {filtered.length === 0 && <div className="empty-state">还没有院校记录，请添加或批量导入</div>}
    </div>
  );
}