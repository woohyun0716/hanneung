import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import ProgressBar from '../../components/common/ProgressBar';
import { questionService } from '../../services/questionService';
import { storageService } from '../../services/storageService';
import QuestionFilter from '../../components/question/QuestionFilter';
import QuestionImage from '../../components/question/QuestionImage';
import { DIFFICULTY_LABEL } from '../../utils/labels';
import type { Question } from '../../types';

export default function Questions() {
  const [params] = useSearchParams();
  const id = params.get('id');
  const [list, setList] = useState<Question[] | null>(null);
  const [error, setError] = useState(false);
  const [tries, setTries] = useState(0);
  const [all, setAll] = useState<Question[]>([]);
  const [started, setStarted] = useState(false);
  const [i, setI] = useState(0);
  const [sel, setSel] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [ended, setEnded] = useState(false);
  const [score, setScore] = useState(0);
  const [saveFailed, setSaveFailed] = useState(false);
  const [reported, setReported] = useState(false);
  const [marks, setMarks] = useState<number[]>(() => storageService.load().bookmarks);

  useEffect(() => {
    setList(null); setError(false); setI(0); setSel(null); setSubmitted(false); setEnded(false); setScore(0);
    questionService.getAll().then(a => { setAll(a); setList(id ? a.filter(q => q.id === Number(id)) : a.filter(q => !q.imageMissing)); setStarted(!!id); }).catch(() => setError(true));
  }, [id, tries]);

  const feedbackRef = useRef<HTMLElement>(null);
  useEffect(() => { if (submitted) feedbackRef.current?.focus(); }, [submitted]); // 제출 후 해설로 포커스 이동

  if (error) return <Notice title="문제를 불러오지 못했어요" body="잠시 후 다시 시도해 주세요." action={<button onClick={() => setTries(t => t + 1)} className="btn">다시 불러오기</button>} />;
  if (!list) return <p role="status" className="py-20 text-center text-ink/70">문제를 불러오는 중…</p>;
  if (!id && !started) return <QuestionFilter all={all} initial={{ period: params.get('period') ?? '', difficulty: params.get('difficulty') ?? '' }} onStart={s => { setList(s); setI(0); setStarted(true); }} />;
  if (list.length === 0) return <Notice title={id ? '존재하지 않는 문제예요' : '풀 수 있는 문제가 없어요'} body="홈에서 다른 문제를 선택해 주세요." action={<Link to="/" className="btn">홈으로 가기</Link>} />;
  if (ended) return <Notice title="오늘의 풀이를 마쳤어요" body={`${list.length}문제 중 ${score}문제 정답 (${Math.round((score / list.length) * 100)}%)`} action={<div className="flex flex-wrap justify-center gap-2">{!id && <button className="btn" onClick={() => { setStarted(false); setEnded(false); setI(0); setSel(null); setSubmitted(false); setScore(0); }}>다른 조건으로 풀기</button>}<Link to="/wrong-answers" className="btn">오답노트 보기</Link><Link to="/" className="btn">홈으로 가기</Link></div>} />;

  const q = list[i];
  const last = i === list.length - 1;
  const submit = () => {
    if (sel === null) return;
    const correct = sel === q.answer;
    if (correct) setScore(s => s + 1);
    setSaveFailed(!storageService.addAttempt({ questionId: q.id, selected: sel, correct, period: q.period, category: q.category, at: new Date().toISOString() }));
    setSubmitted(true);
  };
  const next = () => { if (last) return setEnded(true); window.scrollTo(0, 0); setI(i + 1); setSel(null); setSubmitted(false); setReported(false); };
  const state = (n: number) => {
    if (!submitted) return n === sel ? 'border-celadon bg-celadon-soft' : 'border-ink/15 bg-white hover:border-celadon';
    if (n === q.answer) return 'border-celadon bg-celadon-soft';
    return n === sel ? 'border-seal bg-seal-soft' : 'border-ink/10 bg-white opacity-70';
  };
  const ok = sel === q.answer;
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3"><span className="shrink-0 whitespace-nowrap text-sm tabular-nums">{i + 1}/{list.length} <span className="text-ink/70">· 정답 {score}</span></span><ProgressBar value={((i + (submitted ? 1 : 0)) / list.length) * 100} label="문제 풀이 진행률" />
        <button className="min-h-11 shrink-0 text-sm text-ink/70 underline" onClick={() => setEnded(true)}>풀이 종료</button></div>
      <article className="rounded-2xl bg-white p-5 shadow-sm">
        <p className="text-xs text-ink/70">{q.period} · {q.category} · {DIFFICULTY_LABEL[q.difficulty]}</p>
        <h1 className="mt-2 font-serif text-lg font-bold leading-relaxed">{q.question}</h1>
        {q.image && <QuestionImage key={q.id} src={q.image} credit={q.imageCredit} />}
        <div role="group" aria-label="선택지" className="mt-4 space-y-2">
          {q.choices.map((c, n) => (
            <button key={n} disabled={submitted} aria-pressed={sel === n} onClick={() => setSel(n)}
              className={`flex min-h-14 w-full items-start gap-3 rounded-xl border-2 p-3 text-left transition-colors ${state(n)}`}>
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-ink/10 text-sm font-bold tabular-nums">{n + 1}</span><span>{c}</span>
              {submitted && n === q.answer && <span className="ml-auto shrink-0 text-sm font-bold text-celadon">✓ 정답</span>}
              {submitted && n === sel && n !== q.answer && <span className="ml-auto shrink-0 text-sm font-bold text-seal">✗ 내 선택</span>}
            </button>))}
        </div>
        <div className="sticky bottom-16 -mx-5 mt-4 flex flex-wrap items-center gap-2 bg-white/95 px-5 py-3 md:static md:bg-transparent md:py-0">
          {!submitted ? <button disabled={sel === null} onClick={submit} className="btn disabled:opacity-40">정답 제출</button>
            : <button onClick={next} className="btn">{last ? '결과 보기' : '다음 문제'}</button>}
          <button aria-pressed={marks.includes(q.id)} onClick={() => setMarks(storageService.toggleBookmark(q.id).bookmarks)} className="min-h-11 rounded-lg border border-ink/15 px-4 text-sm">{marks.includes(q.id) ? '북마크 해제' : '북마크'}</button>
          <button disabled={reported} onClick={() => setReported(true)} className="min-h-11 rounded-lg border border-ink/15 px-4 text-sm disabled:opacity-60">{reported ? '신고 접수됨' : '문제 신고'}</button>
        </div>
      </article>
      {submitted && (
        <section ref={feedbackRef} tabIndex={-1} aria-live="polite" className={`rounded-2xl p-5 outline-none animate-fade-in ${ok ? 'bg-celadon-soft' : 'bg-seal-soft'}`}>
          <h2 className="text-lg font-bold">{ok ? '✓ 정답이에요!' : `✗ 아쉬워요, 정답은 ${q.answer + 1}번이에요.`}</h2>
          {!ok && <p className="mt-1 text-sm">내가 고른 답은 {(sel ?? 0) + 1}번이에요. 오답노트에서 다시 풀 수 있어요.</p>}
          <p className="mt-2 leading-relaxed">{q.explanation}</p>
          {q.choiceExplanations && <ol className="mt-3 space-y-1 text-sm">{q.choiceExplanations.map((e, n) => <li key={n}><b>{n + 1}번</b> {e}</li>)}</ol>}
          <p className="mt-3 flex flex-wrap gap-1.5 text-xs">{q.keywords.map(k => <span key={k} className="rounded-full bg-white/70 px-2 py-0.5">{k}</span>)}</p>
          <p className="mt-2 text-xs text-ink/70">출처: {q.source}</p>
          {saveFailed && <p role="alert" className="mt-2 text-sm text-seal">풀이 기록을 저장하지 못했어요. 브라우저 저장 공간을 확인해 주세요.</p>}
        </section>)}
    </div>
  );
}
function Notice({ title, body, action }: { title: string; body: string; action: ReactNode }) {
  return <div className="mx-auto max-w-md py-20 text-center"><h1 className="font-serif text-2xl font-bold">{title}</h1><p className="mt-3 text-ink/70">{body}</p><div className="mt-6">{action}</div></div>;
}
