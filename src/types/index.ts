export type Difficulty = 'easy' | 'medium' | 'hard';
export interface Question {
  id: number; exam: string; year: number; questionNumber: number;
  period: string; category: string; difficulty: Difficulty;
  question: string; image?: string; imageCredit?: string; imageMissing?: boolean; choices: string[]; answer: number; // 0-based index
  explanation: string; choiceExplanations?: string[]; keywords: string[];
  source: string; // 출처·이용조건 확인용 (실제 기출 연결 시 필수)
}
export interface Attempt { questionId: number; selected: number; correct: boolean; period: string; category: string; at: string }
export interface UserRecords { attempts: Attempt[]; bookmarks: number[]; wrongNotes: number[]; dismissed: Record<number, string>; studyLog: string[] }
export interface ExamSession { ids: number[]; answers: Record<number, number>; endAt: number; minutes?: number }
export interface ResultItem { questionId: number; selected: number | null; correct: boolean; period: string; category: string }
export interface ExamResult { at: string; total: number; correct: number; score: number; items: ResultItem[] }
export interface Period { id: string; name: string; span: string; summary: string; concepts: string[]; events: string[]; people: string[]; assets: string[]; timeline: [string, string][] }
export interface WrongEntry { questionId: number; wrongCount: number; total: number; rate: number; lastWrong: string; period: string; category: string }
export interface TimelineEvent { year: number; title: string; desc: string; period: string; people: string[]; questionIds: number[] }
