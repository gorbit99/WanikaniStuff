interface KanjiJSON {
  kanji: string;
  grade: number | null;
  stroke_count: number;
  meanings: string[];
  kun_readings: string[];
  on_readings: string[];
  name_readings: string[];
  jplt: number | null;
  unicode: string;
  heisig_en: string | null;
}

export class KanjiApi {
  public static getKanji(kanji: string): Promise<KanjiJSON> {
    return new Promise((resolve, reject) => {
      $.ajax({
        url: `https://kanjiapi.dev/v1/kanji/${kanji}`,
        type: 'get',
        dataType: 'json',
      })
          .fail(reject)
          .done(resolve);
    });
  }
}
