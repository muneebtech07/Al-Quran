export interface Verse {
  id: number;
  text: string;
  translation: string;
  transliteration: string;
  audio: string;
}

export interface Surah {
  id: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
  verses: Verse[];
}

export interface Tafseer {
  id: string;
  name: string;
  language: string;
  author: string;
}

export interface TafseerText {
  verseId: number;
  text: string;
}
