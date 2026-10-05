import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { events } from '../../data/history/events';
import { periods } from '../../data/history/periods';
import { questionService } from '../../services/questionService';
import type { Question } from '../../types';

const fmt = (y: number) => (y < 0 ? `기원전 ${-y}년` : `${y}년`);
export default function Timeline() {
  const [period, setPeriod] = useState('');
  const [qs, setQs] = useState<Question[]>([]);
  useEffect(() => { questionService.getAll().then(a => setQs(a.filter(q => !q.imageMissing))).catch(() => setQs([])); }, []);
  const related = (text: string) => qs.filter(q => q.keywords.some(k => text.includes(k)));
  const list = events.filter(e => !period || e.period === period).sort((a, b) => a.year - b.year);
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3"><h1 className="font-serif text-2xl font-bold">한국사 연표</h1>
        <select aria-label="시대 필터" value={period} onChange={e => setPeriod(e.target.value)} className="min-h-11 rounded-lg border border-ink/15 bg-white px-3 text-sm">
          <option value="">전체 시대</option>{periods.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}</select></div>
      {list.length === 0 ? <p className="py-10 text-center text-ink/70">이 시대에 등록된 사건이 없어요.</p> :
        <ol className="space-y-3 border-l-2 border-celadon pl-4">{list.map(e => (
          <li key={e.year + e.title} className="rounded-2xl bg-white p-4 shadow-sm">
            <p className="text-sm font-bold tabular-nums text-celadon">{fmt(e.year)} <span className="font-normal text-ink/70">· {e.period}</span></p>
            <h2 className="mt-1 font-bold">{e.title}</h2><p className="mt-1 text-sm text-ink/80">{e.desc}</p>
            {e.people.length > 0 && <p className="mt-1 text-xs text-ink/70">관련 인물: {e.people.join(', ')}</p>}
            {related(`${e.title} ${e.desc}`).map(q => <Link key={q.id} to={`/questions?id=${q.id}`} className="mt-1 inline-flex min-h-11 items-center text-sm text-celadon underline">관련 문제 풀기</Link>)}
          </li>))}</ol>}
    </div>
  );
}
