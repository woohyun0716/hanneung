import { Route, Routes } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home/Home';
import Questions from './pages/Questions/Questions';
import MockTest from './pages/MockTest/MockTest';
import Result from './pages/Result/Result';
import WrongAnswers from './pages/WrongAnswers/WrongAnswers';
import Study from './pages/Study/Study';
import StudyDetail from './pages/Study/StudyDetail';
import Timeline from './pages/Timeline/Timeline';
import Statistics from './pages/Statistics/Statistics';
import Settings from './pages/Settings/Settings';
import More from './pages/More/More';
import Placeholder from './components/common/Placeholder';


export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="questions" element={<Questions />} />
        <Route path="mock-test" element={<MockTest />} />
        <Route path="result" element={<Result />} />
        <Route path="wrong-answers" element={<WrongAnswers />} />
        <Route path="study" element={<Study />} />
        <Route path="study/:periodId" element={<StudyDetail />} />
        <Route path="timeline" element={<Timeline />} />
        <Route path="statistics" element={<Statistics />} />
        <Route path="more" element={<More />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<Placeholder title="페이지를 찾을 수 없어요" notFound />} />
      </Route>
    </Routes>
  );
}
