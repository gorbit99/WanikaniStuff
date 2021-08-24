interface JishoWordData {
  word: string;
  reading: string;
}

interface JishoSenses {
  english_definitions: string[];
  parts_of_speech: string[];
  links: string[];
  tags: string[];
  restrictions: string[];
  see_also: string[];
  antonyms: string[];
  source: string[];
  info: string[];
}

interface JishoDataPoint {
  slug: string;
  is_common: boolean;
  tags: string[];
  jlpt: string[];
  japanese: JishoWordData[];
  senses: JishoSenses[];
  attribution: {
    jmdict: boolean;
    jmnedict: boolean;
    dbpedia: boolean;
  };
}

interface JishoResult {
  meta: {
    status: number;
  };
  data: JishoDataPoint[];
}

export class Jisho {
  public static queryTerm(searchTerm: string): Promise<JishoResult> {
    return new Promise((resolve, reject) => {
      GM.xmlHttpRequest({
        url: `https://jisho.org/api/v1/search/words?keyword=${searchTerm}`,
        method: "GET",
        onload: (response) =>
          resolve(JSON.parse(response.responseText) as JishoResult),
        onerror: reject,
      });
    });
  }
}
