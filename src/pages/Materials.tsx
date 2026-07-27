import { useState, useMemo, useEffect } from "react";
import { AppData, Material, MaterialCategory, MaterialStatus, Priority } from "../types";
import { saveData } from "../utils/storage";

function genId(): string { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }

const CATEGORIES: MaterialCategory[] = ["基础身份材料", "成绩英语材料", "文书材料", "科研论文材料", "竞赛和证书材料", "其他材料"];
const STATUSES: MaterialStatus[] = ["未准备", "准备中", "已扫描", "已转PDF", "已检查", "已提交"];
const PRIORITIES: Priority[] = ["高", "中", "低"];

export default function Materials({ data }: { data: AppData }) {
  const [materials, setMaterials] = useState<Material[]>(data.materials);
  useEffect(() => { setMaterials(data.materials) }, [data.materials]);
  const [filterCategory, setFilterCategory] = useState<MaterialCategory | "全部">("全部");
  const [filterStatus, setFilterStatus] = useState<MaterialStatus | "全部">("全部");
  const [showForm, setShowForm] = useState(false);
  const [editMaterial, setEditMaterial] = useState<Material | null>(null);
  const [form, setForm] = useState<Partial<Material>>({ name: "", category: "基础身份材料", status: "未准备", priority: "中", scanned: false, pdfConverted: false, checked: false, filePath: "", note: "" });

  const syncSave = (updated: Material[]) => { setMaterials(updated); data.materials = updated; saveData(data); };

  const filtered = useMemo(() => materials.filter(m => {
    if (filterCategory !== "全部" && m.category !== filterCategory) return false;
    if (filterStatus !== "全部" && m.status !== filterStatus) return false;
    return true;
  }), [materials, filterCategory, filterStatus]);

  const stats = useMemo(() => {
    const map: Record<string, number> = {};
    STATUSES.forEach(s => { map[s] = materials.filter(m => m.status === s).length; });
    return map;
  }, [materials]);

  const openAdd = () => { setForm({ name: "", category: "基础身份材料", status: "未准备", priority: "中", scanned: false, pdfConverted: false, checked: false, filePath: "", note: "" }); setEditMaterial(null); setShowForm(true); };
  const openEdit = (m: Material) => { setForm({ ...m }); setEditMaterial(m); setShowForm(true); };

  const saveMaterial = () => {
    if (!form.name) return;
    if (editMaterial) {
      syncSave(materials.map(m => m.id === editMaterial.id ? { ...m, ...form } as Material : m));
    } else {
      const newM: Material = { id: genId(), name: form.name || "", category: (form.category as MaterialCategory) || "其他材料", status: (form.status as MaterialStatus) || "未准备", filePath: form.filePath || "", scanned: form.scanned || false, pdfConverted: form.pdfConverted || false, checked: form.checked || false, priority: (form.priority as Priority) || "中", note: form.note || "" };
      syncSave([...materials, newM]);
    }
    setShowForm(false);
  };

  const deleteMaterial = (id: string) => syncSave(materials.filter(m => m.id !== id));

  return (
    <div>
      <div className="page-header"><h2>材料收纳库</h2><p>管理保研申请所需的所有材料</p></div>
      <div className="stat-cards" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))" }}>
        {STATUSES.map(s => <div key={s} className="stat-card" style={{ padding: "10px 14px" }}><div className="stat-label">{s}</div><div className="stat-value" style={{ fontSize: 20 }}>{stats[s] || 0}</div></div>)}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
        <div className="filter-bar">
          <select className="form-select" style={{ width: 130 }} value={filterCategory} onChange={e => setFilterCategory(e.target.value as MaterialCategory | "全部")}>{CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}<option value="全部">全部类别</option></select>
          <select className="form-select" style={{ width: 110 }} value={filterStatus} onChange={e => setFilterStatus(e.target.value as MaterialStatus | "全部")}>{STATUSES.map(s => <option key={s} value={s}>{s}</option>)}<option value="全部">全部状态</option></select>
        </div>
        <button className="btn btn-accent btn-sm" onClick={openAdd}>+ 新增材料</button>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowForm(false); }}>
          <div className="modal"><h3>{editMaterial ? "编辑材料" : "新增材料"}</h3>
            <div className="form-group"><label>材料名称</label><input className="form-input" value={form.name || ""} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
            <div className="grid-2" style={{ gap: 10 }}>
              <div className="form-group"><label>类别</label><select className="form-select" value={form.category || "基础身份材料"} onChange={e => setForm({ ...form, category: e.target.value as MaterialCategory })}>{CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
              <div className="form-group"><label>状态</label><select className="form-select" value={form.status || "未准备"} onChange={e => setForm({ ...form, status: e.target.value as MaterialStatus })}>{STATUSES.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
              <div className="form-group"><label>优先级</label><select className="form-select" value={form.priority || "中"} onChange={e => setForm({ ...form, priority: e.target.value as Priority })}>{PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}</select></div>
            </div>
            <div className="form-group"><label>文件路径</label><input className="form-input" value={form.filePath || ""} onChange={e => setForm({ ...form, filePath: e.target.value })} placeholder="材料存放位置" /></div>
            <div style={{ display: "flex", gap: 14, marginBottom: 14 }}>
              <label className="checkbox-label"><input type="checkbox" checked={form.scanned || false} onChange={e => setForm({ ...form, scanned: e.target.checked })} />已扫描</label>
              <label className="checkbox-label"><input type="checkbox" checked={form.pdfConverted || false} onChange={e => setForm({ ...form, pdfConverted: e.target.checked })} />已转PDF</label>
              <label className="checkbox-label"><input type="checkbox" checked={form.checked || false} onChange={e => setForm({ ...form, checked: e.target.checked })} />已检查</label>
            </div>
            <div className="form-group"><label>备注</label><textarea className="form-textarea" rows={2} value={form.note || ""} onChange={e => setForm({ ...form, note: e.target.value })} /></div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}><button className="btn btn-outline" onClick={() => setShowForm(false)}>取消</button><button className="btn btn-accent" onClick={saveMaterial}>保存</button></div>
          </div>
        </div>
      )}

      <div className="card">
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead><tr style={{ borderBottom: "2px solid var(--color-border)", textAlign: "left" }}>
            <th style={{ padding: "8px 6px" }}>材料名称</th><th style={{ padding: "8px 6px" }}>类别</th><th style={{ padding: "8px 6px" }}>状态</th><th style={{ padding: "8px 6px" }}>已扫描</th><th style={{ padding: "8px 6px" }}>已转PDF</th><th style={{ padding: "8px 6px" }}>已检查</th><th style={{ padding: "8px 6px" }}>优先级</th><th style={{ padding: "8px 6px" }}>操作</th>
          </tr></thead>
          <tbody>
            {filtered.map(m => (
              <tr key={m.id} style={{ borderBottom: "1px solid var(--color-border)" }}>
                <td style={{ padding: "8px 6px", fontWeight: 500 }}>{m.name}</td>
                <td style={{ padding: "8px 6px" }}><span className="badge badge-blue">{m.category}</span></td>
                <td style={{ padding: "8px 6px" }}>
                  <select className="form-select" style={{ width: 80, fontSize: 11 }} value={m.status} onChange={e => syncSave(materials.map(x => x.id === m.id ? { ...x, status: e.target.value as MaterialStatus } : x))}>
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
                <td style={{ padding: "8px 6px", textAlign: "center" }}><input type="checkbox" checked={m.scanned} onChange={() => syncSave(materials.map(x => x.id === m.id ? { ...x, scanned: !x.scanned } : x))} /></td>
                <td style={{ padding: "8px 6px", textAlign: "center" }}><input type="checkbox" checked={m.pdfConverted} onChange={() => syncSave(materials.map(x => x.id === m.id ? { ...x, pdfConverted: !x.pdfConverted } : x))} /></td>
                <td style={{ padding: "8px 6px", textAlign: "center" }}><input type="checkbox" checked={m.checked} onChange={() => syncSave(materials.map(x => x.id === m.id ? { ...x, checked: !x.checked } : x))} /></td>
                <td style={{ padding: "8px 6px" }}><span className={`badge ${m.priority === "高" ? "badge-red" : m.priority === "中" ? "badge-orange" : "badge-gray"}`}>{m.priority}</span></td>
                <td style={{ padding: "8px 6px" }}><div style={{ display: "flex", gap: 4 }}><button className="btn btn-outline btn-sm" onClick={() => openEdit(m)}>编辑</button><button className="btn btn-outline btn-sm" style={{ color: "#ef4444" }} onClick={() => deleteMaterial(m.id)}>删除</button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="empty-state">无匹配材料</div>}
      </div>
    </div>
  );
}