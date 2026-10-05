# 한능검 노트

한국사능력검정시험 대비 학습 사이트. 문제 풀이 · 시대별 선택 · 모의고사 · 오답노트 · 시대별 학습 · 연표 · 학습 통계.
React + TypeScript + Vite + Tailwind CSS + React Router. 학습 기록은 브라우저 localStorage에 저장됩니다.

## 실행
```bash
npm install
npm run dev        # 개발 서버
npm run build      # 배포용 빌드 (dist/)
```

## 웹 페이지(단일 HTML)로 만들기
```bash
npm i -D esbuild tailwindcss@4
npm run build:web  # dist/index.html 한 파일에 스타일·스크립트가 모두 들어감
```
이 파일 하나만 올리면 어디서든 열립니다(주소 뒤에 `#/경로` 형태로 이동). `dist/index.html`은 이미 빌드되어 들어 있습니다.

## 문제·자료 수정
- 문제: `src/data/questions/hanneungNote.ts` (요약노트 기반 자체 출제 100문제, 5지선다). `EASY`·`HARD` 번호 목록으로 난이도 조정.
- 시대 요약: `src/data/history/periods.ts`, 연표: `src/data/history/events.ts`
- 문제를 불러오는 코드는 `src/services/questionService.ts` 한 곳이라 API/DB로 바꿀 때 이 파일만 고치면 됩니다.
- 저장 로직은 `src/services/storageService.ts` 한 곳입니다(Firebase 등으로 교체 가능).

## 문화재 사진 문제 (16문제)
사진 파일이 없으면 해당 문제는 출제에서 자동으로 빠지고, 사진을 넣는 만큼 늘어납니다.
`public/images/culture/` 에 파일을 넣고 `npm run check:images` 로 점검하세요. 자세한 방법은 `docs/IMAGE_SOURCING.md`.

## 참고
- 문제는 공부돼지 「벼락치기 한능검 2026 요약노트(개정)」 내용을 바탕으로 만든 자체 출제이며 실제 기출이 아닙니다. 공개 전에 원저작자의 이용 조건을 확인하세요.
- 난이도와 예상 등급은 참고용입니다. 해설과 연도는 교재·공식 자료와 한 번 대조해 주세요.
