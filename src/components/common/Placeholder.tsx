import { Link } from 'react-router-dom';
export default function Placeholder({ title, notFound }: { title: string; notFound?: boolean }) {
  return (
    <div className="mx-auto max-w-md py-20 text-center">
      <h1 className="font-serif text-2xl font-bold">{title}</h1>
      <p className="mt-3 text-ink/70">{notFound ? '주소를 확인하거나 홈에서 다시 시작해 주세요.' : '다음 단계에서 구현할 화면이에요.'}</p>
      <Link to="/" className="btn mt-6">홈으로 가기</Link>
    </div>
  );
}
