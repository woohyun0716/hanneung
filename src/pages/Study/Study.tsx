import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { statisticsService as S } from '../../services/statisticsService';
import { storageService } from '../../services/storageService';
import { studyService } from '../../services/studyService';
import type { Period } from '../../types';

export default function Study() {
  const [list, setList] = useState<Period[] | null>(null);
  useEffect(() => { studyService.getPeriods().then(setList); }, []);
  if (!list) return <p role="status" className="py-20 text-center text-ink/70">불러오는 중…</p>;
  const rates = S.byPeriod(storageService.load().attempts);
  return (
    <div className="space-y-4"><h1 className="font-serif text-2xl font-bold">시대별 학습</h1>
      <ul className="grid gap-3 sm:grid-cols-2">{list.map(p => { const r = rates.find(x => x.period === p.name); return (
        <li key={p.id}><Link to={`/study/${p.id}`} className="block min-h-24 rounded-2xl bg-white p-4 shadow-sm transition-colors hover:bg-celadon-soft">
          <h2 className="font-bold">{p.name}</h2><p className="text-xs text-ink/70">{p.span}</p>
          <p className="mt-1 text-sm text-ink/80">{p.summary}</p>
          <p className="mt-2 text-xs text-celadon">{r ? `내 정답률 ${r.rate}%` : '아직 푼 문제가 없어요'}</p></Link></li>); })}</ul>
    </div>
  );
}
