import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Word } from '../types';
import { searchWordsByRoot } from '../utils/db';
import { FrequencyBadge } from './FrequencyBadge';

export function RootDetail({ db }: { db: any }) {
  const { root: rootParam } = useParams();
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const loadDB = async () => {
      try {
        setLoading(false);
        if (rootParam) {
          const result = searchWordsByRoot(db, rootParam);
          if (result) {
            setWords(result);
          } else {
            setWords([]);
          }
        }
      } catch (err) {
        setError('Failed to load db');
        setLoading(false);
      }
    };

    loadDB();
  }, [rootParam]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center">
            <div className="text-red-500">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-sm shadow-lg p-6 space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Words with Root: <span className="text-blue-600">{rootParam}</span>
            </h2>
          </div>

          {words.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {words.map((word, index) => (
                <div
                  key={index}
                  className="border rounded-sm p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate(`/word/${word.word}`)}
                >
                  <div className='flex items-center justify-between'>
                    <h3 className="font-semibold text-lg text-gray-800 mb-2 mr-2 inline-block">{word.word}</h3>
                    <FrequencyBadge frequency={word.frequency} />
                  </div>
                  <p className="text-gray-600 text-sm mt-2 line-clamp-2">{word.etymology}</p>

                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-600">
              No words found with this root.
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 