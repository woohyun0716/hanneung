import { useState } from 'react';
import type { ReactNode } from 'react';
import { periods } from '../../data/history/periods';
import { statisticsService as S } from '../../services/statisticsService';
import { isUsable } from '../../services/questionService';
import { storageService } from '../../services/storageService';
import { DIFFICULTY_LABEL } from '../../utils/labels';
import type { Question } from '../../types';

const chip = (on: boolean) => `min-h-11 rounded-full border px-4 text-sm transition-colors ${on ? 'border-celadon bg-celadon text-white' : 'border-ink/15 bg-white hover:border-celadon'}`;
const card = (on: boolean) => `min-h-16 rounded-xl border-2 p-3 text-left transition-colors disabled:opacity-40 ${on ? 'border-celadon bg-celadon-soft' : 'border-ink/15 bg-white hover:border-celadon'}`;
// 컴포넌트 밖에 정의해야 클릭할 때마다 다시 만들어져 키보드 포커스가 사라지는 일이 없다
function Group({ label, hint, cls, children }: { label: string; hint?: string; cls: string; children: ReactNode }) {
  return <section><h2 className="font-bold">{label}</h2>{hint && <p className="text-xs text-ink/70">{hint}</p>}<div role="group" aria-label={label} className={`mt-2 ${cls}`}>{children}</div></section>;
}
interface Props { all: Question[]; initial: { period: string; difficulty: string }; onStart: (list: Question[]) => void }
export default function QuestionFilter({ all: every, initial, onStart }: Props) {
  const all = every.filter(isUsable), photoTotal = every.filter(q => q.image).length, photoReady = all.filter(q => q.image).length;
  const [sel, setSel] = useState<string[]>(initial.period ? [initial.period] : []); // 비어 있으면 전체 시대
  const [diff, setDiff] = useState(initial.difficulty);
  const [photo, setPhoto] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [rates] = useState(() => S.byPeriod(storageService.load().attempts));
  const base = all.filter(q => (!diff || q.difficulty === diff) && (!photo || q.image));
  const subset = base.filter(q => sel.length === 0 || sel.includes(q.period));
  const toggle = (n: string) => setSel(s => (s.includes(n) ? s.filter(x => x !== n) : [...s, n]));
  const start = () => onStart(shuffle ? [...subset].sort(() => Math.random() - 0.5) : subset);
  return (
    <div className="space-y-5"><h1 className="font-serif text-2xl font-bold">어떤 문제를 풀까요?</h1>
      <Group label="시대" hint="여러 시대를 함께 고를 수 있어요. 고르지 않으면 전체 시대에서 출제돼요." cls="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <button aria-pressed={sel.length === 0} className={card(sel.length === 0)} onClick={() => setSel([])}>
          <span className="block font-bold">{sel.length === 0 && '✓ '}전체 시대</span><span className="block text-xs text-ink/70">{base.length}문제</span></button>
        {periods.map(p => {
          const n = base.filter(q => q.period === p.name).length, r = rates.find(x => x.period === p.name), on = sel.includes(p.name);
          return <button key={p.id} aria-pressed={on} disabled={n === 0 && !on} className={card(on)} onClick={() => toggle(p.name)}>
            <span className="block font-bold">{on && '✓ '}{p.name}</span><span className="block text-xs text-ink/70">{n}문제 · {r ? `정답률 ${r.rate}%` : '미풀이'}</span></button>;
        })}
      </Group>
      <Group label="난이도" cls="flex flex-wrap gap-2">
        {[['', '전체'], ...Object.entries(DIFFICULTY_LABEL)].map(([k, t]) => <button key={k} aria-pressed={diff === k} className={chip(diff === k)} onClick={() => setDiff(k)}>{t}</button>)}
      </Group>
      <Group label="문제 종류" hint={photoReady < photoTotal ? `사진 문제 ${photoReady}/${photoTotal}개 준비됨. public/images/culture/ 에 사진을 넣으면 늘어나요.` : undefined} cls="flex flex-wrap gap-2">
        <button aria-pressed={!photo} className={chip(!photo)} onClick={() => setPhoto(false)}>전체</button>
        <button aria-pressed={photo} className={chip(photo)} disabled={photoReady === 0} onClick={() => setPhoto(true)}>문화재 사진 문제 ({photoReady})</button>
      </Group>
      <Group label="문제 순서" cls="flex flex-wrap gap-2">
        <button aria-pressed={!shuffle} className={chip(!shuffle)} onClick={() => setShuffle(false)}>시대 순서대로</button>
        <button aria-pressed={shuffle} className={chip(shuffle)} onClick={() => setShuffle(true)}>무작위</button>
      </Group>
      <div className="sticky bottom-20 rounded-2xl bg-white p-4 shadow-sm md:bottom-4">
        <p role="status" className="text-sm">{subset.length > 0 ? `조건에 맞는 문제 ${subset.length}개${sel.length ? ` · ${sel.join(', ')}` : ''}` : '조건에 맞는 문제가 없어요. 조건을 바꿔 보세요.'}</p>
        <button disabled={subset.length === 0} onClick={start} className="btn mt-2 disabled:opacity-40">풀이 시작</button></div>
    </div>
  );
}
