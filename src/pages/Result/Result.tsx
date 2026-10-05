import { useState } from 'react';
import { Link } from 'react-router-dom';
import RateBars from '../../components/statistics/RateBars';
import { examService } from '../../services/examService';
import { storageService } from '../../services/storageService';

export default function Result() {
  const r = storageService.loadResult();
  const [added, setAdded] = useState<boolean | null>(null);
  if (!r) return <div className="py-20 text-center"><h1 className="font-serif text-2xl font-bold">아직 시험 결과가 없어요</h1><p className="mt-2 text-ink/70">모의고사를 제출하면 여기에서 분석을 볼 수 있어요.</p><Link to="/mock-test" className="btn mt-6">모의고사 보기</Link></div>;
  const wrong = r.items.filter(i => !i.correct);
  return (
    <div className="space-y-5">
      <section className="rounded-2xl bg-white p-6 shadow-sm"><p className="text-sm text-ink/70">총점</p>
        <p className="font-serif text-5xl font-bold tabular-nums">{r.score}<span className="text-xl">점</span></p>
        <p className="mt-2">예상 등급 <b>{examService.grade(r.score)}</b> <span className="text-xs text-ink/70">(심화 기준 예상치)</span></p>
        {r.total < 50 && <p className="mt-1 text-xs text-ink/70">{r.total}문제만 출제된 시험이라 등급은 참고용이에요.</p>}
        <p className="mt-1 text-sm text-ink/70">맞힌 문제 {r.correct}개 · 틀린 문제 {r.total - r.correct}개 · 정답률 {r.score}%</p></section>
      <RateBars title="시대별 정답률" rows={examService.rates(r.items, (i: { period: string }) => i.period)} />
      <RateBars title="문제 유형별 정답률" rows={examService.rates(r.items, (i: { category: string }) => i.category)} />
      <section className="rounded-2xl bg-white p-5 shadow-sm"><h2 className="font-bold">틀린 문제 {wrong.length}개</h2>
        {wrong.length === 0 ? <p className="mt-2 text-sm text-ink/70">틀린 문제가 없어요. 훌륭해요!</p> :
          <ul className="mt-2 divide-y divide-ink/10">{wrong.map(w => <li key={w.questionId} className="flex items-center justify-between py-2 text-sm"><span>{w.period} · {w.category}{w.selected === null && ' (미응답)'}</span><Link className="inline-flex min-h-11 items-center text-celadon underline" to={`/questions?id=${w.questionId}`}>해설 보기</Link></li>)}</ul>}
        <div className="mt-4 flex flex-wrap gap-2">
          {wrong.length > 0 && <button className="btn" onClick={() => setAdded(storageService.addWrongNotes(wrong.map(w => w.questionId)))}>오답노트에 추가</button>}
          <Link to="/mock-test" className="inline-flex min-h-12 items-center rounded-lg border border-ink/15 px-5">다시 풀기</Link></div>
        {added === true && <p role="status" className="mt-2 text-sm text-celadon">오답노트에 추가했어요.</p>}
        {added === false && <p role="alert" className="mt-2 text-sm text-seal">저장하지 못했어요. 브라우저 저장 공간을 확인해 주세요.</p>}
      </section>
    </div>
  );
}
