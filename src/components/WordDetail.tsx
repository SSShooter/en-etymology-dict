import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Word, Collocation, OtherLanguage, Root } from '../types';
import { searchWordInDb } from '../utils/db';
import { FrequencyBadge } from './FrequencyBadge';
import { iso639Map } from '../utils/data';
import { ChevronsDownUp, ChevronsUpDown, Volume2 } from 'lucide-react';

interface DictionaryMeaning {
  partOfSpeech: string;
  definitions: {
    definition: string;
    example?: string;
  }[];
}

interface DictionaryPhonetic {
  text: string;
  audio?: string;
}

interface DictionaryResponse {
  meanings: DictionaryMeaning[];
  phonetics: DictionaryPhonetic[];
}

export function WordDetail({ db }: { db: any }) {
  const { word: wordParam } = useParams();
  const [word, setWord] = useState<Word | null>(null);
  const [collocations, setCollocations] = useState<Collocation[]>([]);
  const [otherLanguages, setOtherLanguages] = useState<OtherLanguage[]>([]);
  const [roots, setRoots] = useState<Root[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dictionaryData, setDictionaryData] = useState<DictionaryResponse | null>(null);
  const [loadingDictionary, setLoadingDictionary] = useState(false);
  const [showOtherLanguages, setShowOtherLanguages] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Reset dictionary data when word changes
    setDictionaryData(null);

    const loadData = async () => {
      try {
        setLoading(true);
        // Load db

        if (wordParam) {
          // Load data from local db
          const result = searchWordInDb(db, wordParam);
          if (result) {
            setWord(result.word);
            setCollocations(result.collocations);
            setOtherLanguages(result.otherLanguages);
            setRoots(result.roots);
          } else {
            setWord(null);
            setCollocations([]);
            setOtherLanguages([]);
            setRoots([]);
          }
        }
      } catch (err) {
        setError('Failed to load db');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [wordParam]);

  const loadDictionaryData = async () => {
    if (!wordParam || loadingDictionary) return;

    try {
      setLoadingDictionary(true);
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${wordParam}`);
      if (response.ok) {
        const data = await response.json();
        setDictionaryData(data[0]);
      }
    } catch (dictError) {
      console.error('Failed to fetch dictionary data:', dictError);
    } finally {
      setLoadingDictionary(false);
    }
  };

  const renderWordLinks = (wordString: string) => {
    if (!wordString) return null;
    const arr = wordString.split(',')
    return arr.filter((item, index) => arr.indexOf(item) === index).map((word, index) => {
      const trimmedWord = word.trim();
      return (
        <span key={index}>
          {index > 0 && ', '}
          <button
            onClick={() => navigate(`/word/${trimmedWord}`)}
            className="text-blue-500 hover:text-blue-700 hover:underline focus:outline-none"
          >
            {trimmedWord}
          </button>
        </span>
      );
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 py-8 px-4">
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
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        {wordParam && (
          <div className="bg-white rounded-sm shadow-lg p-6 space-y-6">
            {/* Word Title and Online Dictionary Button */}
            <div className={word ? "border-b pb-6" : ""}>
              <div className="mb-4">
                <h2 className="text-2xl font-bold text-gray-800 mb-2 inline-block mr-2">{wordParam}</h2>
                {word && <FrequencyBadge frequency={word.frequency} />}
                <div className="flex items-center gap-4">
                  {!word && !dictionaryData && (
                    <p className="text-gray-500 mt-2">No local dictionary data found for this word.</p>
                  )}
                </div>
              </div>

              {/* Local Dictionary Content */}
              {word && (
                <>
                  {roots.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">Word Roots</h3>
                      <div className="flex flex-wrap gap-2">
                        {roots.sort(
                          item => {
                            if (item.root.startsWith('-')) {
                              return 1;
                            } else if (item.root.endsWith('-')) {
                              return -1;
                            } else {
                              return 0;
                            }
                          }
                        ).map((root, index) => (
                          <button
                            key={index}
                            onClick={() => navigate(`/root/${root.root}`)}
                            className="inline-block px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors cursor-pointer"
                          >
                            {root.root}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {word.etymology && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">Etymology</h3>
                      <p className="text-gray-600">{word.etymology}</p>
                    </div>
                  )}

                  {word.context && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">Context</h3>
                      <p className="text-gray-600">{word.context}</p>
                    </div>
                  )}


                  {(word.related_words || word.similar_words || word.antonyms || word.synonyms || word.derivatives) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                      {word.antonyms && (
                        <div>
                          <h3 className="text-lg font-semibold text-gray-700 mb-2">反义词</h3>
                          <p className="text-gray-600">{renderWordLinks(word.antonyms)}</p>
                        </div>
                      )}
                      {word.synonyms && (
                        <div>
                          <h3 className="text-lg font-semibold text-gray-700 mb-2">同义词</h3>
                          <p className="text-gray-600">{renderWordLinks(word.synonyms + ',' + word.related_words)}</p>
                        </div>
                      )}
                      {word.similar_words && (
                        <div>
                          <h3 className="text-lg font-semibold text-gray-700 mb-2">形似词</h3>
                          <p className="text-gray-600">{renderWordLinks(word.similar_words)}</p>
                        </div>
                      )}
                      {word.derivatives && (
                        <div>
                          <h3 className="text-lg font-semibold text-gray-700 mb-2">派生词</h3>
                          <p className="text-gray-600">{renderWordLinks(word.derivatives)}</p>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
              {collocations.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Collocations</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {collocations.map((col, index) => (
                      <div key={index} className="border rounded p-3">
                        <div className="font-medium text-gray-700">{col.item}</div>
                        <div className="text-sm text-gray-600">{col.translate}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {otherLanguages.length > 0 && (
                <div className="mb-6">
                  <h3 className="flex items-center gap-3 text-lg font-semibold text-gray-700 mb-2 cursor-pointer" onClick={() => setShowOtherLanguages(!showOtherLanguages)}>
                    Other Languages
                    {showOtherLanguages ? <ChevronsDownUp /> : <ChevronsUpDown />}
                  </h3>
                  {showOtherLanguages && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {otherLanguages.filter(lang => iso639Map[lang.lang as keyof typeof iso639Map]).map((lang, index) => (
                        <div key={index} className="border rounded p-3">
                          <div className="font-medium text-gray-700">{iso639Map[lang.lang as keyof typeof iso639Map]}</div>
                          <div className="text-sm text-gray-500">{lang.words}</div>
                          <div className="text-sm text-gray-600">{lang.meaning}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={() => {
                window.open('https://www.merriam-webster.com/dictionary/' + wordParam, "", "popup,width=680,height=680")
              }}
              className="inline-flex mr-3 items-center px-4 py-2 text-sm font-medium rounded-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              在 Merriam-Webster 查询
            </button>
            {/* Online Dictionary Content */}
            {!dictionaryData && (
              <button
                onClick={loadDictionaryData}
                disabled={loadingDictionary}
                className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingDictionary ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading...
                  </>
                ) : (
                  '加载在线词典'
                )}
              </button>
            )}
            {dictionaryData && (
              <div className="pt-4">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-800">Online Dictionary</h3>
                  <div className="flex items-center gap-2">
                    {dictionaryData.phonetics.map((phonetic, index) => (
                      <div key={index} className="flex items-center gap-2">
                        {phonetic.text && (
                          <span className="text-gray-600">{phonetic.text}</span>
                        )}
                        {phonetic.audio && (
                          <button
                            onClick={() => new Audio(phonetic.audio).play()}
                            className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200"
                          >
                            <Volume2 />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  {dictionaryData.meanings.map((meaning, index) => (
                    <div key={index} className="border-l-4 border-blue-500 pl-4">
                      <h4 className="text-lg font-semibold text-gray-700 mb-2">
                        {meaning.partOfSpeech}
                      </h4>
                      <ul className="space-y-3">
                        {meaning.definitions.map((def, defIndex) => (
                          <li key={defIndex} className="text-gray-600">
                            <p className="mb-1">{def.definition}</p>
                            {def.example && (
                              <p className="text-gray-500 italic pl-4 border-l-2 border-gray-300">
                                "{def.example}"
                              </p>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 