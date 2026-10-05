import ProgressBar from '../common/ProgressBar';
export default function RateBars({ title, rows }: { title: string; rows: { label: string; rate: number; total: number }[] }) {
  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm"><h2 className="font-bold">{title}</h2>
      <p className="mt-1 text-xs text-ink/70">정답률 60% 미만은 취약 영역으로 표시돼요.</p>
      <ul className="mt-3 space-y-3">{rows.map(r => { const weak = r.rate < 60; return (
        <li key={r.label}><div className="mb-1 flex justify-between text-sm"><span>{r.label}{weak && <span className="ml-2 rounded bg-seal-soft px-1.5 py-0.5 text-xs text-seal">취약</span>}</span><span className="tabular-nums">{r.rate}% ({r.total}문제)</span></div>
          <ProgressBar value={r.rate} tone={weak ? 'weak' : 'default'} label={`${r.label} 정답률`} /></li>); })}</ul>
    </section>
  );
}
