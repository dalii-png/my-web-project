// ==================== 基础类型 ====================

export type Priority = '高' | '中' | '低'
export type Period = '上午' | '下午' | '晚上' | '全天'
export type TaskCategory =
  | '论文' | '专业课' | '跨专业' | '文献热点'
  | '材料' | '中文面试' | '英语面试' | '复盘'

export interface Task {
  id: string
  day: number
  phase: string
  date?: string
  period: Period
  category: TaskCategory
  title: string
  description: string
  minimumTask: string
  completed: boolean
  priority: Priority
  note: string
  createdAt: string
  completedAt?: string
  // === 阶段1新增字段 ===
  startTime?: string
  endTime?: string
  estimatedMinutes?: number
  actualMinutes?: number
  parentId?: string
  sortOrder?: number
  source?: 'default' | 'user'
  updatedAt?: string
}

export const MODULES = [
  '目标定位', '论文攻坚', '专业基础',
  '简历深挖', '中英文面试', '压力面', '材料归档',
] as const
export type ModuleName = typeof MODULES[number]

export type PaperStatus = '初稿' | '修改中' | '准终稿' | '已完成PDF' | '已提交'
export type IssueLevel = 'S级' | 'A级' | 'B级'
export type IssueStatus = '待修改' | '修改中' | '已完成'

export interface PaperIssue {
  id: string; name: string; level: IssueLevel; description: string
  suggestion: string; status: IssueStatus; deadline?: string; note: string
}

export interface PaperOnePager {
  researchQuestion: string; background: string; dataSource: string
  coreVariables: string; modelMethod: string; coreConclusion: string
  mechanism: string; contribution: string; limitations: string
  futureImprovements: string
}

export interface Paper {
  id: string; title: string; status: PaperStatus; lastModified: string
  version: string; note: string; issues: PaperIssue[]; onePager: PaperOnePager
}

export type MaterialCategory =
  | '基础身份材料' | '成绩英语材料' | '文书材料'
  | '科研论文材料' | '竞赛和证书材料' | '其他材料'

export type MaterialStatus = '未准备' | '准备中' | '已扫描' | '已转PDF' | '已检查' | '已提交'

export interface Material {
  id: string; name: string; category: MaterialCategory; status: MaterialStatus
  filePath: string; scanned: boolean; pdfConverted: boolean; checked: boolean
  deadline?: string; priority: Priority; note: string
}

export const QUESTION_CATEGORIES = [
  '自我介绍', '跨专业动机', '本科成绩',
  '药品集采论文', '数字鸿沟论文',
  '概率论与数理统计', '计量经济学', '宏观经济学', '微观经济学',
  '金融学', '数字经济', '英文面试', '研究生规划', '时政热点',
] as const
export type QuestionCategory = typeof QUESTION_CATEGORIES[number]
export type QuestionStatus = '未准备' | '已写答案' | '已背诵' | '已模拟' | '需要修改'

export interface Question {
  id: string; category: QuestionCategory; question: string
  priority: 'S级' | 'A级' | 'B级'; answer: string; keywords: string[]
  status: QuestionStatus; confidence: number; lastReviewedAt?: string; note: string
}

export interface PressureQuestion {
  id: string; question: string; pressureLevel: number; standardFramework: string
  personalAnswer: string; evidence: string; avoidExpressions: string
  proficiency: number; lastSimulated?: string
}

export interface DiaryEntry {
  id: string; date: string; completedTasks: string; mostImportantProgress: string
  weaknesses: string; knowledgeMemo: string; interviewPractice: string
  moodScore: number; efficiencyScore: number; tomorrowTop3: string; note: string
}

export interface Profile {
  name: string; school: string; major: string; grade: string
  gpa: string; rank: string; cet6: string; skills: string[]
  certificates: string[]; research: string[]; competitions: string[]; target: string
}


export type PomodoroMode = '25/5' | '50/10' | 'custom'
export type SessionStatus = 'running' | 'paused' | 'completed' | 'abandoned'

export interface StudySession {
  id: string
  taskId?: string
  mode: PomodoroMode
  plannedMinutes: number
  breakMinutes: number
  actualMinutes: number
  startedAt: string
  pausedAt?: string
  endedAt?: string
  status: SessionStatus
  createdAt: string
  updatedAt?: string
}


export interface DailyCheckIn {
  id: string
  date: string
  checkInTimes: string[]
  note: string
  content: string
  createdAt: string
  updatedAt: string
}
export interface AppData {
  version?: number
  studySessions?: StudySession[]
  dailyCheckIns?: DailyCheckIn[]
  schools: SchoolApplication[]
  profile?: Profile; tasks: Task[]; papers: Paper[]; materials: Material[]
  questions: Question[]; pressureQuestions: PressureQuestion[]; diaries: DiaryEntry[]
  startDate: string; lastUpdated: string
}

// ==================== 院校申请 ====================

export type SchoolStatus = '待关注' | '准备中' | '已报名' | '已提交' | '已面试' | '已录取' | '已拒绝' | '已截止'
export type SchoolPriority = '冲刺' | '重点' | '保底' | '待评估'

export interface SchoolApplication {
  id: string
  school: string
  college: string
  applicationTime: string
  applicationStartDate?: string
  applicationDeadline?: string
  specificMajor: string
  degreeType: string
  recommendation: string
  requirements: string[]
  materials: string[]
  status: SchoolStatus
  priority: SchoolPriority
  sourceUrl: string
  notes: string
  createdAt: string
  updatedAt: string
}
