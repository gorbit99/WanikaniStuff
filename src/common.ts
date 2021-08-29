export interface AuxiliaryData {
  type: "whitelist" | "blacklist";
  meaning: string;
}

export type ItemType = "vocab" | "kanji";

export interface ReviewData {
  auxiliary_meanings: AuxiliaryData[];
  auxiliary_readings: AuxiliaryData[];
  en: string[];
  id: string;
  srs: number;
  syn: string[];
  due_date: Date;
  burned: boolean;
}

export interface LessonData {
  auxiliary_meanings: AuxiliaryData[];
  auxiliary_readings: AuxiliaryData[];
  en: string[];
  id: string;
  mmne: string;
  rmne: string;
}

export interface JSONData {
  en: string;
  meaning_note: null;
  reading_note: null;
  stroke: number;
}
