import { Word, Collocation, OtherLanguage, Root } from '../types';

export const initDatabase = async () => {
  try {
    // @ts-ignore
    const SQL = await initSqlJs({
      locateFile: (filename: string) => `/${filename}`
    });

    const response = await fetch('/english_etymology.db');
    const buf = await response.arrayBuffer();
    return new SQL.Database(new Uint8Array(buf));
  } catch (err) {
    console.error('Failed to initialize database:', err);
    throw new Error('Failed to load database');
  }
};

export const searchWordsByRoot = (db: any, root: string) => {
  if (!db || !root) {
    return null;
  }

  try {
    const stmt = db.prepare(`
      SELECT w.* 
      FROM words w
      JOIN word_roots wr ON w.id = wr.word_id
      JOIN root_dictionary rd ON rd.id = wr.root_id
      WHERE rd.root = ? COLLATE NOCASE
    `);
    
    const words: Word[] = [];
    stmt.bind([root]);
    while (stmt.step()) {
      words.push(stmt.getAsObject() as Word);
    }

    return words;
  } catch (err) {
    console.error('Error searching words by root:', err);
    throw new Error('Error searching words by root');
  }
};

export const searchWordInDb = (db: any, term: string) => {
  if (!db || !term) {
    return null;
  }

  try {
    const wordStmt = db.prepare(
      `SELECT * FROM words WHERE word = ? COLLATE NOCASE`
    );
    const word = wordStmt.getAsObject([term]) as Word;

    if (!word.id) {
      return null;
    }

    // Get collocations
    const colStmt = db.prepare(
      `SELECT item, translate FROM collocations WHERE word_id = ?`
    );
    const collocations: Collocation[] = [];
    colStmt.bind([word.id]);
    while (colStmt.step()) {
      collocations.push(colStmt.getAsObject() as Collocation);
    }

    // Get other languages
    const langStmt = db.prepare(
      `SELECT lang, meaning, words FROM other_languages WHERE word_id = ?`
    );
    const otherLanguages: OtherLanguage[] = [];
    langStmt.bind([word.id]);
    while (langStmt.step()) {
      otherLanguages.push(langStmt.getAsObject() as OtherLanguage);
    }

    // Get word roots
    const rootStmt = db.prepare(
      `SELECT rd.root 
       FROM root_dictionary rd 
       JOIN word_roots wr ON rd.id = wr.root_id 
       WHERE wr.word_id = ?`
    );
    const roots: Root[] = [];
    rootStmt.bind([word.id]);
    while (rootStmt.step()) {
      roots.push(rootStmt.getAsObject() as Root);
    }

    return {
      word,
      collocations,
      otherLanguages,
      roots
    };
  } catch (err) {
    console.error('Error searching word:', err);
    throw new Error('Error searching word');
  }
};

export const searchWordsByPrefix = (db: any, prefix: string, limit: number = 10) => {
  if (!db || !prefix) {
    return [];
  }

  try {
    const stmt = db.prepare(
      `SELECT word, frequency 
       FROM words 
       WHERE word LIKE ? || '%' COLLATE NOCASE
       ORDER BY 
         CASE frequency
           WHEN 'very_common' THEN 1
           WHEN 'common' THEN 2
           WHEN 'uncommon' THEN 3
           WHEN 'rare' THEN 4
           WHEN 'archaic' THEN 5
         END,
         length(word),
         word
       LIMIT ?`
    );
    
    const words: Pick<Word, 'word' | 'frequency'>[] = [];
    stmt.bind([prefix, limit]);
    while (stmt.step()) {
      words.push(stmt.getAsObject() as Pick<Word, 'word' | 'frequency'>);
    }

    return words;
  } catch (err) {
    console.error('Error searching words by prefix:', err);
    return [];
  }
}; 