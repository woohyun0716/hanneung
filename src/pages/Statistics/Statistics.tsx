import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import RateBars from '../../components/statistics/RateBars';
import WeekChart from '../../components/statistics/WeekChart';
import { questionService } from '../../services/questionService';
import { statisticsService as S } from '../../services/statisticsService';
import { storageService } from '../../services/storageService';

export default function Statistics() {
  const [total, setTotal] = useState<number | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => { questionService.getAll().then(q => setTotal(q.filter(x => !x.imageMissing).length)).catch(() => setError(true)); }, []);
  if (error) return <p role="alert" className="py-20 text-center">통계를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.</p>;
  if (total === null) return <p role="status" className="py-20 text-center text-ink/70">통계를 계산하는 중…</p>;
  const { attempts } = storageService.load();
  if (attempts.length === 0) return <div className="py-20 text-center"><h1 className="font-serif text-2xl font-bold">아직 학습 통계가 없어요</h1><p className="mt-2 text-ink/70">문제를 풀면 시대별·유형별 정답률을 보여 드려요.</p><Link to="/questions" className="btn mt-6">문제 풀러 가기</Link></div>;
  const periods = S.byKey(attempts, x => x.period), cats = S.byKey(attempts, x => x.category);
  const worstCat = [...cats].sort((a, b) => b.wrong - a.wrong)[0];
  const solved = new Set(attempts.map(a => a.questionId)).size;
  const hist = storageService.loadHistory().slice(-10).map(h => { const d = new Date(h.at); return { label: `${d.getMonth() + 1}/${d.getDate()}`, count: h.score }; });
  return (
    <div className="space-y-5"><h1 className="font-serif text-2xl font-bold">학습 통계</h1>
      <section className="grid grid-cols-3 gap-3">{[['전체 문제', `${total}개`], ['푼 문제', `${solved}개`], ['전체 정답률', `${S.accuracy(attempts)}%`]].map(([k, v]) => (
        <div key={k} className="rounded-2xl bg-white p-4 shadow-sm"><div className="text-xs text-ink/70">{k}</div><div className="mt-1 text-xl font-bold tabular-nums">{v}</div></div>))}</section>
      <section className="rounded-2xl bg-seal-soft p-5"><h2 className="font-bold">집중 복습이 필요해요</h2>
        <p className="mt-1 text-sm">오답률이 높은 시대: {periods.slice(0, 3).map(p => `${p.label}(${100 - p.rate}%)`).join(', ')}</p>
        <p className="text-sm">가장 많이 틀린 유형: {worstCat.wrong > 0 ? `${worstCat.label}(${worstCat.wrong}회)` : '없음'}</p></section>
      <WeekChart data={S.last7Days(attempts)} />
      {hist.length > 0 && <WeekChart title="모의고사 점수 (최근 10회)" data={hist} max={100} />}
      <RateBars title="시대별 정답률" rows={periods} /><RateBars title="문제 유형별 정답률" rows={cats} />
    </div>
  );
}
