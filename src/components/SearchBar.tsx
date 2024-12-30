import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchWordsByPrefix } from '../utils/db';
import { Word } from '../types';
// @ts-ignore
import { useDb } from '../hooks/useDb';
import { FrequencyBadge } from './FrequencyBadge';

// 防抖函数
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function SearchBar({ db }: { db: any }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<Pick<Word, 'word' | 'frequency'>[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const navigate = useNavigate(); 

  const handleSearch = (term: string = searchTerm) => {
    if (term.trim()) {
      navigate(`/word/${term.trim()}`);
      setShowSuggestions(false);
    }
  };

  // 防抖搜索
  const debouncedSearch = useCallback(
    debounce((term: string) => {
      if (term.trim() && db) {
        const results = searchWordsByPrefix(db, term.trim());
        setSuggestions(results);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300),
    [db]
  );

  useEffect(() => {
    debouncedSearch(searchTerm);
  }, [searchTerm, debouncedSearch]);

  return (
    <div className="relative flex-grow">
      <div className="flex gap-2">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Enter a word..."
          className="flex-1 p-2 border rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={() => handleSearch()}
          className="px-4 py-2 bg-blue-500 text-white rounded-sm hover:bg-blue-600 transition-colors"
        >
          Search
        </button>
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute z-10 w-full bg-white mt-1 border rounded-sm shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((item) => (
            <li
              key={item.word}
              onClick={() => {
                setSearchTerm('');
                handleSearch(item.word);
              }}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center justify-between"
            >
              <span>{item.word}</span>
              <FrequencyBadge frequency={item.frequency} />
            </li>
          ))}
        </ul>
      )}
    </div>

  );
} 