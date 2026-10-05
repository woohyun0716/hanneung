import { Link } from 'react-router-dom';
const items = [['/study', '시대별 학습', '시대별 핵심 개념과 관련 문제'], ['/timeline', '연표', '시간순 주요 사건'], ['/statistics', '학습 통계', '정답률과 학습량 분석'], ['/settings', '기록 관리', '북마크, 시험 기록, 백업']];
export default function More() {
  return (
    <div className="space-y-4"><h1 className="font-serif text-2xl font-bold">더보기</h1>
      <ul className="space-y-3">{items.map(([to, t, d]) => <li key={to}><Link to={to} className="block min-h-14 rounded-2xl bg-white p-4 shadow-sm hover:bg-celadon-soft"><span className="font-bold">{t}</span><span className="block text-sm text-ink/70">{d}</span></Link></li>)}</ul>
    </div>
  );
}
