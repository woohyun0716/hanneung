import { useState } from 'react';
import { periods } from '../../data/history/periods';
import { EXAM_MINUTES, EXAM_SIZE, examMinutes } from '../../services/examService';
import { isUsable } from '../../services/questionService';
import type { Question } from '../../types';

const card = (on: boolean) => `min-h-16 rounded-xl border-2 p-3 text-left transition-colors disabled:opacity-40 ${on ? 'border-celadon bg-celadon-soft' : 'border-ink/15 bg-white hover:border-celadon'}`;
export default function MockStart({ all: every, initialPeriod, onStart }: { all: Question[]; initialPeriod: string; onStart: (picked: Question[], minutes: number) => void }) {
  const all = every.filter(isUsable);
  const [sel, setSel] = useState<string[]>(initialPeriod ? [initialPeriod] : []); // 비어 있으면 전체 시대
  const pool = all.filter(q => sel.length === 0 || sel.includes(q.period));
  const count = Math.min(pool.length, EXAM_SIZE), minutes = examMinutes(count);
  const toggle = (n: string) => setSel(s => (s.includes(n) ? s.filter(x => x !== n) : [...s, n]));
  const start = () => { const picked = [...pool].sort(() => Math.random() - 0.5).slice(0, EXAM_SIZE); onStart(picked, examMinutes(picked.length)); };
  return (
    <div className="space-y-5"><h1 className="font-serif text-2xl font-bold">모의고사</h1>
      <p className="text-sm text-ink/70">전체 시대는 {EXAM_SIZE}문제·{EXAM_MINUTES}분이에요. 시대를 고르면 그 시대 문제로만 출제되고, 문제 수에 비례해 시간이 줄어요. 새로고침해도 남은 시간은 유지돼요.</p>
      <section><h2 className="font-bold">시대 선택</h2><p className="text-xs text-ink/70">여러 시대를 함께 고를 수 있어요. 고르지 않으면 전체 시대에서 출제돼요.</p>
        <div role="group" aria-label="시대" className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
          <button aria-pressed={sel.length === 0} className={card(sel.length === 0)} onClick={() => setSel([])}><span className="block font-bold">{sel.length === 0 && '✓ '}전체 시대</span><span className="block text-xs text-ink/70">{all.length}문제 중 {EXAM_SIZE}문제</span></button>
          {periods.map(p => { const n = all.filter(q => q.period === p.name).length, on = sel.includes(p.name);
            return <button key={p.id} aria-pressed={on} disabled={n === 0} className={card(on)} onClick={() => toggle(p.name)}><span className="block font-bold">{on && '✓ '}{p.name}</span><span className="block text-xs text-ink/70">{n}문제</span></button>; })}
        </div></section>
      <div className="sticky bottom-20 rounded-2xl bg-white p-4 shadow-sm md:bottom-4">
        <p role="status" className="text-sm">{count > 0 ? `${count}문제 · 제한시간 ${minutes}분${sel.length ? ` · ${sel.join(', ')}` : ''}${pool.length < 10 && sel.length ? ' (문제 수가 적어요)' : ''}` : '출제할 문제가 없어요.'}</p>
        <button disabled={count === 0} onClick={start} className="btn mt-2 disabled:opacity-40">시험 시작</button></div>
    </div>
  );
}
