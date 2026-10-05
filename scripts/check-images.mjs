import { existsSync, readFileSync } from 'node:fs';
const src = readFileSync('src/data/questions/hanneungNote.ts', 'utf8');
const credits = readFileSync('src/data/questions/imageCredits.ts', 'utf8');
const paths = [...new Set(src.match(/\/images\/culture\/[\w-]+\.jpg/g) ?? [])];
let ready = 0;
for (const p of paths) {
  const ok = existsSync('public' + p), cr = credits.includes(`'${p}'`);
  if (ok) ready++;
  console.log(`${ok ? '파일 O' : '파일 X'} | ${cr ? '출처 O' : '출처 X'} | ${p}`);
}
console.log(`\n사진 ${ready}/${paths.length}개 준비됨`);
