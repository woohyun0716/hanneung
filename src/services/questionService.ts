import type { Question } from '../types';
import { noteQuestions } from '../data/questions/hanneungNote';
// API/DB 연결 시 이 파일의 구현만 교체하면 UI는 그대로 사용 가능

// 사진 문제는 사진 없이는 풀 수 없으므로, 파일을 불러오지 못하면 imageMissing으로 표시해 일반 출제에서 뺀다.
const probeCache = new Map<string, Promise<boolean>>();
const imageExists = (src: string): Promise<boolean> => {
  if (typeof Image === 'undefined') return Promise.resolve(true);
  if (!probeCache.has(src)) probeCache.set(src, new Promise(res => {
    const img = new Image(); const t = setTimeout(() => res(false), 5000);
    img.onload = () => { clearTimeout(t); res(img.naturalWidth > 0); }; img.onerror = () => { clearTimeout(t); res(false); }; img.src = src;
  }));
  return probeCache.get(src)!;
};
export const isUsable = (q: Question) => !q.imageMissing;
export const questionService = {
  async getAll(): Promise<Question[]> {
    return Promise.all(noteQuestions.map(async q => (q.image && !(await imageExists(q.image)) ? { ...q, imageMissing: true } : q)));
  },
  async getById(id: number): Promise<Question | undefined> { return (await questionService.getAll()).find(q => q.id === id); },
  async getToday(): Promise<Question | undefined> {
    const usable = (await questionService.getAll()).filter(isUsable);
    const d = new Date(); const n = d.getFullYear() * 400 + d.getMonth() * 31 + d.getDate();
    return usable[n % usable.length];
  },
};
