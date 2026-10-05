import { periods } from '../data/history/periods';
import type { Period } from '../types';
export const studyService = {
  async getPeriods(): Promise<Period[]> { return periods; },
  async getPeriod(id: string): Promise<Period | undefined> { return periods.find(p => p.id === id); },
};
