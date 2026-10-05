import type { ExamResult, Question } from '../types';
export const EXAM_SIZE = 50;
export const EXAM_MINUTES = 80;
// 실제 시험(50문제 80분)과 같은 문제당 시간 비율, 최소 10분
export const examMinutes = (n: number) => Math.max(10, Math.ceil((n * EXAM_MINUTES) / EXAM_SIZE));
export const examService = {
  build(qs: Question[], answers: Record<number, number>): ExamResult {
    const items = qs.map(q => { const s = answers[q.id]; return { questionId: q.id, selected: s ?? null, correct: s === q.answer, period: q.period, category: q.category }; });
    const correct = items.filter(i => i.correct).length;
    return { at: new Date().toISOString(), total: qs.length, correct, score: qs.length ? Math.round((correct / qs.length) * 100) : 0, items };
  },
  // 심화 기준 점수 구간(예상치): 80↑ 1급, 70↑ 2급, 60↑ 3급
  grade: (score: number) => (score >= 80 ? '1급' : score >= 70 ? '2급' : score >= 60 ? '3급' : '합격 기준 미달'),
  rates(items: { correct: boolean }[], key: (i: never) => string) {
    const m = new Map<string, { t: number; c: number }>();
    (items as never[]).forEach(i => { const k = key(i); const v = m.get(k) ?? { t: 0, c: 0 }; v.t++; if ((i as { correct: boolean }).correct) v.c++; m.set(k, v); });
    return [...m].map(([label, v]) => ({ label, total: v.t, rate: Math.round((v.c / v.t) * 100) })).sort((a, b) => a.rate - b.rate);
  },
};
