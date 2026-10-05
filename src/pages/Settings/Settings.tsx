import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import BackupPanel from '../../components/settings/BackupPanel';
import { examService } from '../../services/examService';
import { questionService } from '../../services/questionService';
import { statisticsService as S } from '../../services/statisticsService';
import { storageService } from '../../services/storageService';
import type { Question } from '../../types';

export default function Settings() {
  const [rec, setRec] = useState(() => storageService.load());
  const [hist, setHist] = useState(() => storageService.loadHistory());
  const [qs, setQs] = useState<Question[]>([]);
  useEffect(() => { questionService.getAll().then(setQs).catch(() => setQs([])); }, []);
  const refresh = () => { setRec(storageService.load()); setHist(storageService.loadHistory()); };
  const stats = [['풀이 기록', `${rec.attempts.length}개`], ['오답노트', `${S.wrongList(rec.attempts, rec.dismissed).length}개`], ['북마크', `${rec.bookmarks.length}개`], ['모의고사', `${hist.length}회`]];
  return (
    <div className="space-y-5"><h1 className="font-serif text-2xl font-bold">기록 관리</h1>
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">{stats.map(([k, v]) => <div key={k} className="rounded-2xl bg-white p-4 shadow-sm"><div className="text-xs text-ink/70">{k}</div><div className="mt-1 text-xl font-bold tabular-nums">{v}</div></div>)}</section>
      <p className="text-xs text-ink/70">저장 용량 약 {storageService.usageKB()}KB</p>
      <section className="rounded-2xl bg-white p-5 shadow-sm"><h2 className="font-bold">북마크한 문제</h2>
        {rec.bookmarks.length === 0 ? <p className="mt-2 text-sm text-ink/70">문제 풀이 중 북마크한 문제가 여기에 모여요.</p> :
          <ul className="mt-2 divide-y divide-ink/10">{rec.bookmarks.map(id => { const q = qs.find(x => x.id === id); return (
            <li key={id} className="flex items-center justify-between gap-2 py-1 text-sm"><span className="line-clamp-1">{q ? q.question : '찾을 수 없는 문제'}</span>
              <span className="flex shrink-0 gap-1">{q && <Link to={`/questions?id=${id}`} className="inline-flex min-h-11 items-center text-celadon underline">풀기</Link>}
                <button onClick={() => { storageService.toggleBookmark(id); refresh(); }} className="min-h-11 px-2 text-ink/70 underline">해제</button></span></li>); })}</ul>}
      </section>
      <section className="rounded-2xl bg-white p-5 shadow-sm"><h2 className="font-bold">모의고사 기록</h2>
        {hist.length === 0 ? <p className="mt-2 text-sm text-ink/70">아직 본 모의고사가 없어요.</p> :
          <ul className="mt-2 divide-y divide-ink/10">{[...hist].reverse().slice(0, 10).map(h => <li key={h.at} className="flex justify-between py-2 text-sm"><span>{new Date(h.at).toLocaleDateString('ko-KR')}</span><span className="tabular-nums">{h.score}점 ({h.correct}/{h.total}) · {examService.grade(h.score)}</span></li>)}</ul>}
      </section>
      <BackupPanel onChange={refresh} />
    </div>
  );
}
