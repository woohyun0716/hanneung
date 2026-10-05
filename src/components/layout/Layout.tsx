import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { storageService } from '../../services/storageService';

export const MAIN_MENU = [['/', '홈'], ['/questions', '문제 풀기'], ['/mock-test', '모의고사'], ['/study', '시대별 학습'], ['/timeline', '연표'], ['/wrong-answers', '오답노트'], ['/statistics', '학습 통계'], ['/settings', '기록 관리']] as const;
const TABS = [['/', '홈'], ['/questions', '문제 풀기'], ['/mock-test', '모의고사'], ['/wrong-answers', '오답노트'], ['/more', '더보기']] as const;
const MORE_PATHS = ['/more', '/study', '/timeline', '/statistics', '/settings'];
const EXTRA_TITLES: Record<string, string> = { '/more': '더보기', '/result': '시험 결과' };
const side = ({ isActive }: { isActive: boolean }) => `flex min-h-11 items-center rounded-lg px-3 text-sm font-medium transition-colors ${isActive ? 'bg-celadon text-white' : 'text-ink/75 hover:bg-celadon-soft'}`;
const tab = (on: boolean) => `flex min-h-14 items-center justify-center text-xs font-medium ${on ? 'text-celadon' : 'text-ink/70'}`;

export default function Layout() {
  const { pathname } = useLocation();
  const [storageOk] = useState(() => storageService.isAvailable());
  const main = useRef<HTMLElement>(null);
  const first = useRef(true);
  useEffect(() => { // 화면 전환 시 제목 갱신, 맨 위로 이동, 본문으로 포커스 이동(스크린 리더 안내)
    const label = EXTRA_TITLES[pathname] ?? MAIN_MENU.find(([p]) => p !== '/' && pathname.startsWith(p))?.[1] ?? '홈';
    document.title = `${label} · 한능검 노트`;
    if (first.current) { first.current = false; return; }
    window.scrollTo(0, 0); main.current?.focus({ preventScroll: true });
  }, [pathname]);
  return (
    <div className="min-h-screen md:flex">
      <a href="#main" onClick={e => { e.preventDefault(); main.current?.focus(); }} className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-50 focus:rounded-lg focus:bg-white focus:p-3 focus:shadow">본문으로 건너뛰기</a>
      <aside className="hidden w-56 shrink-0 border-r border-ink/10 bg-white p-4 md:block">
        <div className="mb-6 px-3 font-serif text-xl font-bold text-celadon">한능검 노트</div>
        <nav aria-label="주 메뉴" className="space-y-1">{MAIN_MENU.map(([to, t]) => <NavLink key={to} to={to} end={to === '/'} className={side}>{t}</NavLink>)}</nav>
      </aside>
      <main id="main" ref={main} tabIndex={-1} className="min-w-0 flex-1 px-4 pb-28 pt-6 outline-none md:px-10 md:pb-10">
        <div className="mx-auto max-w-3xl">
          <div className="mb-4 font-serif text-lg font-bold text-celadon md:hidden">한능검 노트</div>
          {!storageOk && <p role="alert" className="mb-4 rounded-lg bg-seal-soft p-3 text-sm">이 브라우저에서는 기록을 저장할 수 없어요. 지금 접속하는 동안만 기록이 유지되고, 페이지를 닫으면 사라져요.</p>}
          <Outlet />
        </div>
      </main>
      <nav aria-label="하단 메뉴" className="fixed inset-x-0 bottom-0 z-10 grid grid-cols-5 border-t border-ink/10 bg-white pb-[env(safe-area-inset-bottom)] md:hidden">
        {TABS.map(([to, t]) => to === '/more'
          ? <Link key={to} to={to} aria-current={MORE_PATHS.some(p => pathname.startsWith(p)) ? 'page' : undefined} className={tab(MORE_PATHS.some(p => pathname.startsWith(p)))}>{t}</Link>
          : <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => tab(isActive)}>{t}</NavLink>)}
      </nav>
    </div>
  );
}
