import { useState } from 'react';
// 사진이 없거나 불러오기에 실패하면 필요한 파일 위치를 안내한다. alt에는 정답을 드러내지 않는다.
export default function QuestionImage({ src, credit }: { src: string; credit?: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <div role="img" aria-label="문제 사진을 불러오지 못했어요" className="mt-3 grid h-40 place-items-center rounded-lg border-2 border-dashed border-ink/20 bg-mist p-3 text-center text-xs text-ink/70">사진 파일이 없어서 이 문제는 풀 수 없어요.<br />public{src} 위치에 이미지를 넣어 주세요.</div>;
  return <figure><img src={src} alt="문제 사진" loading="lazy" onError={() => setFailed(true)} className="mt-3 max-h-72 w-full rounded-lg bg-mist object-contain" />{credit && <figcaption className="mt-1 text-[11px] text-ink/70">{credit}</figcaption>}</figure>;
}
