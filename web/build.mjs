// 사용법: node web/build.mjs  →  dist/index.html (스타일·스크립트가 모두 들어 있는 단일 파일, 웹 페이지로 바로 게시 가능)
// 필요: esbuild, tailwindcss@4 (npm i -D esbuild tailwindcss@4). 설치 위치가 다르면 EXTRA_NODE_MODULES=경로1:경로2 로 지정.
import { createRequire } from 'node:module';
import { readFile, writeFile, readdir, mkdir } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const extra = (process.env.EXTRA_NODE_MODULES ?? '').split(':').filter(Boolean);
const paths = [join(root, 'node_modules'), ...extra];
const req = createRequire(join(root, 'package.json'));
const find = (name) => req.resolve(name + '/package.json', { paths });
const twRoot = dirname(find('tailwindcss'));
const esbuild = await import(pathToFileURL(join(dirname(find('esbuild')), 'lib/main.js')).href);
const { compile } = await import(pathToFileURL(join(twRoot, 'dist/lib.mjs')).href);

// 1) CSS: 소스 파일에서 클래스 후보를 모아 Tailwind로 필요한 CSS만 생성
const walk = async (d) => (await Promise.all((await readdir(d, { withFileTypes: true })).map(e => e.isDirectory() ? walk(join(d, e.name)) : [join(d, e.name)]))).flat();
const files = (await walk(join(root, 'src'))).filter(f => /\.(tsx?|html)$/.test(f));
const candidates = new Set();
for (const f of files) for (const m of (await readFile(f, 'utf8')).matchAll(/[A-Za-z0-9_\-:\/.\[\]()%!#@]+/g)) candidates.add(m[0]);
const input = await readFile(join(root, 'web/styles.css'), 'utf8');
const compiler = await compile(input, {
  base: join(root, 'web'),
  loadStylesheet: async (id, base) => {
    const p = id === 'tailwindcss' ? join(twRoot, 'index.css') : id.startsWith('tailwindcss/') ? join(twRoot, id.slice(12) + (id.endsWith('.css') ? '' : '.css')) : resolve(base, id);
    return { path: p, base: dirname(p), content: await readFile(p, 'utf8') };
  },
});
const tw = (await esbuild.transform(compiler.build([...candidates]), { loader: 'css', minify: true })).code;
const tokens = await readFile(join(root, 'web/tokens.css'), 'utf8');

// 2) JS: 앱 전체를 하나로 묶고, react-router-dom은 해시 라우터로 바꿔 끼운다
const out = await esbuild.build({
  entryPoints: [join(root, 'src/main.tsx')], bundle: true, minify: true, write: false, format: 'iife', target: 'es2020', charset: 'utf8',
  jsx: 'automatic', loader: { '.css': 'empty' }, alias: { 'react-router-dom': join(root, 'web/router.tsx') },
  define: { 'process.env.NODE_ENV': '"production"' }, nodePaths: [...extra, join(root, 'node_modules')], logLevel: 'warning',
});
const js = out.outputFiles[0].text.replace(/<\/script/gi, '<\\/script');

// 3) 단일 HTML (게시 시 <html>·<head>·<body>는 자동으로 감싸지므로 본문만 작성)
const html = `<title>한능검 노트</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&family=Noto+Serif+KR:wght@600;700&display=swap">
<style>
${tokens}
${tw}
</style>
<div id="root"></div>
<script>
${js}
</script>
`;
await mkdir(join(root, 'dist'), { recursive: true });
await writeFile(join(root, 'dist/index.html'), html);
console.log(`dist/index.html  ${(html.length / 1024).toFixed(0)}KB (CSS ${(tw.length / 1024).toFixed(0)}KB, JS ${(js.length / 1024).toFixed(0)}KB, 후보 ${candidates.size}개)`);
