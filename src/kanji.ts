import { ArrayInput } from "./arrayInput";
import { AuxiliaryData } from "./common";
import { database } from "./userscript";

interface RadicalCompositionData {
  en: string;
  rad: string;
  slug: string;
}

interface VocabularyExampleData {
  en: string;
  ja: string;
  slug: string;
  voc: string;
}

type Emphasis = "onyomi" | "kunyomi";

export interface KanjiReviewData {
  auxiliary_meanings: AuxiliaryData[];
  auxiliary_readings: AuxiliaryData[];
  emph: Emphasis;
  en: string[];
  id: string;
  kan: string;
  kun: string[];
  nanori: string[];
  on: string[];
  radicals: RadicalCompositionData[];
  srs: number;
  syn: string[];
  vocabulary: VocabularyExampleData[];
  due_date: Date;
  burned: boolean;
}

export interface KanjiLessonData {
  auxiliary_meanings: AuxiliaryData[];
  auxiliary_readings: AuxiliaryData[];
  emph: Emphasis;
  en: string[];
  id: string;
  kan: string;
  kun: string[];
  mhnt: string;
  mmne: string;
  nanori: string[];
  on: string[];
  radicals: RadicalCompositionData[];
  rhnt: string;
  rmne: string;
  vocabulary: VocabularyExampleData[];
}

export interface KanjiJSONData {
  en: string;
  meaning_hint: string;
  meaning_mnemonic: string;
  meaning_note: null;
  reading_hint: string;
  reading_mnemonic: string;
  reading_note: null;
  related: RadicalCompositionData[];
  stroke: number;
}

export interface KanjiData {
  version: number;
  reviewData: KanjiReviewData;
  lessonData: KanjiLessonData;
  jsonData: KanjiJSONData;
}

export class Kanji {
  public static async addKanji(form: HTMLFormElement): Promise<boolean> {
    const formData = new FormData(form);

    if (await database.containsKanji(formData.get("kanji") as string)) {
      alert("That kanji has been added before!");
      return false;
    }

    const meaningArrayInput = new ArrayInput(
      form.querySelector("#meaning") as HTMLElement
    );
    const onyomiArrayInput = new ArrayInput(
      form.querySelector("#onyomi") as HTMLElement
    );
    const kunyomiArrayInput = new ArrayInput(
      form.querySelector("#kunyomi") as HTMLElement
    );

    const meanings = meaningArrayInput.getValues();

    const meaning_mnemonic =
      (formData.get("meaningMnemonic") as string) ||
      "No meaning mnemonic was given.";

    const meaning_hint =
      (formData.get("meaningHint") as string) || "No meaning hint was given.";

    const reading_mnemonic =
      (formData.get("readingMnemonic") as string) ||
      "No reading mnemonic was given.";

    const reading_hint =
      (formData.get("readingHint") as string) || "No reading hint was given.";

    const newEntry: KanjiData = {
      version: 1,

      reviewData: {
        auxiliary_meanings: [],
        auxiliary_readings: [],
        emph: formData.get("emphasis") as Emphasis,
        en: meanings,
        id: "c" + database.getNextId(),
        kan: formData.get("kanji") as string,
        kun: kunyomiArrayInput.getValues(),
        nanori: [],
        on: onyomiArrayInput.getValues(),
        radicals: [],
        srs: 0,
        syn: [],
        vocabulary: [],
        due_date: new Date(),
        burned: false,
      },

      jsonData: {
        en: meanings.join(", "),
        meaning_hint: meaning_hint,
        meaning_mnemonic: meaning_mnemonic,
        meaning_note: null,
        reading_hint: reading_hint,
        reading_mnemonic: reading_mnemonic,
        reading_note: null,
        related: [],
        stroke: 0,
      },

      lessonData: {
        auxiliary_meanings: [],
        auxiliary_readings: [],
        emph: formData.get("emphasis") as Emphasis,
        en: meanings,
        id: "c" + database.getNextId(),
        kan: formData.get("kanji") as string,
        kun: kunyomiArrayInput.getValues(),
        mhnt: meaning_hint,
        mmne: meaning_mnemonic,
        nanori: [],
        on: onyomiArrayInput.getValues(),
        radicals: [],
        rhnt: reading_hint,
        rmne: reading_mnemonic,
        vocabulary: [],
      },
    };

    database.add(newEntry);

    return true;
  }

  public static importKanji(form: HTMLFormElement): boolean {
    const formData = new FormData(form);

    const chooseDeckInput = document.querySelector(
      "#chooseDeck"
    ) as HTMLInputElement;

    const file = chooseDeckInput.files?.[0];

    const fileReader = new FileReader();

    fileReader.onload = async (event) => {
      const target = event.target as FileReader;

      let nextId = await database.getNextId();

      const text = target.result as string;

      const lines = text.split("\n").map((line: string) => line.split("\t"));

      for (const line of lines) {
        const kanji = line[parseInt(formData.get("kanji") as string)] as string;

        if (await database.containsKanji(kanji)) {
          continue;
        }

        const meaning_mnemonicId = parseInt(
          formData.get("meaningMnemonic") as string
        );
        const reading_mnemonicId = parseInt(
          formData.get("readingMnemonic") as string
        );
        const meaning_hintId = parseInt(formData.get("meaningHint") as string);
        const reading_hintId = parseInt(formData.get("readingHint") as string);

        const meaning_mnemonic =
          meaning_mnemonicId === -1
            ? "No meaning mnemonic was given."
            : line[meaning_mnemonicId] ?? "";

        const meaning_hint =
          meaning_hintId === -1
            ? "No meaning hint was given."
            : line[meaning_hintId] ?? "";

        const reading_mnemonic =
          reading_mnemonicId === -1
            ? "No reading mnemonic was given."
            : line[reading_mnemonicId] ?? "";

        const reading_hint =
          reading_hintId === -1
            ? "No reading hint was given."
            : line[reading_hintId] ?? "";

        const getField = (field: string): string => {
          return line[parseInt(formData.get(field) as string)] ?? "";
        };

        const newEntry: KanjiData = {
          version: 1,

          reviewData: {
            auxiliary_meanings: [],
            auxiliary_readings: [],
            emph: getField("emphasis") as Emphasis,
            en: [getField("meaning")],
            id: "c" + nextId,
            kan: getField("kanji"),
            kun: [getField("kunyomi")],
            nanori: [],
            on: [getField("onyomi")],
            srs: 0,
            syn: [],
            radicals: [],
            vocabulary: [],
            due_date: new Date(),
            burned: false,
          },

          jsonData: {
            stroke: 0,
            meaning_mnemonic: meaning_mnemonic,
            meaning_hint: meaning_hint,
            reading_mnemonic: reading_mnemonic,
            reading_hint: reading_hint,
            en: getField("meaning"),
            meaning_note: null,
            reading_note: null,
            related: [],
          },

          lessonData: {
            auxiliary_meanings: [],
            auxiliary_readings: [],
            emph: getField("emphasis") as Emphasis,
            en: [getField("meaning")],
            id: "c" + nextId,
            kan: getField("kanji"),
            kun: [getField("kunyomi")],
            nanori: [],
            on: [getField("onyomi")],
            mmne: meaning_mnemonic,
            mhnt: meaning_hint,
            rmne: reading_mnemonic,
            rhnt: reading_hint,
            radicals: [],
            vocabulary: [],
          },
        };

        database.add(newEntry);

        nextId++;
      }
    };

    if (file === undefined) {
      return false;
    }

    fileReader.readAsText(file);

    return true;
  }
}
