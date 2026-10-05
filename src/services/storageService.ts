import type { Attempt, ExamResult, ExamSession, UserRecords } from '../types';
// 저장소 접근은 전부 이 파일에서만 한다. Firebase 등으로 바꿀 때 이 객체의 메서드만 교체하면 된다.
const KEYS = { records: 'hanneung:records:v2', exam: 'hanneung:exam:v2', result: 'hanneung:result:v2', history: 'hanneung:history:v2' };
const MAX_ATTEMPTS = 5000; // 저장 용량 초과 방지: 오래된 풀이 기록부터 정리
const MAX_HISTORY = 30;
const empty = (): UserRecords => ({ attempts: [], bookmarks: [], wrongNotes: [], dismissed: {}, studyLog: [] });
const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const nums = (v: unknown): v is number[] => Array.isArray(v) && v.every(n => typeof n === 'number');
const isAttempt = (a: unknown): a is Attempt => isObj(a) && typeof a.questionId === 'number' && typeof a.correct === 'boolean' && typeof a.selected === 'number' && typeof a.at === 'string' && typeof a.period === 'string' && typeof a.category === 'string';
const isResult = (r: unknown): r is ExamResult => isObj(r) && typeof r.at === 'string' && typeof r.score === 'number' && typeof r.total === 'number' && typeof r.correct === 'number' && Array.isArray(r.items);

// 시크릿 모드 등으로 localStorage를 쓸 수 없으면 메모리에 보관한다(앱은 동작하지만 페이지를 닫으면 사라진다).
const memory = new Map<string, string>();
let persistent: boolean | null = null;
const canPersist = (): boolean => {
  if (persistent === null) { try { localStorage.setItem('hanneung:test', '1'); localStorage.removeItem('hanneung:test'); persistent = true; } catch { persistent = false; } }
  return persistent;
};
const rawGet = (k: string): string | null => { if (!canPersist()) return memory.get(k) ?? null; try { return localStorage.getItem(k); } catch { return null; } };

export const storageService = {
  read<T>(k: string): T | null { try { const v = rawGet(k); return v ? (JSON.parse(v) as T) : null; } catch { return null; } },
  write(k: string, v: unknown): boolean {
    const text = JSON.stringify(v);
    if (!canPersist()) { memory.set(k, text); return true; }
    try { localStorage.setItem(k, text); return true; } catch { return false; }
  },
  remove(k: string) { memory.delete(k); if (canPersist()) { try { localStorage.removeItem(k); } catch { /* ignore */ } } },
  isAvailable: (): boolean => canPersist(),
  usageKB(): number { let n = 0; Object.values(KEYS).forEach(k => { n += (rawGet(k) ?? '').length; }); return Math.round((n / 1024) * 10) / 10; },

  load(): UserRecords { return { ...empty(), ...(storageService.read<UserRecords>(KEYS.records) ?? {}) }; },
  save: (r: UserRecords) => storageService.write(KEYS.records, r),
  addAttempt(a: Attempt): boolean { const r = storageService.load(); r.attempts = [...r.attempts, a].slice(-MAX_ATTEMPTS); return storageService.save(r); },
  toggleBookmark(id: number): { ok: boolean; bookmarks: number[] } {
    const r = storageService.load();
    r.bookmarks = r.bookmarks.includes(id) ? r.bookmarks.filter(b => b !== id) : [...r.bookmarks, id];
    return { ok: storageService.save(r), bookmarks: r.bookmarks };
  },
  addWrongNotes(ids: number[]): boolean { const r = storageService.load(); r.wrongNotes = [...new Set([...r.wrongNotes, ...ids])]; return storageService.save(r); },
  dismissWrong(id: number): boolean { const r = storageService.load(); r.dismissed = { ...r.dismissed, [id]: new Date().toISOString() }; r.wrongNotes = r.wrongNotes.filter(n => n !== id); return storageService.save(r); },

  markStudied(periodId: string): boolean { // 오늘 시대별 학습 화면을 본 기록
    const d = new Date(), key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}:${periodId}`;
    const r = storageService.load(); if (r.studyLog.includes(key)) return true;
    r.studyLog = [...r.studyLog, key].slice(-200); return storageService.save(r);
  },
  loadExam: () => storageService.read<ExamSession>(KEYS.exam),
  saveExam: (e: ExamSession) => storageService.write(KEYS.exam, e),
  clearExam: () => storageService.remove(KEYS.exam),
  loadResult: () => storageService.read<ExamResult>(KEYS.result),
  loadHistory: (): ExamResult[] => storageService.read<ExamResult[]>(KEYS.history) ?? [],
  saveResult(r: ExamResult): boolean { // 최신 결과 + 시험 이력(최근 30회) 함께 보관
    const h = [...storageService.loadHistory(), r].slice(-MAX_HISTORY);
    return storageService.write(KEYS.result, r) && storageService.write(KEYS.history, h);
  },

  exportAll(): string {
    return JSON.stringify({ app: 'hanneung', version: 2, exportedAt: new Date().toISOString(), records: storageService.load(), history: storageService.loadHistory() }, null, 2);
  },
  importAll(text: string): { ok: boolean; message: string } {
    const bad = { ok: false, message: '백업 파일 형식이 올바르지 않아요. 이 앱에서 내보낸 파일인지 확인해 주세요.' };
    let d: unknown;
    try { d = JSON.parse(text); } catch { return bad; }
    if (!isObj(d) || d.app !== 'hanneung' || d.version !== 2 || !isObj(d.records)) return bad;
    const r = d.records, history = Array.isArray(d.history) ? d.history : [];
    if (!Array.isArray(r.attempts) || !r.attempts.every(isAttempt) || !nums(r.bookmarks) || !nums(r.wrongNotes) || !isObj(r.dismissed) || !history.every(isResult)) return bad;
    const records: UserRecords = { attempts: r.attempts.slice(-MAX_ATTEMPTS), bookmarks: r.bookmarks, wrongNotes: r.wrongNotes, dismissed: r.dismissed as Record<number, string>, studyLog: Array.isArray(r.studyLog) ? r.studyLog.filter((x): x is string => typeof x === 'string') : [] };
    if (!storageService.save(records) || !storageService.write(KEYS.history, history.slice(-MAX_HISTORY))) return { ok: false, message: '저장 공간이 부족해 가져오지 못했어요.' };
    storageService.clearExam(); storageService.remove(KEYS.result);
    return { ok: true, message: `풀이 기록 ${records.attempts.length}개와 시험 기록 ${history.length}회를 가져왔어요.` };
  },
  resetAll() { Object.values(KEYS).forEach(k => storageService.remove(k)); },
};
