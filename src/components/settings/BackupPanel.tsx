import { useState } from 'react';
import type { ChangeEvent } from 'react';
import { storageService } from '../../services/storageService';

type Pending = 'import' | 'reset' | null;
const outline = 'inline-flex min-h-12 items-center rounded-lg border border-ink/15 px-5';
export default function BackupPanel({ onChange }: { onChange: () => void }) {
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [exported, setExported] = useState('');
  const [pasted, setPasted] = useState('');
  const [pending, setPending] = useState<Pending>(null);

  const showExport = () => { setExported(storageService.exportAll()); setMsg({ ok: true, text: '아래 백업 내용을 복사해서 메모장 등에 보관하세요.' }); };
  const copy = async () => {
    try { await navigator.clipboard.writeText(exported); setMsg({ ok: true, text: '백업 내용을 복사했어요.' }); }
    catch { document.getElementById('backup-export')?.focus(); (document.getElementById('backup-export') as HTMLTextAreaElement | null)?.select(); setMsg({ ok: false, text: '자동 복사가 막혀 있어요. 선택된 내용을 직접 복사해 주세요.' }); }
  };
  const readFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; e.target.value = '';
    if (!f) return;
    if (f.size > 5_000_000) return setMsg({ ok: false, text: '파일이 너무 커요(5MB 이하만 가능).' });
    setPasted(await f.text()); setPending('import'); setMsg(null);
  };
  const doImport = () => {
    const r = storageService.importAll(pasted); setMsg({ ok: r.ok, text: r.message }); setPending(null);
    if (r.ok) { setPasted(''); onChange(); }
  };
  const doReset = () => { storageService.resetAll(); setPending(null); setMsg({ ok: true, text: '모든 기록을 초기화했어요.' }); onChange(); };

  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm"><h2 className="font-bold">백업과 초기화</h2>
      <p className="mt-1 text-sm text-ink/70">기록은 이 브라우저에만 저장돼요. 기기를 바꾸기 전에 백업해 두세요.</p>

      <div className="mt-4 space-y-2"><h3 className="text-sm font-bold">백업하기</h3>
        <button onClick={showExport} className="btn">백업 내용 만들기</button>
        {exported && <><label htmlFor="backup-export" className="sr-only">백업 내용</label>
          <textarea id="backup-export" readOnly value={exported} rows={6} onFocus={e => e.currentTarget.select()} className="w-full rounded-lg border border-ink/15 bg-mist p-2 font-mono text-xs" />
          <button onClick={copy} className={outline}>복사하기</button></>}</div>

      <div className="mt-5 space-y-2"><h3 className="text-sm font-bold">백업 가져오기</h3>
        <label htmlFor="backup-import" className="text-xs text-ink/70">백업 내용을 붙여넣거나 파일을 선택하세요.</label>
        <textarea id="backup-import" value={pasted} onChange={e => { setPasted(e.target.value); setPending(null); }} rows={4} placeholder='{"app":"hanneung", ...}' className="w-full rounded-lg border border-ink/15 bg-mist p-2 font-mono text-xs" />
        <div className="flex flex-wrap gap-2">
          <label className={`${outline} cursor-pointer focus-within:outline focus-within:outline-2`}>파일 선택<input type="file" accept="application/json,.json" onChange={readFile} className="sr-only" /></label>
          <button disabled={!pasted.trim()} onClick={() => setPending('import')} className={`${outline} disabled:opacity-40`}>가져오기</button></div>
        {pending === 'import' && <div role="alertdialog" aria-label="가져오기 확인" className="rounded-lg bg-seal-soft p-3 text-sm">현재 기록이 백업 내용으로 바뀌어요. 계속할까요?
          <div className="mt-2 flex gap-2"><button autoFocus onClick={doImport} className="btn">바꾸기</button><button onClick={() => setPending(null)} className={outline}>취소</button></div></div>}</div>

      <div className="mt-5 space-y-2"><h3 className="text-sm font-bold">초기화</h3>
        {pending !== 'reset' ? <button onClick={() => setPending('reset')} className="min-h-12 rounded-lg border border-seal px-5 text-seal">기록 초기화</button> :
          <div role="alertdialog" aria-label="초기화 확인" className="rounded-lg bg-seal-soft p-3 text-sm">풀이 기록, 오답노트, 북마크, 시험 기록이 모두 삭제돼요. 되돌릴 수 없어요.
            <div className="mt-2 flex gap-2"><button autoFocus onClick={doReset} className="min-h-12 rounded-lg bg-seal px-5 font-medium text-white">모두 삭제</button><button onClick={() => setPending(null)} className={outline}>취소</button></div></div>}</div>

      {msg && <p role={msg.ok ? 'status' : 'alert'} className={`mt-4 text-sm ${msg.ok ? 'text-celadon' : 'text-seal'}`}>{msg.text}</p>}
    </section>
  );
}
