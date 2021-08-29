import { ArrayInput } from "./arrayInput";
import { AuxiliaryData } from "./common";
import { database } from "./userscript";

interface AudioData {
  content_type: string;
  pronounciation: string;
  url: string;
  voice_actor_id: number;
}

interface KanjiCompositionData {
  en: string;
  ja: string;
  kan: string;
  slug: string;
}

export interface VocabReviewData {
  aud: AudioData[];
  auxiliary_meanings: AuxiliaryData[];
  auxiliary_readings: AuxiliaryData[];
  en: string[];
  id: string;
  kana: string[];
  srs: number;
  syn: string[];
  voc: string;
  due_date: Date;
  burned: boolean;
}

export interface VocabLessonData {
  aud: AudioData[];
  auxiliary_meanings: AuxiliaryData[];
  auxiliary_readings: AuxiliaryData[];
  collocations: never[];
  en: string[];
  id: string;
  kana: string[];
  kanji: KanjiCompositionData[];
  mmne: string;
  parts_of_speech: string[];
  rmne: string;
  sentences: [string, string][];
  voc: string;
}

export interface VocabJSONData {
  audio: AudioData[];
  en: string;
  kana: string;
  meaning_explanation: string;
  meaning_note: null;
  parts_of_speech: string[];
  reading_explanation: string;
  reading_note: null;
  related: KanjiCompositionData[];
  sentences: [string, string][];
  stroke: number;
}

export interface VocabData {
  version: number;
  reviewData: VocabReviewData;
  lessonData: VocabLessonData;
  jsonData: VocabJSONData;
}

export class Vocab {
  public static async addVocab(form: HTMLFormElement): Promise<boolean> {
    const formData = new FormData(form);

    if (await database.containsVocab(formData.get("vocab") as string)) {
      alert("That vocab has been added before!");
      return false;
    }

    const meaningArrayInput = new ArrayInput(
      form.querySelector("#meaning") as HTMLElement
    );
    const readingArrayInput = new ArrayInput(
      form.querySelector("#reading") as HTMLElement
    );
    const sentencesArrayInput = new ArrayInput(
      form.querySelector("#sentences") as HTMLElement
    );

    const meanings = meaningArrayInput.getValues();
    console.log(meanings);
    const readings = readingArrayInput.getValues();

    const sentencesRaw = sentencesArrayInput.getValues();
    const sentences: [string, string][] = [];
    for (let i = 0, len = sentencesRaw.length / 2; i < len; i++) {
      sentences.push([
        sentencesRaw[i * 2] ?? "",
        sentencesRaw[i * 2 + 1] ?? "",
      ]);
    }

    const kanjiCompositionArrayInput = new ArrayInput(
      form.querySelector("#kanjiComposition") as HTMLElement
    );

    const kanjiCompositionRaw = kanjiCompositionArrayInput.getValues();

    const meaning_mnemonic =
      (formData.get("meaningMnemonic") as string) ||
      "No meaning mnemonic was given.";
    const reading_mnemonic =
      (formData.get("readingMnemonic") as string) ||
      "No reading mnemonic was given.";

    const kanjiComposition = [];

    for (let i = 0; i < kanjiCompositionRaw.length / 3; i++) {
      const kanji = kanjiCompositionRaw[i * 3] ?? "";
      const meaning = kanjiCompositionRaw[i * 3 + 1] ?? "";
      const reading = kanjiCompositionRaw[i * 3 + 2] ?? "";

      kanjiComposition.push({
        kan: kanji,
        en: meaning,
        slug: kanji,
        ja: reading,
      });
    }

    const partsOfSpeechArrayInput = new ArrayInput(
      form.querySelector("#partsOfSpeech") as HTMLElement
    );

    const nextId = await database.getNextId();

    const newEntry: VocabData = {
      version: 1,

      reviewData: {
        aud: [], //Todo Audio
        auxiliary_meanings: [], //No need
        auxiliary_readings: [], //No need
        en: meanings,
        id: "c" + nextId,
        kana: readings,
        srs: 0,
        syn: [], //Later with card management
        voc: formData.get("vocab") as string,
        due_date: new Date(),
        burned: false,
      },

      jsonData: {
        audio: [], //Todo Audio
        en: meanings.join(", "),
        kana: readings.join(", "),
        meaning_explanation: meaning_mnemonic,
        meaning_note: null, //Later with card management
        parts_of_speech: partsOfSpeechArrayInput.getValues(),
        reading_explanation: reading_mnemonic,
        reading_note: null, //Later with card management
        related: kanjiComposition,
        sentences: sentences,
        stroke: 0, //No need
      },

      lessonData: {
        aud: [], //Todo Audio
        auxiliary_meanings: [], //No need
        auxiliary_readings: [], //No need
        collocations: [], //Todo dunno
        en: meanings,
        id: "c" + nextId,
        kana: readings,
        kanji: kanjiComposition,
        mmne: meaning_mnemonic,
        parts_of_speech: partsOfSpeechArrayInput.getValues(),
        rmne: reading_mnemonic,
        sentences: sentences,
        voc: formData.get("vocab") as string,
      },
    };

    database.add(newEntry);

    return true;
  }

  public static importVocab(form: HTMLFormElement): boolean {
    const formData = new FormData(form);

    const chooseDeckElem = document.querySelector(
      "#chooseDeck"
    ) as HTMLInputElement;

    if (chooseDeckElem.files === null) {
      return false;
    }

    const file = chooseDeckElem.files[0];

    const fileReader = new FileReader();

    fileReader.onload = async (event) => {
      const target = event.target as FileReader;

      const text = target.result as string;

      const lines = text.split("\n").map((line) => line.split("\t"));

      let nextId = await database.getNextId();

      for (const line of lines) {
        const vocab = line[parseInt(formData.get("vocab") as string)] as string;

        if (await database.containsVocab(vocab)) {
          continue;
        }

        const getField = (field: string): string => {
          return line[parseInt(formData.get(field) as string)] ?? "";
        };

        const meaning_explanationId = parseInt(
          formData.get("meaningMnemonic") as string
        );
        const reading_explanationId = parseInt(
          formData.get("readingMnemonic") as string
        );

        const meaning_mnemonic =
          meaning_explanationId === -1
            ? "No meaning mnemonic was given."
            : line[meaning_explanationId] ?? "";
        const reading_mnemonic =
          reading_explanationId === -1
            ? "No reading mnemonic was given."
            : line[reading_explanationId] ?? "";

        const newEntry: VocabData = {
          version: 1,

          reviewData: {
            aud: [],
            auxiliary_meanings: [],
            auxiliary_readings: [],
            en: [getField("meaning")],
            id: "c" + nextId,
            kana: [getField("reading")],
            srs: 0,
            syn: [],
            voc: vocab,
            due_date: new Date(),
            burned: false,
          },

          jsonData: {
            stroke: 0,
            meaning_explanation: meaning_mnemonic,
            reading_explanation: reading_mnemonic,
            en: getField("meaning"),
            kana: getField("reading"),
            sentences: [],
            meaning_note: null,
            reading_note: null,
            parts_of_speech: [],
            audio: [],
            related: [],
          },

          lessonData: {
            aud: [],
            auxiliary_meanings: [],
            auxiliary_readings: [],
            en: [getField("meaning")],
            id: "c" + nextId,
            kana: [getField("reading")],
            voc: vocab,
            collocations: [], //Todo dunno
            kanji: [],
            mmne: meaning_mnemonic,
            rmne: reading_mnemonic,
            parts_of_speech: [],
            sentences: [],
          },
        };

        database.add(newEntry);

        nextId++;
      }

      return true;
    };

    if (file === undefined) {
      return false;
    }

    fileReader.readAsText(file);

    return true;
  }
}
