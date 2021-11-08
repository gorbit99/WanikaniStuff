import { SRSData } from "./srs";

export type ItemType = "Kanji" | "Vocabulary" | "Radical";

export interface Relationships {
  study_material: null;
}

export interface LessonData {
  type: ItemType;
  auxiliary_meanings: never[];
  auxiliary_readings: never[];
  en: string[];
  id: string;
  mmne: string;
  rmne: string;
  characters: string;
  relationships: Relationships;
}

export interface ReviewData {
  auxiliary_meanings: never[];
  auxiliary_readings: never[];
  en: string[];
  id: string;
  srs: number;
  syn: string[];
  type: ItemType;
  characters: string;
}

export interface JSONData {
  id: string;
  en: string;
  meaning_note: string | null;
  reading_note: string | null;
  stroke: number;
  type: ItemType;
  characters: string;
}

export abstract class ItemData {
  public constructor(
    id: string,
    en: string[],
    slug: string,
    stroke: number,
    syn: string[],
    meaning_note: string | null,
    reading_note: string | null,
    meaning_mnemonic: string,
    reading_mnemonic: string
  ) {
    this.id = id;
    this.srsData = new SRSData();
    this.en = en;
    this.slug = slug;
    this.stroke = stroke;
    this.syn = syn;
    this.meaning_note = meaning_note;
    this.reading_note = reading_note;
    this.meaning_mnemonic = meaning_mnemonic;
    this.reading_mnemonic = reading_mnemonic;
  }

  public id: string;
  public slug: string;
  public en: string[];
  public meaning_mnemonic: string;
  public meaning_note: string | null;
  public reading_mnemonic: string;
  public reading_note: string | null;
  public srsData: SRSData;
  public stroke: number;
  public syn: string[];

  public abstract toLesson(): LessonData;
  public abstract toReview(): ReviewData;
  public abstract toJSON(): JSONData;
}
