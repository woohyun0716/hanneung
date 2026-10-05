// 웹 페이지(단일 HTML)용 최소 라우터: 주소 뒤의 #/경로 를 사용한다. react-router-dom과 같은 이름·사용법을 제공한다.
import React, { createContext, useContext, useEffect, useState } from 'react';
type Loc = { pathname: string; search: string };
const Ctx = createContext<any>(null), OutletCtx = createContext<any>(null), ParamsCtx = createContext<any>({});
const parse = (to: string): Loc => { const [p, q = ''] = to.split('?'); return { pathname: p ? (p.startsWith('/') ? p : '/' + p) : '/', search: q ? '?' + q : '' }; };
const read = (): Loc => { try { return parse(location.hash.replace(/^#/, '')); } catch { return parse('/'); } };

export function BrowserRouter({ children }: any) {
  const [loc, setLoc] = useState<Loc>(read);
  useEffect(() => { const f = () => setLoc(read()); addEventListener('hashchange', f); return () => removeEventListener('hashchange', f); }, []);
  const navigate = (to: string) => { setLoc(parse(to)); try { location.hash = '#' + to; } catch { /* 주소를 바꿀 수 없어도 화면은 이동한다 */ } };
  return <Ctx.Provider value={{ ...loc, navigate }}>{children}</Ctx.Provider>;
}
type R = { path?: string; index?: boolean; element?: any; children: R[] };
const toRoutes = (ch: any): R[] => React.Children.toArray(ch).map((c: any) => ({ path: c.props.path, index: c.props.index, element: c.props.element, children: toRoutes(c.props.children) }));
function match(routes: R[], segs: string[], params: any = {}): any[] | null {
  for (const r of routes) {
    if (r.index) { if (segs.length === 0) return [{ r, params }]; continue; }
    if (r.path === undefined) { const sub = match(r.children, segs, params); if (sub) return [{ r, params }, ...sub]; continue; }
    if (r.path === '*') return [{ r, params }];
    const ps = r.path.split('/').filter(Boolean); if (ps.length > segs.length) continue;
    const p = { ...params }; let ok = true;
    ps.forEach((s, i) => { if (s.startsWith(':')) p[s.slice(1)] = decodeURIComponent(segs[i]); else if (s !== segs[i]) ok = false; });
    if (!ok || segs.length > ps.length) continue;
    return [{ r, params: p }];
  }
  return null;
}
export function Routes({ children }: any) {
  const { pathname } = useContext(Ctx);
  const chain = match(toRoutes(children), pathname.split('/').filter(Boolean)) ?? [];
  const params = chain.reduce((a, c) => ({ ...a, ...c.params }), {});
  const el = chain.reduceRight((inner: any, c: any) => <OutletCtx.Provider value={inner}>{c.r.element}</OutletCtx.Provider>, null);
  return <ParamsCtx.Provider value={params}>{el}</ParamsCtx.Provider>;
}
export const Route = (_: any) => null;
export const Outlet = () => useContext(OutletCtx);
export const useLocation = () => useContext(Ctx);
export const useParams = () => useContext(ParamsCtx);
export const useNavigate = () => useContext(Ctx).navigate;
export const useSearchParams = () => [new URLSearchParams(useContext(Ctx).search)];
export function Link({ to, children, ...rest }: any) {
  const { navigate } = useContext(Ctx);
  return <a href={'#' + to} {...rest} onClick={(e) => { if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return; e.preventDefault(); navigate(to); }}>{children}</a>;
}
export function NavLink({ to, end, className, children, ...rest }: any) {
  const { pathname } = useContext(Ctx);
  const isActive = end ? pathname === to : pathname === to || pathname.startsWith(to + '/');
  return <Link to={to} aria-current={isActive ? 'page' : undefined} className={typeof className === 'function' ? className({ isActive }) : className} {...rest}>{children}</Link>;
}
