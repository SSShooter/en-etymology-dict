import { useEffect, useState } from 'react';
import { initDatabase } from '../utils/db';

export function useDb() {
  const [db, setDb] = useState<any>(null);

  useEffect(() => {
    initDatabase().then(setDb);
  }, []);

  return db;
} 