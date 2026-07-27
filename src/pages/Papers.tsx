import { useState, useEffect } from "react";
import { AppData, Paper, IssueLevel, IssueStatus, PaperOnePager } from "../types";
import { saveData } from "../utils/storage";

const LEVEL_COLORS: Record<IssueLevel, string> = { "S级": "badge-red", "A级": "badge-orange", "B级": "badge-blue" };

export default function Papers({ data }: { data: AppData }) {
  const [papers, setPapers] = useState<Paper[]>(data.papers);
  useEffect(() => { setPapers(data.papers) }, [data.papers]);
  const [expandedPaper, setExpandedPaper] = useState<string | null>(null);
  const [showOnePager, setShowOnePager] = useState<string | null>(null);

  const syncSave = (updated: Paper[]) => { setPapers(updated); data.papers = updated; saveData(data); };

  const toggleIssue = (paperId: string, issueId: string, next: IssueStatus) => {
    syncSave(papers.map(p => p.id === paperId ? { ...p, issues: p.issues.map(i => i.id === issueId ? { ...i, status: next } : i), lastModified: new Date().toISOString().split("T")[0] } : p));
  };

  const updateIssueNote = (paperId: string, issueId: string, note: string) => {
    syncSave(papers.map(p => p.id === paperId ? { ...p, issues: p.issues.map(i => i.id === issueId ? { ...i, note } : i) } : p));
  };

  const updateOnePager = (paperId: string, field: keyof PaperOnePager, value: string) => {
    syncSave(papers.map(p => p.id === paperId ? { ...p, onePager: { ...p.onePager, [field]: value }, lastModified: new Date().toISOString().split("T")[0] } : p));
  };

  const updatePaperField = (paperId: string, field: "status" | "version" | "note", value: string) => {
    syncSave(papers.map(p => p.id === paperId ? { ...p, [field]: value, lastModified: new Date().toISOString().split("T")[0] } : p));
  };

  const onePagerLabels: Record<string, string> = {
    researchQuestion: "研究问题", background: "研究背景", dataSource: "数据来源",
    coreVariables: "核心变量", modelMethod: "模型方法", coreConclusion: "核心结论",
    mechanism: "理论机制", contribution: "边际贡献", limitations: "局限性", futureImprovements: "未来改进"
  };

  return (
    <div>
      <div className="page-header"><h2>论文攻坚</h2><p>管理论文修改进度和问题追踪</p></div>
      {papers.map(paper => {
        const totalIssues = paper.issues.length;
        const completedIssues = paper.issues.filter(i => i.status === "已完成").length;
        const sLevelCount = paper.issues.filter(i => i.level === "S级" && i.status !== "已完成").length;
        const expanded = expandedPaper === paper.id;
        const showingOnePager = showOnePager === paper.id;
        return (
          <div key={paper.id} className="card paper-card">
            <div className="task-card-header" style={{ cursor: "pointer" }} onClick={() => setExpandedPaper(expanded ? null : paper.id)}>
              <div>
                <h3>{paper.title}</h3>
                <div className="paper-status">
                  <span className="badge badge-orange">{paper.status}</span>
                  <span style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>v{paper.version}</span>
                  <span style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>修改于 {paper.lastModified}</span>
                  {sLevelCount > 0 && <span className="badge badge-red">S级: {sLevelCount}</span>}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div>
                  <div style={{ fontSize: 11, color: "var(--color-text-secondary)", textAlign: "right" }}>{completedIssues}/{totalIssues}</div>
                  <div className="progress-bar" style={{ width: 100 }}><div className="progress-fill" style={{ width: (totalIssues > 0 ? Math.round((completedIssues / totalIssues) * 100) : 0) + "%" }} /></div>
                </div>
                <span style={{ fontSize: 18, transition: "transform 0.2s", transform: expanded ? "rotate(90deg)" : "" }}>▶</span>
              </div>
            </div>
            {expanded && (
              <>
                <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
                  <div className="form-group" style={{ margin: 0 }}><label>状态</label>
                    <select className="form-select" style={{ width: 130 }} value={paper.status} onChange={e => updatePaperField(paper.id, "status", e.target.value)}>
                      {["初稿", "修改中", "准终稿", "已完成PDF", "已提交"].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="form-group" style={{ margin: 0 }}><label>版本</label>
                    <input className="form-input" style={{ width: 100 }} value={paper.version} onChange={e => updatePaperField(paper.id, "version", e.target.value)} />
                  </div>
                  <button className="btn btn-outline btn-sm" onClick={() => setShowOnePager(showingOnePager ? null : paper.id)}>{showingOnePager ? "收起一页纸" : "论文一页纸"}</button>
                </div>
                {showingOnePager && (
                  <div className="card" style={{ background: "var(--color-bg)", marginBottom: 14 }}>
                    <h4 style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>论文一页纸</h4>
                    {(Object.keys(onePagerLabels) as Array<keyof PaperOnePager>).map(field => (
                      <div key={field} className="form-group"><label>{onePagerLabels[field]}</label>
                        <textarea className="form-textarea" rows={2} value={paper.onePager[field]} onChange={e => updateOnePager(paper.id, field, e.target.value)} />
                      </div>
                    ))}
                  </div>
                )}
                <div className="section-title">修改清单 ({totalIssues}项)</div>
                {paper.issues.map(issue => (
                  <div key={issue.id} style={{ padding: "10px 0", borderBottom: "1px solid var(--color-border)", fontSize: 13 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 6 }}>
                      <div style={{ flex: 1 }}>
                        <strong>{issue.name}</strong>
                        <div style={{ marginTop: 3, display: "flex", gap: 6, flexWrap: "wrap" }}>
                          <span className={`badge ${LEVEL_COLORS[issue.level]}`}>{issue.level}</span>
                          <span className={`badge ${issue.status === "已完成" ? "badge-green" : "badge-orange"}`}>{issue.status}</span>
                        </div>
                        {issue.description && <div style={{ marginTop: 4, color: "var(--color-text-secondary)", fontSize: 12 }}>{issue.description}</div>}
                        {issue.suggestion && <div style={{ marginTop: 2, color: "var(--color-primary)", fontSize: 11 }}>建议: {issue.suggestion}</div>}
                      </div>
                      <select className="form-select" style={{ width: 90, fontSize: 11 }} value={issue.status} onChange={e => toggleIssue(paper.id, issue.id, e.target.value as IssueStatus)}>
                        <option value="待修改">待修改</option><option value="修改中">修改中</option><option value="已完成">已完成</option>
                      </select>
                    </div>
                    <input className="note-input" placeholder="备注..." value={issue.note} onChange={e => updateIssueNote(paper.id, issue.id, e.target.value)} />
                  </div>
                ))}
                <div className="form-group" style={{ marginTop: 14 }}><label>论文备注</label>
                  <textarea className="form-textarea" rows={2} value={paper.note} onChange={e => updatePaperField(paper.id, "note", e.target.value)} />
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}