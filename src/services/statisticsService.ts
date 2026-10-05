import type { Attempt, WrongEntry } from '../types';
// 한국 사용자 기준 날짜 경계를 위해 UTC가 아닌 로컬 날짜로 비교한다
const day = (iso: string) => { const d = new Date(iso); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
const today = () => day(new Date().toISOString());
export const statisticsService = {
  accuracy: (a: Attempt[]) => (a.length ? Math.round((a.filter(x => x.correct).length / a.length) * 100) : null),
  todayCount: (a: Attempt[]) => a.filter(x => day(x.at) === today()).length,
  streak(a: Attempt[]) {
    const days = new Set(a.map(x => day(x.at))); let n = 0; const d = new Date();
    if (!days.has(day(d.toISOString()))) d.setDate(d.getDate() - 1);
    while (days.has(day(d.toISOString()))) { n++; d.setDate(d.getDate() - 1); }
    return n;
  },
  byPeriod(a: Attempt[]) {
    const m = new Map<string, { t: number; c: number }>();
    a.forEach(x => { const v = m.get(x.period) ?? { t: 0, c: 0 }; v.t++; if (x.correct) v.c++; m.set(x.period, v); });
    return [...m].map(([period, v]) => ({ period, total: v.t, rate: Math.round((v.c / v.t) * 100) }));
  },
  weakest(a: Attempt[]) { return this.byPeriod(a).filter(p => p.total >= 2).sort((x, y) => x.rate - y.rate)[0]; },
  // 삭제한 시점 이후에 다시 틀린 문제만 오답노트에 남긴다
  wrongList(a: Attempt[], dismissed: Record<number, string>): WrongEntry[] {
    const ids = [...new Set(a.map(x => x.questionId))];
    return ids.flatMap(id => {
      const all = a.filter(x => x.questionId === id), wrong = all.filter(x => !x.correct && x.at > (dismissed[id] ?? ''));
      if (!wrong.length) return [];
      const last = wrong[wrong.length - 1];
      return [{ questionId: id, wrongCount: wrong.length, total: all.length, rate: Math.round(((all.length - all.filter(x => !x.correct).length) / all.length) * 100), lastWrong: last.at, period: last.period, category: last.category }];
    }).sort((x, y) => y.lastWrong.localeCompare(x.lastWrong));
  },
  byKey(a: Attempt[], key: (x: Attempt) => string) {
    const m = new Map<string, { t: number; c: number }>();
    a.forEach(x => { const k = key(x); const v = m.get(k) ?? { t: 0, c: 0 }; v.t++; if (x.correct) v.c++; m.set(k, v); });
    return [...m].map(([label, v]) => ({ label, total: v.t, wrong: v.t - v.c, rate: Math.round((v.c / v.t) * 100) })).sort((x, y) => x.rate - y.rate);
  },
  last7Days(a: Attempt[]) {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (6 - i));
      const k = day(d.toISOString());
      return { label: `${d.getMonth() + 1}/${d.getDate()}`, count: a.filter(x => day(x.at) === k).length };
    });
  },
  // 오늘 다시 푼 문제 중, 이전 날짜에 틀렸던 문제 수 (오답 복습량)
  reviewCountToday(a: Attempt[]) {
    const t = today(), before = new Set(a.filter(x => !x.correct && day(x.at) !== t).map(x => x.questionId));
    return new Set(a.filter(x => day(x.at) === t && before.has(x.questionId)).map(x => x.questionId)).size;
  },
  studiedToday: (log: string[], periodId: string) => log.includes(`${today()}:${periodId}`),
  recentWrong: (a: Attempt[], n = 3) => a.filter(x => !x.correct).slice(-n).reverse(),
};
