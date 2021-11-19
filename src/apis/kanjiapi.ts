export interface KanjiAPIResponse {
  kanji: string;
  grade: number | null;
  stroke_count: number;
  meanings: string[];
  heisig_en: string | null;
  kun_readings: string[];
  on_readings: string[];
  name_readings: string[];
  jlpt: number | null;
  unicode: string;
}

export class KanjiAPI {
  public static async fetchKanji(kanji: string): Promise<KanjiAPIResponse> {
    const response = await fetch(`https://kanjiapi.dev/v1/kanji/${kanji}`);
    return response.json();
  }
}
