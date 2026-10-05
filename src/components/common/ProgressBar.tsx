export default function ProgressBar({ value, label, tone = 'default' }: { value: number; label: string; tone?: 'default' | 'weak' }) {
  const v = Math.max(0, Math.min(100, value)), weak = tone === 'weak';
  return (
    <div role="progressbar" aria-label={label} aria-valuenow={v} aria-valuemin={0} aria-valuemax={100} className={`h-2.5 w-full overflow-hidden rounded-full ${weak ? 'bg-seal-soft' : 'bg-celadon-soft'}`}>
      <div className={`h-full rounded-full transition-all duration-500 ${weak ? 'bg-seal' : 'bg-celadon'}`} style={{ width: `${v}%` }} />
    </div>
  );
}
