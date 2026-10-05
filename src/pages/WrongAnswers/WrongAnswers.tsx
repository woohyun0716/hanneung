import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { questionService } from '../../services/questionService';
import { statisticsService as S } from '../../services/statisticsService';
import { storageService } from '../../services/storageService';
import type { Question } from '../../types';

export default function WrongAnswers() {
  const [qs, setQs] = useState<Question[] | null>(null);
  const [error, setError] = useState(false);
  const [rec, setRec] = useState(() => storageService.load());
  const [failed, setFailed] = useState(false);
  useEffect(() => { questionService.getAll().then(setQs).catch(() => setError(true)); }, []);
  if (error) return <p role="alert" className="py-20 text-center">문제를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.</p>;
  if (!qs) return <p role="status" className="py-20 text-center text-ink/70">오답노트를 불러오는 중…</p>;
  const list = S.wrongList(rec.attempts, rec.dismissed);
  const remove = (id: number) => { setFailed(!storageService.dismissWrong(id)); setRec(storageService.load()); };
  return (
    <div className="space-y-4">
      <h1 className="font-serif text-2xl font-bold">오답노트</h1>
      {failed && <p role="alert" className="text-sm text-seal">삭제를 저장하지 못했어요. 브라우저 저장 공간을 확인해 주세요.</p>}
      {list.length === 0 ? <div className="rounded-2xl bg-white p-8 text-center shadow-sm"><p className="font-bold">오답노트가 비어 있어요</p><p className="mt-1 text-sm text-ink/70">문제를 풀다 틀리면 자동으로 모아 둘게요.</p><Link to="/questions" className="btn mt-4">문제 풀러 가기</Link></div> :
        <ul className="space-y-3">{list.map(w => { const q = qs.find(x => x.id === w.questionId); return (
          <li key={w.questionId} className="rounded-2xl bg-white p-4 shadow-sm">
            <p className="text-xs text-ink/70">{w.period} · {w.category}</p>
            <p className="mt-1 line-clamp-2">{q ? q.question : '삭제되었거나 찾을 수 없는 문제예요.'}</p>
            <p className="mt-2 text-sm text-ink/70">틀린 횟수 {w.wrongCount}회 · 정답률 {w.rate}% · 마지막 오답 {w.lastWrong.slice(0, 10)}</p>
            <div className="mt-3 flex gap-2">{q && <Link to={`/questions?id=${q.id}`} className="btn">다시 풀기</Link>}
              <button onClick={() => remove(w.questionId)} className="min-h-12 rounded-lg border border-ink/15 px-5 text-seal">삭제</button></div>
          </li>); })}</ul>}
    </div>
  );
}
