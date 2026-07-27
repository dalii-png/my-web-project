import { AppData, StudySession } from "../types";

export function getCompletedSessions(data: AppData): StudySession[] {
  return (data.studySessions || []).filter(s => s.status === "completed");
}

export function dateStr(d: Date): string { return d.toISOString().split("T")[0]; }

export function getStudyMinutesForDate(data: AppData, date: string): number {
  return getCompletedSessions(data)
    .filter(s => s.endedAt && s.endedAt.startsWith(date))
    .reduce((sum, s) => sum + s.actualMinutes, 0);
}

export function getStudyMinutesForRange(data: AppData, start: string, end: string): number {
  return getCompletedSessions(data)
    .filter(s => s.endedAt && s.endedAt >= start && s.endedAt <= end)
    .reduce((sum, s) => sum + s.actualMinutes || 0, 0);
}

export function getCompletedPomodorosForRange(data: AppData, start: string, end: string): number {
  return getCompletedSessions(data).filter(s => s.endedAt && s.endedAt >= start && s.endedAt <= end).length;
}

export function getCompletedPomodorosForDate(data: AppData, date: string): number {
  return getCompletedSessions(data).filter(s => s.endedAt && s.endedAt.startsWith(date)).length;
}

export function getTodayStudyMinutes(data: AppData): number {
  return getStudyMinutesForDate(data, dateStr(new Date()));
}

export function getWeekStudyMinutes(data: AppData): number {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const monday = new Date(now); monday.setDate(now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1));
  const sunday = new Date(monday); sunday.setDate(monday.getDate() + 6);
  return getStudyMinutesForRange(data, dateStr(monday), dateStr(sunday) + "T23:59:59");
}

export function getMonthStudyMinutes(data: AppData): number {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return getStudyMinutesForRange(data, dateStr(firstDay), dateStr(lastDay) + "T23:59:59");
}

export function getTodayPomodoros(data: AppData): number {
  return getCompletedPomodorosForDate(data, dateStr(new Date()));
}

export function getWeekPomodoros(data: AppData): number {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const monday = new Date(now); monday.setDate(now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1));
  const sunday = new Date(monday); sunday.setDate(monday.getDate() + 6);
  return getCompletedPomodorosForRange(data, dateStr(monday), dateStr(sunday) + "T23:59:59");
}

export function getMonthPomodoros(data: AppData): number {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return getCompletedPomodorosForRange(data, dateStr(firstDay), dateStr(lastDay) + "T23:59:59");
}

export function getTaskStatsForDate(data: AppData, date: string): { total: number; completed: number; tasks: import("../types").Task[] } {
  const tasks = data.tasks.filter(t => t.date === date);
  return { total: tasks.length, completed: tasks.filter(t => t.completed).length, tasks };
}