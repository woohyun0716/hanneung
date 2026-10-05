import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ProgressBar from '../../components/common/ProgressBar';
import { periods } from '../../data/history/periods';
import { questionService } from '../../services/questionService';
import { statisticsService as S } from '../../services/statisticsService';
import { storageService } from '../../services/storageService';
import type { Question } from '../../types';

const GOAL = 10, REVIEW = 5;
const QUICK = [['/mock-test', '모의고사', '실전처럼 50문제'], ['/wrong-answers', '오답노트', '틀린 문제 복습'], ['/study', '시대별 학습', '핵심 개념 정리'], ['/statistics', '학습 통계', '취약 영역 분석']];
export default function Home() {
  const [today, setToday] = useState<Question>();
  useEffect(() => { questionService.getToday().then(setToday); }, []);
  const rec = storageService.load(), { attempts } = rec;
  const acc = S.accuracy(attempts), weak = S.weakest(attempts), done = S.todayCount(attempts), wrong = S.recentWrong(attempts);
  const target = weak ? periods.find(p => p.name === weak.period) : undefined;
  const goals = [
    { label: `문제 ${GOAL}개 풀기`, now: Math.min(done, GOAL), max: GOAL },
    { label: `오답 ${REVIEW}개 복습`, now: Math.min(S.reviewCountToday(attempts), REVIEW), max: REVIEW },
    ...(target ? [{ label: `${target.name} 핵심 개념 학습`, now: S.studiedToday(rec.studyLog, target.id) ? 1 : 0, max: 1 }] : []),
  ];
  const pct = Math.round((goals.reduce((a, g) => a + g.now / g.max, 0) / goals.length) * 100);
  return (
    <div className="space-y-6">
      <header><h1 className="font-serif text-2xl font-bold">{weak ? `오늘은 ${weak.period}부터 복습해 볼까요?` : '첫 문제부터 풀어 볼까요?'}</h1>
        <p className="mt-1 text-ink/70">{weak ? `정답률 ${weak.rate}%로 가장 낮은 시대예요.` : '풀이 기록이 쌓이면 취약한 시대를 알려 드려요.'}</p></header>
      <section className="rounded-2xl bg-white p-5 shadow-sm" aria-labelledby="goal">
        <div className="flex items-baseline justify-between"><h2 id="goal" className="font-bold">오늘의 학습</h2><span className="text-sm font-bold tabular-nums text-celadon">{pct}%</span></div>
        <div className="mt-3"><ProgressBar value={pct} label="오늘의 학습 진행률" /></div>
        <ul className="mt-3 space-y-1.5 text-sm">{goals.map(g => { const ok = g.now >= g.max; return (
          <li key={g.label} className="flex items-center gap-2"><span aria-hidden className={ok ? 'text-celadon' : 'text-ink/70'}>{ok ? '☑' : '☐'}</span><span className={ok ? 'line-through opacity-70' : ''}>{g.label}</span><span className="ml-auto tabular-nums text-ink/70">{g.now}/{g.max}</span></li>); })}</ul>
        <Link to="/questions" className="btn mt-4">학습 시작하기</Link>
      </section>
      <section className="rounded-2xl bg-celadon-soft p-5"><h2 className="font-bold">오늘의 추천</h2>
        {target && weak ? <><p className="mt-1 text-sm">{target.name}의 정답률이 {weak.rate}%예요. 개념을 먼저 읽고 문제를 풀어 보세요.</p>
          <div className="mt-3 flex flex-wrap gap-2"><Link to={`/study/${target.id}`} className="btn">개념 학습</Link>
            <Link to={`/questions?period=${encodeURIComponent(target.name)}`} className="inline-flex min-h-12 items-center rounded-lg border border-celadon bg-white px-5 font-medium text-celadon">{target.name} 문제 풀기</Link></div></> :
          <><p className="mt-1 text-sm">처음이라면 시대별 개념부터 훑어보고, 난이도 쉬움 문제로 시작해 보세요.</p><Link to="/study" className="btn mt-3">시대별 학습 보기</Link></>}
      </section>
      <section className="grid grid-cols-3 gap-3" aria-label="학습 요약">
        {[['정답률', acc === null ? '–' : `${acc}%`], ['연속 학습', `${S.streak(attempts)}일`], ['푼 문제', `${attempts.length}개`]].map(([k, v]) => (
          <div key={k} className="rounded-2xl bg-white p-4 shadow-sm"><div className="text-xs text-ink/70">{k}</div><div className="mt-1 text-xl font-bold tabular-nums">{v}</div></div>))}
      </section>
      {today && <section className="rounded-2xl bg-white p-5 shadow-sm"><h2 className="font-bold">오늘의 한국사 문제</h2>
        <p className="mt-2 text-ink/80">{today.question}</p><Link to={`/questions?id=${today.id}`} className="mt-3 inline-flex min-h-11 items-center font-medium text-celadon underline">이 문제 풀기</Link></section>}
      <section className="rounded-2xl bg-white p-5 shadow-sm"><h2 className="font-bold">최근 오답</h2>
        {wrong.length === 0 ? <p className="mt-2 text-sm text-ink/70">아직 틀린 문제가 없어요. 문제를 풀면 여기에 모아 둘게요.</p> :
          <ul className="mt-2 divide-y divide-ink/10">{wrong.map(w => <li key={w.at + w.questionId} className="flex items-center justify-between py-2 text-sm"><span>{w.period} · {w.category}</span><Link className="inline-flex min-h-11 items-center text-celadon underline" to={`/questions?id=${w.questionId}`}>다시 풀기</Link></li>)}</ul>}
      </section>
      <nav aria-label="빠른 메뉴" className="grid grid-cols-2 gap-3 md:grid-cols-4">{QUICK.map(([to, t, d]) => (
        <Link key={to} to={to} className="min-h-16 rounded-2xl bg-white p-4 shadow-sm transition-colors hover:bg-celadon-soft"><span className="block font-bold">{t}</span><span className="block text-xs text-ink/70">{d}</span></Link>))}</nav>
      <p className="text-center"><Link to="/settings" className="inline-flex min-h-11 items-center text-sm text-ink/70 underline">기록 관리·백업</Link></p>
    </div>
  );
}
