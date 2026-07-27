import { AppData } from "../types";

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  summary: { tasks: number; studySessions: number; diaries: number; checkIns: number; schools: number; materials: number; questions: number; pressureQuestions: number; papers: number };
}

// Read-only validation - never mutates input
export function validateImportData(raw: unknown): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const summary = { tasks: 0, studySessions: 0, diaries: 0, checkIns: 0, schools: 0, materials: 0, questions: 0, pressureQuestions: 0, papers: 0 };

  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    errors.push("数据格式无效：不是有效的 JSON 对象");
    return { valid: false, errors, warnings, summary };
  }

  const obj = raw as Record<string, unknown>;

  // Unwrap ExportEnvelope
  let data = obj;
  if (obj.format === "study-planner-backup" && obj.data && typeof obj.data === "object") {
    data = obj.data as Record<string, unknown>;
    warnings.push("检测到备份信封格式，将提取内部数据");
  }

  // Check required array fields
  const arrays = ["tasks", "papers", "materials", "questions", "diaries", "schools"] as const;
  for (const key of arrays) {
    const val = data[key];
    if (val === undefined || val === null) {
      warnings.push(`字段 "${key}" 缺失`);
      summary[key] = 0;
    } else if (!Array.isArray(val)) {
      errors.push(`字段 "${key}" 不是数组`);
    } else {
      summary[key] = val.length;
    }
  }

  // Optional arrays
  for (const [key, target] of [["pressureQuestions", "pressureQuestions" as keyof typeof summary], ["studySessions", "studySessions" as keyof typeof summary], ["dailyCheckIns", "checkIns" as keyof typeof summary]] as const) {
    const val = data[key];
    if (val !== undefined && !Array.isArray(val)) {
      errors.push(`${key} 不是数组`);
    } else if (Array.isArray(val)) {
      summary[target] = val.length;
    }
  }

  // Check for duplicate task IDs
  if (Array.isArray(data.tasks)) {
    const ids = (data.tasks as Array<{ id?: string }>).map(t => t.id).filter(Boolean) as string[];
    const seen = new Set<string>();
    const dupes = ids.filter(id => seen.has(id) || !seen.add(id));
    if (dupes.length > 0) warnings.push(`发现 ${dupes.length} 个重复任务 ID`);
  }

  // Check date format
  if (Array.isArray(data.tasks)) {
    for (const t of data.tasks as Array<{ date?: unknown; title?: unknown }>) {
      if (t.date && typeof t.date === "string" && !/^\d{4}-\d{2}-\d{2}$/.test(t.date)) {
        warnings.push(`任务 "${t.title || "未知"}" 的日期格式异常`);
        break;
      }
    }
  }

  return { valid: errors.length === 0, errors, warnings, summary };
}

// Pure function - creates a new AppData copy, never mutates input
export function normalizeImportData(raw: unknown): AppData {
  const obj = (raw as Record<string, unknown>) || {};
  // Unwrap envelope
  const data: Record<string, unknown> = (obj.format === "study-planner-backup" && obj.data && typeof obj.data === "object")
    ? { ...(obj.data as Record<string, unknown>) }
    : { ...obj };

  // Ensure all required arrays exist (shallow copy arrays)
  const arrays = ["tasks", "papers", "materials", "questions", "diaries", "schools", "pressureQuestions"];
  for (const key of arrays) {
    if (!Array.isArray(data[key])) (data as Record<string, unknown>)[key] = [];
  }
  // Optional arrays
  for (const key of ["studySessions", "dailyCheckIns"]) {
    if (!Array.isArray(data[key])) (data as Record<string, unknown>)[key] = [];
  }

  // Set defaults for missing scalars
  if (!data.startDate) (data as Record<string, unknown>).startDate = "2026-07-25";
  (data as Record<string, unknown>).lastUpdated = new Date().toISOString();
  (data as Record<string, unknown>).version = data.version || 1;

  return data as unknown as AppData;
}
