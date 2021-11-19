export interface JishoAPIResult {
  meta: {
    status: number;
  };
  data: {
    slug: string;
    is_common: boolean;
    tags: string[];
    jlpt: string[];
    japanese: {
      word: string;
      reading: string;
    }[];
    senses: {
      english_definitions: string[];
      parts_of_speech: string[];
      links: string[];
      tags: string[];
      restrictions: string[];
      see_also: string[];
      antonyms: string[];
      source: string[];
      info: string[];
    }[];
    attributions: {
      jmdict: boolean;
      jmnedict: boolean;
      dbpedia: boolean;
    };
  }[];
}

export class JishoAPI {
  public static async fetchSearch(search: string): Promise<JishoAPIResult> {
    return new Promise((resolve, reject) => {
      GM.xmlHttpRequest({
        method: "GET",
        url: `https://jisho.org/api/v1/search/words?keyword=${search}`,
        onload: (response) => {
          resolve(JSON.parse(response.responseText));
        },
        onerror: (_) => reject(),
      });
    });
  }
}
