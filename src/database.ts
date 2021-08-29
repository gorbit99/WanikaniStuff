import { ItemType, JSONData, LessonData, ReviewData } from "./common";
import {
  KanjiData,
  KanjiJSONData,
  KanjiLessonData,
  KanjiReviewData,
} from "./kanji";
import {
  VocabData,
  VocabJSONData,
  VocabLessonData,
  VocabReviewData,
} from "./vocab";

export type DataItem = KanjiData | VocabData;

export class Database {
  private databaseInstance: IDBDatabase | undefined;

  public load(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!window.indexedDB) {
        console.error(
          "Your browser doesn't support indexedDB, consider upgrading!"
        );
        reject();
        return;
      }

      Database.migrate();

      const oldData = $.jStorage.get("customCards", []) as DataItem[];

      const openRequest = window.indexedDB.open("WICSCards", 1);

      openRequest.onsuccess = (_: Event) => {
        this.databaseInstance = openRequest.result as IDBDatabase;

        resolve();
      };

      openRequest.onerror = (_: Event) => {
        console.error(
          "Couldn't create database, probably because it wasn't allowed!",
          `Error code: ${openRequest.error}`
        );

        reject();
      };

      //eslint-disable-next-line @typescript-eslint/no-explicit-any
      openRequest.onupgradeneeded = (event: any) => {
        this.databaseInstance = openRequest.result as IDBDatabase;

        if (event.oldVersion < 1) {
          const vocabReviewData = this.databaseInstance.createObjectStore(
            "vocabReviewData",
            {
              keyPath: "id",
            }
          );

          vocabReviewData.createIndex("voc", "voc", { unique: true });
          vocabReviewData.createIndex("srs", "srs", { unique: false });
          vocabReviewData.createIndex("due_date", "due_date", {
            unique: false,
          });

          vocabReviewData.transaction.oncomplete = (_: Event) => {
            if (this.databaseInstance === undefined) {
              return;
            }
            const vocabReviewStore = this.databaseInstance
              .transaction("vocabReviewData", "readwrite")
              .objectStore("vocabReviewData");

            oldData
              .filter((card) => "voc" in card.reviewData)
              .forEach((card) => {
                vocabReviewStore.put(card.reviewData);
              });
          };

          const vocabLessonData = this.databaseInstance.createObjectStore(
            "vocabLessonData",
            {
              keyPath: "id",
            }
          );

          vocabLessonData.transaction.oncomplete = (_: Event) => {
            if (this.databaseInstance === undefined) {
              return;
            }
            const vocabLessonStore = this.databaseInstance
              .transaction("vocabLessonData", "readwrite")
              .objectStore("vocabLessonData");

            oldData
              .filter((card) => "voc" in card.reviewData)
              .forEach((card) => {
                vocabLessonStore.put(card.lessonData);
              });
          };

          const vocabJSONData =
            this.databaseInstance.createObjectStore("vocabJSONData");

          vocabJSONData.transaction.oncomplete = (_: Event) => {
            if (this.databaseInstance === undefined) {
              return;
            }
            const vocabJSONStore = this.databaseInstance
              .transaction("vocabJSONData", "readwrite")
              .objectStore("vocabJSONData");

            oldData
              .filter((card) => "voc" in card.reviewData)
              .forEach((card) => {
                vocabJSONStore.put(card.jsonData, card.reviewData.id);
              });
          };

          const kanjiReviewData = this.databaseInstance.createObjectStore(
            "kanjiReviewData",
            {
              keyPath: "id",
            }
          );

          kanjiReviewData.createIndex("kan", "kan", { unique: true });
          kanjiReviewData.createIndex("srs", "srs", { unique: false });
          kanjiReviewData.createIndex("due_date", "due_date", {
            unique: false,
          });

          kanjiReviewData.transaction.oncomplete = (_: Event) => {
            if (this.databaseInstance === undefined) {
              return;
            }
            const kanjiReviewStore = this.databaseInstance
              .transaction("kanjiReviewData", "readwrite")
              .objectStore("kanjiReviewData");

            oldData
              .filter((card) => "kan" in card.reviewData)
              .forEach((card) => {
                kanjiReviewStore.put(card.reviewData);
              });
          };

          const kanjiLessonData = this.databaseInstance.createObjectStore(
            "kanjiLessonData",
            {
              keyPath: "id",
            }
          );

          kanjiLessonData.transaction.oncomplete = (_: Event) => {
            if (this.databaseInstance === undefined) {
              return;
            }
            const kanjiLessonStore = this.databaseInstance
              .transaction("kanjiLessonData", "readwrite")
              .objectStore("kanjiLessonData");

            oldData
              .filter((card) => "kan" in card.reviewData)
              .forEach((card) => {
                kanjiLessonStore.put(card.lessonData);
              });
          };

          const kanjiJSONData =
            this.databaseInstance.createObjectStore("kanjiJSONData");

          kanjiJSONData.transaction.oncomplete = (_: Event) => {
            if (this.databaseInstance === undefined) {
              return;
            }
            const kanjiJSONStore = this.databaseInstance
              .transaction("kanjiJSONData", "readwrite")
              .objectStore("kanjiJSONData");

            oldData
              .filter((card) => "kan" in card.reviewData)
              .forEach((card) => {
                kanjiJSONStore.put(card.jsonData, card.reviewData.id);
              });
          };
        }
      };
    });
  }

  private static migrate(): void {
    //eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rawData: any = $.jStorage.get("customCards", []);
    //eslint-disable-next-line @typescript-eslint/no-explicit-any
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

        //eslint-disable-next-line @typescript-eslint/no-explicit-any
        const lessonData: any = {};
        //eslint-disable-next-line @typescript-eslint/no-explicit-any
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

    $.jStorage.set("customCards", rawData);
  }

  public async getDueReviews(): Promise<ReviewData[]> {
    if (this.databaseInstance === undefined) {
      throw "There is no database to access!";
    }

    const transaction = this.databaseInstance.transaction(
      ["vocabReviewData", "kanjiReviewData"],
      "readonly"
    );

    const dueDateKeyRange = IDBKeyRange.upperBound(new Date());

    const dueVocabDateIndex = transaction
      .objectStore("vocabReviewData")
      .index("due_date");

    const dueVocab: VocabReviewData[] = await new Promise((resolve, _) => {
      const openCursorRequest = dueVocabDateIndex.openCursor(dueDateKeyRange);

      openCursorRequest.onerror = (_: Event) => {
        throw openCursorRequest.error;
      };

      const result: VocabReviewData[] = [];

      openCursorRequest.onsuccess = (_: Event) => {
        const cursor = openCursorRequest.result;
        if (cursor) {
          const value = cursor.value as VocabReviewData;

          if (value.burned) {
            cursor.continue();
            return;
          }

          result.push(value);
        }
      };

      resolve(result);
    });

    const dueKanjiDateIndex = transaction
      .objectStore("vocabReviewData")
      .index("due_date");

    const dueKanji: KanjiReviewData[] = await new Promise((resolve, _) => {
      const openCursorRequest = dueKanjiDateIndex.openCursor(dueDateKeyRange);

      openCursorRequest.onerror = (_: Event) => {
        throw openCursorRequest.error;
      };

      const result: KanjiReviewData[] = [];

      openCursorRequest.onsuccess = (_: Event) => {
        const cursor = openCursorRequest.result as IDBCursorWithValue;
        if (cursor) {
          const value = cursor.value as KanjiReviewData;

          if (value.burned) {
            cursor.continue();
            return;
          }

          result.push(value);
        }
      };

      resolve(result);
    });

    return (dueVocab as ReviewData[]).concat(dueKanji);
  }

  private async getDueLessonsType(type: ItemType): Promise<LessonData[]> {
    const reviewDataStr = type + "ReviewData";
    const lessonDataStr = type + "ReviewData";

    if (this.databaseInstance === undefined) {
      throw "There is no database to access!";
    }

    const transaction = this.databaseInstance.transaction(
      [reviewDataStr, lessonDataStr],
      "readonly"
    );

    const dueSrsKeyRange = IDBKeyRange.only(0);

    const dueSrsIndex = transaction.objectStore(reviewDataStr).index("srs");

    const lessonStore = transaction.objectStore(lessonDataStr);

    const results: LessonData[] = [];

    await new Promise<void>((resolve, _) => {
      const cursorRequest = dueSrsIndex.openKeyCursor(dueSrsKeyRange);

      cursorRequest.onsuccess = (_: Event) => {
        const cursor = cursorRequest.result as IDBCursor;

        if (cursor) {
          const id = cursor.primaryKey;

          const getRequest = lessonStore.get(id);

          getRequest.onsuccess = (_: Event) => {
            results.push(getRequest.result);
          };

          cursor.continue();
        } else {
          resolve();
        }
      };
    });

    return results;
  }

  public async getDueLessons(): Promise<LessonData[]> {
    const kanjiLessonData = await this.getDueLessonsType("kanji");
    const vocabLessonData = await this.getDueLessonsType("vocab");

    return kanjiLessonData.concat(vocabLessonData);
  }

  private async getReviewData(id: string, type: ItemType): Promise<ReviewData> {
    if (this.databaseInstance === undefined) {
      throw "There is no database to access!";
    }

    const transaction = this.databaseInstance.transaction(
      ["vocabReviewData", "kanjiReviewData"],
      "readonly"
    );

    return new Promise((resolve, reject) => {
      if (type === "vocab") {
        const vocabReviewStore = transaction.objectStore("vocabReviewData");

        const getRequest = vocabReviewStore.get(id);

        getRequest.onsuccess = (_: Event) => {
          resolve(getRequest.result);
        };

        getRequest.onerror = (_: Event) => {
          reject();
        };
      } else {
        const kanjiReviewStore = transaction.objectStore("kanjiReviewStore");
        const getRequest = kanjiReviewStore.get(id);

        getRequest.onsuccess = (_: Event) => {
          resolve(getRequest.result);
        };

        getRequest.onerror = (_: Event) => {
          reject();
        };
      }
    });
  }

  private async getLessonData(id: string, type: ItemType): Promise<LessonData> {
    if (this.databaseInstance === undefined) {
      throw "There is no database to access!";
    }

    const transaction = this.databaseInstance.transaction(
      ["vocabLessonData", "kanjiLessonData"],
      "readonly"
    );

    return new Promise((resolve, reject) => {
      if (type === "vocab") {
        const vocabLessonStore = transaction.objectStore("vocabLessonData");

        const getRequest = vocabLessonStore.get(id);

        getRequest.onsuccess = (_: Event) => {
          resolve(getRequest.result);
        };

        getRequest.onerror = (_: Event) => {
          reject();
        };
      } else {
        const kanjiLessonStore = transaction.objectStore("kanjiLessonStore");
        const getRequest = kanjiLessonStore.get(id);

        getRequest.onsuccess = (_: Event) => {
          resolve(getRequest.result);
        };

        getRequest.onerror = (_: Event) => {
          reject();
        };
      }
    });
  }

  private async getJSONData(id: string, type: ItemType): Promise<JSONData> {
    if (this.databaseInstance === undefined) {
      throw "There is no database to access!";
    }

    const transaction = this.databaseInstance.transaction(
      ["vocabJSONData", "kanjiJSONData"],
      "readonly"
    );

    return new Promise((resolve, reject) => {
      if (type === "vocab") {
        const vocabJSONStore = transaction.objectStore("vocabJSONData");

        const getRequest = vocabJSONStore.get(id);

        getRequest.onsuccess = (_: Event) => {
          resolve(getRequest.result);
        };

        getRequest.onerror = (_: Event) => {
          reject();
        };
      } else {
        const kanjiJSONStore = transaction.objectStore("kanjiJSONStore");
        const getRequest = kanjiJSONStore.get(id);

        getRequest.onsuccess = (_: Event) => {
          resolve(getRequest.result);
        };

        getRequest.onerror = (_: Event) => {
          reject();
        };
      }
    });
  }

  private async getType(id: string): Promise<ItemType | null> {
    if (this.databaseInstance === undefined) {
      throw "There is no database to access!";
    }

    const transaction = this.databaseInstance.transaction(
      ["vocabReviewData", "kanjiReviewData"],
      "readonly"
    );

    const vocabReviewStore = transaction.objectStore("vocabReviewData");
    const kanjiReviewStore = transaction.objectStore("kanjiReviewData");

    const vocabCountRequest = vocabReviewStore.count(id);

    return new Promise((resolve, _) => {
      vocabCountRequest.onsuccess = (_: Event) => {
        if (vocabCountRequest.result === 1) {
          resolve("vocab");
          return;
        }

        const kanjiCountRequest = kanjiReviewStore.count(id);

        kanjiCountRequest.onsuccess = (_: Event) => {
          if (kanjiCountRequest.result === 1) {
            resolve("kanji");
          } else {
            resolve(null);
          }
        };
      };
    });
  }

  public async get(id: string): Promise<DataItem> {
    if (this.databaseInstance === undefined) {
      throw "There is no database to access!";
    }

    const type = await this.getType(id);

    if (type === null) {
      throw `The database doesn't contain an item with the id: ${id}!`;
    }

    const reviewDataPromise = this.getReviewData(id, type);
    const lessonDataPromise = this.getLessonData(id, type);
    const jsonDataPromise = this.getJSONData(id, type);

    if (type === "kanji") {
      return {
        version: 1,
        reviewData: (await reviewDataPromise) as KanjiReviewData,
        lessonData: (await lessonDataPromise) as KanjiLessonData,
        jsonData: (await jsonDataPromise) as KanjiJSONData,
      };
    } else {
      return {
        version: 1,
        reviewData: (await reviewDataPromise) as VocabReviewData,
        lessonData: (await lessonDataPromise) as VocabLessonData,
        jsonData: (await jsonDataPromise) as VocabJSONData,
      };
    }
  }

  private async addVocab(entry: VocabData): Promise<void> {
    if (this.databaseInstance === undefined) {
      throw "There is no database to access!";
    }

    const transaction = this.databaseInstance.transaction(
      ["vocabReviewData", "vocabLessonData", "vocabJSONData"],
      "readwrite"
    );

    const vocabReviewStore = transaction.objectStore("vocabReviewData");
    vocabReviewStore.add(entry.reviewData);

    const vocabLessonStore = transaction.objectStore("vocabLessonData");
    vocabLessonStore.add(entry.lessonData);

    const vocabJSONStore = transaction.objectStore("vocabJSONData");
    vocabJSONStore.add(entry.jsonData, entry.reviewData.id);
  }

  private async addKanji(entry: KanjiData): Promise<void> {
    if (this.databaseInstance === undefined) {
      throw "There is no database to access!";
    }

    const transaction = this.databaseInstance.transaction(
      ["kanjiReviewData", "kanjiLessonData", "kanjiJSONData"],
      "readwrite"
    );

    const kanjiReviewStore = transaction.objectStore("kanjiReviewData");
    kanjiReviewStore.add(entry.reviewData);

    const kanjiLessonStore = transaction.objectStore("kanjiLessonData");
    kanjiLessonStore.add(entry.lessonData);

    const kanjiJSONStore = transaction.objectStore("kanjiJSONData");
    kanjiJSONStore.add(entry.jsonData, entry.reviewData.id);
  }

  public async add(entry: DataItem): Promise<void> {
    if ("voc" in entry.reviewData) {
      return this.addVocab(entry as VocabData);
    } else {
      return this.addKanji(entry as KanjiData);
    }
  }

  public async getNextId(): Promise<number> {
    if (this.databaseInstance === undefined) {
      throw "There is no database to access!";
    }

    const transaction = this.databaseInstance.transaction(
      ["vocabReviewData", "kanjiReviewData"],
      "readonly"
    );

    const vocabReviewStore = transaction.objectStore("vocabReviewData");

    let cursorRequest = vocabReviewStore.openCursor();

    let max = -1;
    await new Promise<void>((resolve, _) => {
      cursorRequest.onsuccess = (_: Event) => {
        const cursor = cursorRequest.result;

        if (cursor) {
          const id = cursor.key as string;
          const parsedId = parseInt(id.slice(1));
          if (parsedId > max) {
            max = parsedId;
          }

          cursor.continue();
        } else {
          resolve();
        }
      };
    });

    const kanjiReviewStore = transaction.objectStore("kanjiReviewData");

    cursorRequest = kanjiReviewStore.openCursor();

    await new Promise<void>((resolve, _) => {
      cursorRequest.onsuccess = (_: Event) => {
        const cursor = cursorRequest.result;

        if (cursor) {
          const id = cursor.key as string;
          const parsedId = parseInt(id.slice(1));
          if (parsedId > max) {
            max = parsedId;
          }

          cursor.continue();
        } else {
          resolve();
        }
      };
    });

    return max + 1;
  }

  public async fromJSONEndpoint(
    endpoint: string
  ): Promise<VocabJSONData | KanjiJSONData | null> {
    const id = endpoint.slice(endpoint.lastIndexOf("/") + 1);

    const type = await this.getType(id);

    if (type === null) {
      return null;
    }

    if (type === "kanji") {
      return this.getJSONData(id, type) as Promise<KanjiJSONData>;
    } else {
      return this.getJSONData(id, type) as Promise<VocabJSONData>;
    }
  }

  public async containsVocab(vocab: string): Promise<boolean> {
    if (this.databaseInstance === undefined) {
      throw "There is no database to access!";
    }

    const transaction = this.databaseInstance.transaction(
      "vocabReviewData",
      "readonly"
    );

    const vocabReviewStore = transaction.objectStore("vocabReviewData");
    const vocabVocabindex = vocabReviewStore.index("voc");

    const countRequest = vocabVocabindex.count(vocab);

    return new Promise((resolve, _) => {
      countRequest.onsuccess = (_: Event) => {
        resolve(countRequest.result === 1);
      };
    });
  }

  public async containsKanji(kanji: string): Promise<boolean> {
    if (this.databaseInstance === undefined) {
      throw "There is no database to access!";
    }

    const transaction = this.databaseInstance.transaction(
      "kanjiReviewData",
      "readonly"
    );

    const kanjiReviewStore = transaction.objectStore("kanjiReviewData");
    const kanjiKanjiindex = kanjiReviewStore.index("kan");

    const countRequest = kanjiKanjiindex.count(kanji);

    return new Promise((resolve, _) => {
      countRequest.onsuccess = (_: Event) => {
        resolve(countRequest.result === 1);
      };
    });
  }
}
