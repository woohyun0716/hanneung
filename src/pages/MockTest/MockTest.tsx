import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { examService } from '../../services/examService';
import { questionService } from '../../services/questionService';
import { storageService } from '../../services/storageService';
import MockStart from '../../components/mockTest/MockStart';
import QuestionImage from '../../components/question/QuestionImage';
import type { ExamSession, Question } from '../../types';

export default function MockTest() {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const [qs, setQs] = useState<Question[] | null>(null);
  const [err, setErr] = useState(false);
  const [sess, setSess] = useState<ExamSession | null>(null);
  const [idx, setIdx] = useState(0);
  const [now, setNow] = useState(Date.now());
  const [confirming, setConfirming] = useState(false);
  const done = useRef(false);

  useEffect(() => {
    questionService.getAll().then(all => {
      const saved = storageService.loadExam(); // 새로고침해도 시간·답안·출제 문제 유지
      const picked = saved ? saved.ids.map(id => all.find(q => q.id === id)) : [];
      if (saved && picked.length > 0 && picked.every(Boolean)) { setQs(picked as Question[]); setSess(saved); } else setQs(all.filter(q => !q.imageMissing));
    }).catch(() => setErr(true));
  }, []);
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);

  const finish = (s: ExamSession, list: Question[]) => {
    if (done.current) return; done.current = true;
    const r = examService.build(list, s.answers); const base = Date.now();
    r.items.forEach((it, k) => storageService.addAttempt({ questionId: it.questionId, selected: it.selected ?? -1, correct: it.correct, period: it.period, category: it.category, at: new Date(base + k).toISOString() }));
    storageService.saveResult(r); storageService.clearExam(); nav('/result');
  };
  const left = sess ? Math.max(0, sess.endAt - now) : 0;
  useEffect(() => { if (sess && qs && left === 0) finish(sess, qs); }); // 시간 종료 시 자동 제출

  if (err) return <Msg t="문제를 불러오지 못했어요" b="잠시 후 다시 시도해 주세요." />;
  if (!qs) return <p role="status" className="py-20 text-center text-ink/70">시험지를 준비하는 중…</p>;
  if (qs.length === 0) return <Msg t="출제할 문제가 없어요" b="문제 데이터를 확인해 주세요." />;

  if (!sess) return <MockStart all={qs} initialPeriod={params.get('period') ?? ''} onStart={(picked, minutes) => { const s = { ids: picked.map(q => q.id), answers: {}, endAt: Date.now() + minutes * 60000, minutes }; storageService.saveExam(s); done.current = false; setQs(picked); setSess(s); setIdx(0); }} />;

  const q = qs[idx]; const picked = sess.answers[q.id];
  const pick = (n: number) => { const s = { ...sess, answers: { ...sess.answers, [q.id]: n } }; storageService.saveExam(s); setSess(s); };
  const unanswered = qs.filter(x => sess.answers[x.id] === undefined).length;
  const mm = String(Math.floor(left / 60000)).padStart(2, '0'), ss = String(Math.floor((left % 60000) / 1000)).padStart(2, '0');
  return (
    <div className="space-y-4">
      <div className="sticky top-0 z-10 flex items-center justify-between rounded-xl bg-white p-3 shadow-sm">
        <span className="text-sm">문제 {idx + 1}/{qs.length}</span>
        <span role="timer" aria-label="남은 시간" className={`font-bold tabular-nums ${left < 300000 ? 'text-seal' : ''}`}>{mm}:{ss}</span>
        <button className="min-h-11 rounded-lg border border-ink/15 px-3 text-sm" onClick={() => setConfirming(true)}>제출</button>
      </div>
      <p role="status" className="sr-only">{left > 0 && left <= 600000 ? `남은 시간 ${left <= 60000 ? 1 : left <= 300000 ? 5 : 10}분 이하` : ''}</p>
      <article className="rounded-2xl bg-white p-5 shadow-sm">
        <h1 className="font-serif text-lg font-bold leading-relaxed">{q.question}</h1>
        {q.image && <QuestionImage key={q.id} src={q.image} credit={q.imageCredit} />}
        <div role="group" aria-label="선택지" className="mt-4 space-y-2">
          {q.choices.map((c, n) => <button key={n} aria-pressed={picked === n} onClick={() => pick(n)} className={`flex min-h-14 w-full gap-3 rounded-xl border-2 p-3 text-left ${picked === n ? 'border-celadon bg-celadon-soft' : 'border-ink/15 bg-white'}`}><b>{n + 1}</b><span>{c}</span></button>)}
        </div>
        <div className="mt-4 flex gap-2">
          <button className="btn disabled:opacity-40" disabled={idx === 0} onClick={() => setIdx(idx - 1)}>이전</button>
          <button className="btn disabled:opacity-40" disabled={idx === qs.length - 1} onClick={() => setIdx(idx + 1)}>다음</button>
        </div>
      </article>
      <nav aria-label="문제 이동" className="grid grid-cols-7 gap-1.5 sm:grid-cols-10">
        {qs.map((x, k) => <button key={x.id} aria-label={`${k + 1}번 문제${sess.answers[x.id] !== undefined ? ', 답안 체크됨' : ''}`} aria-current={k === idx} onClick={() => setIdx(k)}
          className={`min-h-11 rounded-md border text-xs ${k === idx ? 'border-ink' : 'border-ink/15'} ${sess.answers[x.id] !== undefined ? 'bg-celadon text-white' : 'bg-white'}`}>{k + 1}</button>)}
      </nav>
      {confirming && <div role="alertdialog" aria-modal="true" aria-label="제출 확인" className="fixed inset-0 z-20 grid place-items-center bg-black/50 p-4">
        <div className="w-full max-w-sm rounded-2xl bg-white p-5"><h2 className="font-bold">시험을 제출할까요?</h2>
          <p className="mt-2 text-sm text-ink/70">{unanswered > 0 ? `답을 체크하지 않은 문제가 ${unanswered}개 있어요.` : '모든 문제에 답을 체크했어요.'} 제출하면 수정할 수 없어요.</p>
          <div className="mt-4 flex gap-2"><button autoFocus className="btn" onClick={() => finish(sess, qs)}>제출하기</button><button className="min-h-12 rounded-lg border border-ink/15 px-5" onClick={() => setConfirming(false)}>계속 풀기</button></div></div></div>}
    </div>
  );
}
function Msg({ t, b }: { t: string; b: string }) { return <div className="py-20 text-center"><h1 className="font-serif text-2xl font-bold">{t}</h1><p className="mt-2 text-ink/70">{b}</p></div>; }
