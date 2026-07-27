import { useState } from "react";
import { AppData } from "../types";
import { exportTasksCSV } from "../utils/storage";
import { getDefaultData } from "../data/defaultData";
import { validateImportData, normalizeImportData } from "../utils/dataValidation";

const BACKUP_PREFIX = "baoyan_backup_";
const MAX_BACKUPS = 5;

function listBackups() {
  const result: { key: string; time: string; size: number }[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(BACKUP_PREFIX)) {
      const val = localStorage.getItem(key) || "";
      result.push({ key, time: key.replace(BACKUP_PREFIX, ""), size: new Blob([val]).size });
    }
  }
  return result.sort((a, b) => b.time.localeCompare(a.time));
}

function createBackup(data: AppData): { success: boolean; key?: string; error?: string } {
  try {
    const time = new Date().toISOString().replace(/[:.]/g, "-");
    const key = BACKUP_PREFIX + time;
    const json = JSON.stringify(data);
    localStorage.setItem(key, json);
    const backups = listBackups();
    backups.slice(MAX_BACKUPS).forEach(b => localStorage.removeItem(b.key));
    return { success: true, key };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const isQuota = (e instanceof DOMException && (e.name === "QuotaExceededError" || e.name === "NS_ERROR_DOM_QUOTA_REACHED")) || msg.includes("quota") || msg.includes("Quota");
    return { success: false, error: isQuota ? "localStorage 容量不足，请先导出数据" : "备份失败: " + msg };
  }
}

export default function Settings({ data, onDataChange }: { data: AppData; onDataChange: (next: AppData) => boolean }) {
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");
  const [confirmRestore, setConfirmRestore] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [importPreview, setImportPreview] = useState<ReturnType<typeof validateImportData> | null>(null);
  const [importData, setImportData] = useState<AppData | null>(null);
  const [showRestore, setShowRestore] = useState(false);
  const [backups, setBackups] = useState(listBackups());
  const [restoreTarget, setRestoreTarget] = useState("");
  const [clearText, setClearText] = useState("");
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const showMsg = (msg: string, type: "success" | "error" = "success") => {
    setMessage(msg); setMessageType(type); setTimeout(() => setMessage(""), 4000);
  };
  const refreshBackups = () => setBackups(listBackups());

  const handleExportJSON = () => {
    const envelope = { format: "study-planner-backup", formatVersion: 1, appDataVersion: data.version || 1, exportedAt: new Date().toISOString(), data };
    downloadFile(JSON.stringify(envelope, null, 2), "study-planner-backup-" + new Date().toISOString().split("T")[0] + ".json", "application/json");
    showMsg("导出成功");
  };

  const handleExportCSV = () => {
    downloadFile("\uFEFF" + exportTasksCSV(data), "tasks-" + new Date().toISOString().split("T")[0] + ".csv", "text/csv;charset=utf-8");
    showMsg("CSV 导出成功");
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const json = JSON.parse(reader.result as string);
        const v = validateImportData(json);
        setImportPreview(v);
        setImportData(v.valid ? normalizeImportData(json) : null);
      } catch { showMsg("JSON 格式错误", "error"); }
    };
    reader.readAsText(f);
  };

  const handleImportConfirm = () => {
    if (!importData) return;
    createBackup(data);
    const next = { ...importData, lastUpdated: new Date().toISOString(), version: importData.version || data.version || 1 };
    if (!onDataChange(next)) { showMsg("保存失败", "error"); return; }
    setShowImport(false); setImportData(null); setImportPreview(null); refreshBackups(); showMsg("导入成功");
  };

  const handleCreateBackup = () => { const result = createBackup(data); if (result.success) { refreshBackups(); showMsg("备份已创建"); } else { showMsg(result.error || "备份失败", "error"); } };

  const handleDownloadBackup = (key: string) => {
    const val = localStorage.getItem(key); if (!val) return;
    downloadFile(val, key + ".json", "application/json");
  };

  const handleRestoreBackup = (key: string) => { setRestoreTarget(key); setShowRestore(true); };

  const confirmRestoreBackup = () => {
    const val = localStorage.getItem(restoreTarget);
    if (!val) { showMsg("备份不存在", "error"); setShowRestore(false); return; }
    try {
      const raw = JSON.parse(val);
      const restored = normalizeImportData(raw);
      createBackup(data);
      const next = { ...restored, lastUpdated: new Date().toISOString() };
      if (!onDataChange(next)) { showMsg("保存失败", "error"); setShowRestore(false); return; }
      setShowRestore(false); refreshBackups(); showMsg("恢复成功");
    } catch { showMsg("备份数据损坏", "error"); setShowRestore(false); }
  };

  const handleClearExecute = () => {
    if (clearText !== "DELETE") { showMsg("请输入 DELETE 确认", "error"); return; }
    createBackup(data);
    const defaults = getDefaultData();
    if (!onDataChange(defaults)) { showMsg("清空失败", "error"); return; }
    setShowClearConfirm(false); setClearText(""); refreshBackups(); showMsg("已清空");
  };

  const handleRestoreDefaults = () => {
    createBackup(data);
    const defaults = getDefaultData();
    if (!onDataChange(defaults)) { showMsg("恢复失败", "error"); return; }
    setConfirmRestore(false); refreshBackups(); showMsg("已恢复默认数据");
  };

  const storageSize = new Blob([JSON.stringify(data)]).size;

  return (
    <div>
      <div className="page-header"><h2>数据备份与设置</h2><p>管理数据、备份和安全</p></div>
      {message && <div className="card" style={{ marginBottom: 20, background: messageType === "success" ? "#dcfce7" : "#fee2e2", borderColor: messageType === "success" ? "#22c55e" : "#ef4444", padding: "10px 16px", fontSize: 13 }}>{message}</div>}

      <div className="grid-2">
        <div className="card"><div className="section-title">数据导出</div>
          <p style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 16 }}>导出完整数据</p>
          <div style={{ display: "flex", gap: 8 }}><button className="btn btn-primary" onClick={handleExportJSON}>导出 JSON</button><button className="btn btn-outline" onClick={handleExportCSV}>导出 CSV</button></div>
        </div>

        <div className="card"><div className="section-title">数据导入</div>
          <p style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 16 }}>从 JSON 文件恢复</p>
          {showImport ? (
            <div>
              <input type="file" accept=".json" onChange={handleFileSelect} style={{ marginBottom: 10 }} />
              {importPreview && (
                <div style={{ fontSize: 12, marginBottom: 10, padding: 10, background: "var(--color-bg)", borderRadius: 6 }}>
                  <div><strong>预览：</strong> 任务{importPreview.summary.tasks} | 番茄钟{importPreview.summary.studySessions} | 日记{importPreview.summary.diaries} | 打卡{importPreview.summary.checkIns} | 院校{importPreview.summary.schools}</div>
                  {importPreview.errors.map((e, i) => <div key={i} style={{ color: "#ef4444" }}>❌ {e}</div>)}
                  {importPreview.warnings.map((w, i) => <div key={i} style={{ color: "#f47920" }}>⚠️ {w}</div>)}
                </div>
              )}
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn btn-accent btn-sm" onClick={handleImportConfirm} disabled={!importPreview || !importPreview.valid || !importData}>确认导入</button>
                <button className="btn btn-outline btn-sm" onClick={() => { setShowImport(false); setImportData(null); setImportPreview(null); }}>取消</button>
              </div>
            </div>
          ) : <button className="btn btn-outline" onClick={() => setShowImport(true)}>从 JSON 文件导入</button>}
        </div>

        <div className="card"><div className="section-title">本地备份</div>
          <p style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 16 }}>最多 {MAX_BACKUPS} 份</p>
          <div style={{ marginBottom: 12 }}><button className="btn btn-primary btn-sm" onClick={handleCreateBackup}>创建备份</button></div>
          {backups.length === 0 ? <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>暂无备份</div> : (
            <div style={{ maxHeight: 200, overflowY: "auto", fontSize: 12 }}>
              {backups.map(b => (
                <div key={b.key} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "1px solid var(--color-border)" }}>
                  <span>{b.time.replace("T"," ").substring(0,19)} ({(b.size/1024).toFixed(1)}KB)</span>
                  <div style={{ display: "flex", gap: 4 }}>
                    <button className="btn btn-outline btn-sm" style={{ fontSize:10,padding:"2px 6px" }} onClick={() => handleDownloadBackup(b.key)}>下载</button>
                    <button className="btn btn-outline btn-sm" style={{ fontSize:10,padding:"2px 6px" }} onClick={() => handleRestoreBackup(b.key)}>恢复</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {showRestore && (
          <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowRestore(false); }}>
            <div className="modal" style={{ maxWidth: 400 }}><h3>确认恢复</h3>
              <p style={{ marginBottom: 14, fontSize: 13 }}>将从备份恢复，当前数据先自动备份。</p>
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <button className="btn btn-outline" onClick={() => setShowRestore(false)}>取消</button>
                <button className="btn btn-accent" onClick={confirmRestoreBackup}>确认恢复</button>
              </div>
            </div>
          </div>
        )}

        <div className="card"><div className="section-title">清空数据</div>
          <p style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 16 }}>清空前自动备份</p>
          {showClearConfirm ? (
            <div>
              <p style={{ color: "#ef4444", fontSize: 13, marginBottom: 10 }}>输入 <strong>DELETE</strong> 确认：</p>
              <input className="form-input" style={{ marginBottom: 10 }} value={clearText} onChange={e => setClearText(e.target.value)} placeholder="输入 DELETE" />
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn btn-danger btn-sm" onClick={handleClearExecute} disabled={clearText !== "DELETE"}>确认清空</button>
                <button className="btn btn-outline btn-sm" onClick={() => { setShowClearConfirm(false); setClearText(""); }}>取消</button>
              </div>
            </div>
          ) : <button className="btn btn-outline" style={{ color: "#ef4444", borderColor: "#ef4444" }} onClick={() => setShowClearConfirm(true)}>清空全部本地数据</button>}
        </div>

        <div className="card" style={{ gridColumn: "1 / -1" }}>
          <div className="section-title">云端只读分享</div>
          <p style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 16 }}>云端分享尚未配置。当前只能使用本地导出和备份。</p>
          <button className="btn btn-outline" disabled style={{ opacity: 0.5 }}>云端分享未配置</button>
        </div>

        <div className="card"><div className="section-title">存储信息</div>
          <div style={{ fontSize: 13 }}>
            {[{k:"存储",v:"localStorage"},{k:"大小",v:(storageSize/1024).toFixed(1)+" KB"},{k:"版本",v:"v"+(data.version||1)},{k:"任务",v:data.tasks.length},{k:"番茄钟",v:(data.studySessions||[]).length},{k:"打卡",v:(data.dailyCheckIns||[]).length},{k:"日记",v:data.diaries.length},{k:"院校",v:data.schools.length}].map(r => <div key={r.k} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid var(--color-border)"}}><span>{r.k}</span><span style={{color:"var(--color-text-secondary)"}}>{r.v}</span></div>)}
          </div>
        </div>

      </div>

      <div className="card" style={{ marginTop: 20 }}>
        <div className="section-title">恢复默认示例数据</div>
        <p style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 16 }}>恢复为初始30天计划，当前进度将丢失</p>
        {confirmRestore ? (
          <div>
            <p style={{ color: "#ef4444", fontSize: 13, marginBottom: 10 }}>确定恢复默认数据？</p>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn btn-danger btn-sm" onClick={handleRestoreDefaults}>确认恢复</button>
              <button className="btn btn-outline btn-sm" onClick={() => setConfirmRestore(false)}>取消</button>
            </div>
          </div>
        ) : <button className="btn btn-outline" onClick={() => setConfirmRestore(true)}>恢复默认示例数据</button>}
      </div>

      <div className="card" style={{ marginTop: 20 }}>
        <div className="section-title">使用说明</div>
        <ul style={{ paddingLeft: 18, fontSize: 13, color: "var(--color-text-secondary)" }}>
          <li>所有数据存储在浏览器 localStorage 中。</li>
          <li>导出 JSON 包含完整数据，可用于跨设备迁移。</li>
          <li>导入/恢复/清空前自动备份，操作失败不影响当前数据。</li>
          <li>云端分享需配置 Supabase 后端，当前暂不可用。</li>
        </ul>
      </div>
    </div>
  );
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}
