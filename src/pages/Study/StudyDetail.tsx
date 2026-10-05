import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { questionService } from '../../services/questionService';
import { storageService } from '../../services/storageService';
import { studyService } from '../../services/studyService';
import type { Period, Question } from '../../types';

const Block = ({ title, items }: { title: string; items: string[] }) => items.length === 0 ? null : (
  <section className="rounded-2xl bg-white p-5 shadow-sm"><h2 className="font-bold">{title}</h2><ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed">{items.map(i => <li key={i}>{i}</li>)}</ul></section>);

export default function StudyDetail() {
  const { periodId = '' } = useParams();
  const [p, setP] = useState<Period | null | undefined>(undefined);
  const [qs, setQs] = useState<Question[]>([]);
  useEffect(() => { studyService.getPeriod(periodId).then(x => setP(x ?? null)); questionService.getAll().then(a => setQs(a.filter(q => !q.imageMissing))); }, [periodId]);
  useEffect(() => { if (p) storageService.markStudied(p.id); }, [p]);
  if (p === undefined) return <p role="status" className="py-20 text-center text-ink/70">불러오는 중…</p>;
  if (p === null) return <div className="py-20 text-center"><h1 className="font-serif text-2xl font-bold">없는 시대예요</h1><Link to="/study" className="btn mt-6">시대 목록으로</Link></div>;
  const related = qs.filter(q => q.period === p.name);
  return (
    <div className="space-y-4">
      <Link to="/study" className="inline-flex min-h-11 items-center text-sm text-celadon underline">시대 목록</Link>
      <header><h1 className="font-serif text-2xl font-bold">{p.name}</h1><p className="text-sm text-ink/70">{p.span}</p><p className="mt-2">{p.summary}</p></header>
      <Block title="핵심 개념" items={p.concepts} /><Block title="주요 사건" items={p.events} />
      <Block title="주요 인물" items={p.people} /><Block title="주요 문화재" items={p.assets} />
      <section className="rounded-2xl bg-white p-5 shadow-sm"><h2 className="font-bold">핵심 연표</h2>
        <ol className="mt-2 space-y-2 border-l-2 border-celadon pl-4 text-sm">{p.timeline.map(([y, t]) => <li key={y}><b className="tabular-nums">{y}</b> {t}</li>)}</ol></section>
      <section className="rounded-2xl bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><h2 className="font-bold">관련 문제</h2><Link to={`/questions?period=${encodeURIComponent(p.name)}`} className="inline-flex min-h-11 items-center text-sm text-celadon underline">이 시대 문제 풀기</Link></div>
        <Link to={`/mock-test?period=${encodeURIComponent(p.name)}`} className="inline-flex min-h-11 items-center text-sm text-celadon underline">이 시대 모의고사 보기</Link>
        {related.length === 0 ? <p className="mt-2 text-sm text-ink/70">이 시대의 문제는 아직 없어요.</p> :
          <ul className="mt-2 divide-y divide-ink/10">{related.map(q => <li key={q.id}><Link to={`/questions?id=${q.id}`} className="flex min-h-11 items-center text-sm text-celadon underline">{q.question.slice(0, 40)}{q.question.length > 40 && '…'}</Link></li>)}</ul>}</section>
    </div>
  );
}
