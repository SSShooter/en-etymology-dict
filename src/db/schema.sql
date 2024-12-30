-- Main words table
CREATE TABLE IF NOT EXISTS words (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    word TEXT NOT NULL UNIQUE,
    frequency TEXT CHECK (frequency IN ('very_common', 'common', 'uncommon', 'rare', 'archaic')),
    etymology TEXT,
    context TEXT,
    related_words TEXT,      -- 合并 related_words 表
    similar_words TEXT,      -- 合并 similar_looking_words 表
    antonyms TEXT,          -- 合并 antonyms 表
    synonyms TEXT,          -- 合并 synonyms 表
    derivatives TEXT,       -- 合并 derivatives 表
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 词根字典表
CREATE TABLE IF NOT EXISTS root_dictionary (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    root TEXT NOT NULL UNIQUE
);

-- 词根关联表
CREATE TABLE IF NOT EXISTS word_roots (
    word_id INTEGER NOT NULL,
    root_id INTEGER NOT NULL,
    PRIMARY KEY (word_id, root_id),
    FOREIGN KEY (word_id) REFERENCES words(id) ON DELETE CASCADE,
    FOREIGN KEY (root_id) REFERENCES root_dictionary(id) ON DELETE CASCADE
);

-- Other languages
CREATE TABLE IF NOT EXISTS other_languages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    word_id INTEGER,
    lang TEXT NOT NULL,
    meaning TEXT NOT NULL,
    words TEXT NOT NULL,
    FOREIGN KEY (word_id) REFERENCES words(id) ON DELETE CASCADE
);

-- Collocations
CREATE TABLE IF NOT EXISTS collocations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    word_id INTEGER,
    item TEXT NOT NULL,
    translate TEXT NOT NULL,
    FOREIGN KEY (word_id) REFERENCES words(id) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_words_word ON words(word);
CREATE INDEX IF NOT EXISTS idx_root_dictionary_root ON root_dictionary(root);
CREATE INDEX IF NOT EXISTS idx_word_roots_root_id ON word_roots(root_id);
CREATE INDEX IF NOT EXISTS idx_word_roots_word_id ON word_roots(word_id);
CREATE INDEX IF NOT EXISTS idx_other_languages_word_id ON other_languages(word_id);
CREATE INDEX IF NOT EXISTS idx_collocations_word_id ON collocations(word_id);
