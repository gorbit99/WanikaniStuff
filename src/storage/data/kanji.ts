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

interface RadicalCompositionData {
  en: string;
  rad: string;
  slug: string;
  type: string;
  characters: string;
  characters_image_url: null;
}

interface VocabularyExampleData {
  en: string;
  ja: string;
  slug: string;
  voc: string;
  type: string;
  characters: string;
}

export type Emphasis = "onyomi" | "kunyomi";

export interface KanjiLessonData extends LessonData {
  emph: Emphasis;
  kan: string;
  kun: string[];
  mhnt: string;
  nanori: string[];
  on: string[];
  radicals: RadicalCompositionData[];
  rhnt: string;
  vocabulary: VocabularyExampleData[];
}

export interface KanjiReviewData extends ReviewData {
  emph: Emphasis;
  kan: string;
  kun: string[];
  nanori: string[];
  on: string[];
  radicals: RadicalCompositionData[];
  syn: string[];
  vocabulary: VocabularyExampleData[];
}

export interface KanjiJSONData extends JSONData {
  meaning_hint: string;
  meaning_mnemonic: string;
  reading_hint: string;
  reading_mnemonic: string;
  related: RadicalCompositionData[];
}

export class KanjiData extends ItemData {
  emph: Emphasis;
  kun: string[];
  nanori: string[];
  on: string[];
  vocabulary: VocabularyExampleData[];
  meaning_hint: string;
  reading_hint: string;
  related: RadicalCompositionData[];
  relationships: Relationships;

  public constructor(
    formData: Record<string, string | string[] | Record<string, string>[]>
  ) {
    const id = `ck${formData["slug"]}`;
    const en = formData["en"] as string[];
    const slug = formData["slug"] as string;
    const stroke = 0;
    const syn: string[] = [];
    const meaning_note = null;
    const reading_note = null;
    const meaning_mnemonic = formData["meaning_mnemonic"] as string;
    const reading_mnemonic = formData["reading_mnemonic"] as string;
    const emph = formData["emph"] as Emphasis;
    const kun = formData["kun"] as string[];
    const on = formData["on"] as string[];
    const nanori = formData["nanori"] as string[];
    const vocabulary = (formData["vocabulary"] as Record<string, string>[]).map(
      (vocab) => {
        return {
          en: vocab["en"] as string,
          ja: vocab["ja"] as string,
          slug: vocab["slug"] as string,
          voc: vocab["slug"] as string,
          type: "Vocabulary",
          characters: vocab["slug"] as string,
        };
      }
    );
    const meaning_hint = formData["meaning_hint"] as string;
    const reading_hint = formData["reading_hint"] as string;
    const related = (formData["related"] as Record<string, string>[]).map(
      (radical) => {
        return {
          en: radical["en"] as string,
          rad: radical["rad"] as string,
          slug: (radical["en"] as string).toLowerCase().replaceAll(" ", "-"),
          type: "Radical",
          characters: radical["rad"] as string,
          characters_image_url: null,
        };
      }
    );
    const relationships = { study_material: null };

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

    this.emph = emph;
    this.kun = kun;
    this.nanori = nanori;
    this.on = on;
    this.vocabulary = vocabulary;
    this.meaning_hint = meaning_hint;
    this.reading_hint = reading_hint;
    this.related = related;
    this.relationships = relationships;
  }

  public toLesson(): KanjiLessonData {
    return {
      auxiliary_meanings: [],
      auxiliary_readings: [],
      characters: this.slug,
      emph: this.emph,
      en: this.en,
      id: this.id,
      kan: this.slug,
      kun: this.kun,
      mhnt: this.meaning_hint,
      mmne: this.meaning_mnemonic,
      nanori: this.nanori,
      on: this.on,
      radicals: this.related,
      relationships: this.relationships,
      rhnt: this.reading_hint,
      rmne: this.reading_mnemonic,
      type: "Kanji",
      vocabulary: this.vocabulary,
    };
  }

  public toReview(): KanjiReviewData {
    return {
      auxiliary_meanings: [],
      auxiliary_readings: [],
      characters: this.slug,
      emph: this.emph,
      en: this.en,
      id: this.id,
      kan: this.slug,
      kun: this.kun,
      nanori: this.nanori,
      on: this.on,
      radicals: this.related,
      srs: this.srsData.srs,
      syn: this.syn,
      type: "Kanji",
      vocabulary: this.vocabulary,
    };
  }

  public toJSON(): KanjiJSONData {
    return {
      characters: this.slug,
      en: this.en.join(", "),
      id: this.id,
      meaning_hint: this.meaning_hint,
      meaning_mnemonic: this.meaning_mnemonic,
      meaning_note: this.meaning_note,
      reading_hint: this.reading_hint,
      reading_mnemonic: this.reading_mnemonic,
      reading_note: this.reading_note,
      related: this.related,
      stroke: this.stroke,
      type: "Kanji",
    };
  }
}
