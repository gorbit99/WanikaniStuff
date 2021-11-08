import {
  ItemData,
  JSONData,
  LessonData,
  Relationships,
  ReviewData,
} from "./common";

export interface AudioData {
  content_type: string;
  pronounciation: string;
  url: string;
  voice_actor_id: number;
}

export interface KanjiCompositionData {
  en: string;
  ja: string;
  kan: string;
  id: string;
  type: "Kanji";
  characters: string;
}

export interface VocabLessonData extends LessonData {
  aud: AudioData[];
  collocations: never[];
  kana: string[];
  kanji: KanjiCompositionData[];
  parts_of_speech: string[];
  sentences: [string, string][];
  voc: string;
}

export interface VocabReviewData extends ReviewData {
  aud: AudioData[];
  kana: string[];
  voc: string;
  kanji: KanjiCompositionData[];
}

export interface VocabJSONData extends JSONData {
  voc: string;
  audio: AudioData[];
  kana: string;
  meaning_explanation: string;
  parts_of_speech: string[];
  reading_explanation: string;
  related: KanjiCompositionData[];
  sentences: [string, string][];
}

export class VocabData extends ItemData {
  aud: AudioData[];
  kana: string[];
  collocations: never[];
  parts_of_speech: string[];
  sentences: [string, string][];
  related: KanjiCompositionData[];
  relationships: Relationships;

  public constructor(
    id: string,
    en: string[],
    slug: string,
    stroke: number,
    syn: string[],
    meaning_note: string | null,
    reading_note: string | null,
    meaning_mnemonic: string,
    reading_mnemonic: string,
    aud: AudioData[],
    kana: string[],
    collocations: never[],
    parts_of_speech: string[],
    sentences: [string, string][],
    related: KanjiCompositionData[],
    relationships: Relationships
  ) {
    super(
      id,
      en,
      slug,
      stroke,
      syn,
      meaning_note,
      reading_note,
      meaning_mnemonic,
      reading_mnemonic
    );

    this.aud = aud;
    this.kana = kana;
    this.collocations = collocations;
    this.parts_of_speech = parts_of_speech;
    this.sentences = sentences;
    this.related = related;
    this.relationships = relationships;
  }

  public toLesson(): VocabLessonData {
    return {
      aud: this.aud,
      auxiliary_meanings: [],
      auxiliary_readings: [],
      collocations: this.collocations,
      en: this.en,
      id: this.id,
      kana: this.kana,
      kanji: this.related,
      mmne: this.meaning_mnemonic,
      parts_of_speech: this.parts_of_speech,
      rmne: this.reading_mnemonic,
      sentences: this.sentences,
      type: "Vocabulary",
      voc: this.slug,
      characters: this.slug,
      relationships: this.relationships,
    };
  }

  public toReview(): VocabReviewData {
    return {
      auxiliary_meanings: [],
      auxiliary_readings: [],
      en: this.en,
      id: this.id,
      srs: this.srsData.srs,
      syn: this.syn,
      aud: this.aud,
      kana: this.kana,
      voc: this.slug,
      kanji: this.related,
      type: "Vocabulary",
      characters: this.slug,
    };
  }

  public toJSON(): VocabJSONData {
    return {
      en: this.en.join(", "),
      meaning_note: this.meaning_note,
      reading_note: this.reading_note,
      stroke: this.stroke,
      audio: this.aud,
      kana: this.kana.join(", "),
      meaning_explanation: this.meaning_mnemonic,
      reading_explanation: this.reading_mnemonic,
      parts_of_speech: this.parts_of_speech,
      related: this.related,
      sentences: this.sentences,
      voc: this.slug,
      id: this.id,
      characters: this.slug,
      type: "Vocabulary",
    };
  }
}
