export interface Word {
  id: number;
  word: string;
  frequency: string;
  etymology: string;
  context: string;
  related_words: string;
  similar_words: string;
  antonyms: string;
  synonyms: string;
  derivatives: string;
}

export interface Root {
  root: string;
}

export interface Collocation {
  item: string;
  translate: string;
}

export interface OtherLanguage {
  lang: string;
  meaning: string;
  words: string;
} 