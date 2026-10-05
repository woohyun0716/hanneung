export default function WeekChart({ data, title = '최근 7일 학습량', max }: { data: { label: string; count: number }[]; title?: string; max?: number }) {
  const top = max ?? Math.max(1, ...data.map(d => d.count));
  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm"><h2 className="font-bold">{title}</h2>
      <div role="img" aria-label={`${title}: ${data.map(d => `${d.label} ${d.count}`).join(', ')}`} className="mt-4 flex h-36 items-end gap-2">
        {data.map((d, i) => <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
          <span className="text-xs tabular-nums">{d.count}</span>
          <div className="w-full rounded-t bg-celadon" style={{ height: `${(d.count / top) * 100}%`, minHeight: d.count ? 4 : 2, opacity: d.count ? 1 : 0.25 }} />
          <span className="text-[11px] text-ink/70">{d.label}</span></div>)}</div></section>
  );
}
