import { KanjiData } from "./kanji";
import { VocabData } from "./vocab";

export type DataItem = KanjiData | VocabData;

export class Database {
  data: DataItem[];

  constructor() {
    this.data = [];
  }

  load() {
    this.data = $.jStorage.get("customCards", []);
  }

  save() {
    $.jStorage.set("customCards", this.data);
  }

  migrate() {
    let rawData: any = this.data;
    rawData.map((item: any) => {
      if (item.version === undefined) {
        if (item.voc !== undefined && item.collocations === undefined) {
          item.collocations = [];
        }
        if (item.voc !== undefined && item.kanji === undefined) {
          item.kanji = [];
        }

        if (item.kan !== undefined && item.radicals === undefined) {
          item.radicals = [];
        }

        if (item.kan !== undefined && item.vocabulary === undefined) {
          item.vocabulary = [];
        }

        if (item.metadata === undefined) {
          if (item.voc !== undefined) {
            const metadata = {
              stroke: item.stroke,
              meaning_explanation: item.meaning_explanation,
              reading_explanation: item.reading_explanation,
              en: item.en.join(", "),
              kana: item.kana.join(", "),
              sentences: item.sentences,
              meaning_note: item.meaning_note,
              reading_note: item.reading_note,
              parts_of_speech: item.parts_of_speech,
              audio: item.audio,
              related: item.related,
            };

            delete item.stroke;
            delete item.meaning_explanation;
            delete item.reading_explanation;
            delete item.sentences;
            delete item.meaning_note;
            delete item.reading_note;
            delete item.parts_of_speech;
            delete item.audio;
            delete item.related;

            item.metadata = metadata;
          } else if (item.kan !== undefined) {
            const metadata = {
              stroke: item.stroke,
              meaning_mnemonic: item.meaning_mnemonic,
              meaning_hint: item.meaning_hint,
              reading_mnemonic: item.reading_mnemonic,
              reading_hint: item.reading_hint,
              en: item.en.join(", "),
              meaning_note: item.meaning_note,
              reading_note: item.reading_note,
              related: item.related,
            };

            item.metadata = metadata;

            delete item.stroke;
            delete item.meaning_mnemonic;
            delete item.meaning_hint;
            delete item.reading_mnemonic;
            delete item.reading_hint;
            delete item.meaning_note;
            delete item.reading_note;
            delete item.related;
          }
        }

        const jsonData = item.metadata;
        delete item.metadata;

        const lessonData: any = {};
        const reviewData: any = {};

        for (const key in item) {
          if (key === "collocations" || key === "kanji") {
            lessonData[key] = item[key];
          } else {
            reviewData[key] = item[key];
          }
          delete item[key];
        }

        if (reviewData.voc !== undefined) {
          lessonData.aud = reviewData.aud;
          lessonData.auxiliary_meanings = reviewData.auxiliary_meanings;
          lessonData.auxiliary_readings = reviewData.auxiliary_readings;
          lessonData.en = reviewData.en;
          lessonData.id = reviewData.id;
          lessonData.kana = reviewData.kana;
          lessonData.mmne = reviewData.meaning_explanation;
          lessonData.parts_of_speech = reviewData.parts_of_speech;
          lessonData.rmne = reviewData.reading_explanation;
          lessonData.sentences = reviewData.sentences;
          lessonData.voc = reviewData.voc;
        } else if (reviewData.kan !== undefined) {
          lessonData.auxiliary_meanings = reviewData.auxiliary_meanings;
          lessonData.auxiliary_readings = reviewData.auxiliary_readings;
          lessonData.emph = reviewData.emph;
          lessonData.en = reviewData.en;
          lessonData.id = reviewData.id;
          lessonData.kan = reviewData.kan;
          lessonData.kun = reviewData.kun;
          lessonData.mhnt = reviewData.meaning_hint;
          lessonData.mmne = reviewData.meaning_explanation;
          lessonData.nanori = reviewData.nanori;
          lessonData.on = reviewData.on;
          lessonData.radicals = reviewData.radicals;
          lessonData.rhnt = reviewData.rhnt;
          lessonData.rmne = reviewData.rmne;
          lessonData.vocabulary = reviewData.vocabulary;
        }
        item.lessonData = lessonData;
        item.reviewData = reviewData;
        item.jsonData = jsonData;
        item.version = 1;
      }

      if (item.reviewData.voc !== undefined) {
        return item as VocabData;
      } else {
        return item as KanjiData;
      }
    });

    this.save();
  }

  getDueReviews() {
    return this.data.filter(
      (item) =>
        (!item.reviewData.due_date ||
          new Date(item.reviewData.due_date) <= new Date()) &&
        !item.reviewData.burned &&
        item.reviewData.srs !== 0
    );
  }

  getDueLessons() {
    const items = this.data.filter((item) => item.reviewData.srs === 0);

    return items;
  }

  get(id: string) {
    return this.data.find((item) => item.reviewData.id === id);
  }

  getIndex(id: string) {
    return this.data.findIndex((item) => item.reviewData.id === id);
  }

  find(predicate: (item: DataItem) => boolean) {
    return this.data.find(predicate);
  }

  add(entry: DataItem) {
    this.data.push(entry);
  }

  getNextId() {
    const max = Math.max.apply(
      Math,
      this.data.map((item) => parseInt(item.reviewData.id.slice(1)))
    );

    if (!isFinite(max)) {
      return 0;
    }
    return max + 1;
  }

  fromJSONEndpoint(endpoint: string) {
    const id = endpoint.slice(endpoint.lastIndexOf("/") + 1);
    return this.get(id)?.jsonData;
  }
}
