import { Routes, Route, useLocation } from 'react-router-dom';
import { WordDetail } from './components/WordDetail';
import { RootDetail } from './components/RootDetail';
import { SearchBar } from './components/SearchBar';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useEffect } from 'react';

import { initDatabase } from './utils/db';
const db = await initDatabase();

const Home = () => (<div className='h-96 flex flex-col justify-center items-center'>
  <h1 className='text-lg font-bold'> AI 词源-同义词-反义词 英语词典</h1>
  <div>
    本地词典内置四六级、托福词汇表，可在线查询英英词典
  </div>
</div>)

function App() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 bg-white shadow-md z-50 px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-full"
              aria-label="Go back"
            >
              <ArrowLeft size={24} />
            </button>
            <SearchBar db={db} />
            <button
              onClick={() => navigate(1)}
              className="p-2 hover:bg-gray-100 rounded-full"
              aria-label="Go forward"
            >
              <ArrowRight size={24} />
            </button>
          </div>
        </div>
      </div>
      <main className="max-w-4xl mx-auto">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/word/:word" element={<WordDetail db={db} />} />
          <Route path="/root/:root" element={<RootDetail db={db} />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
