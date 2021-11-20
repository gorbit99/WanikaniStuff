import { DBSchema, IDBPDatabase, openDB } from "idb/with-async-ittr";
import { ItemData } from "./data/common";
import { KanjiData } from "./data/kanji";
import { SRSData } from "./data/srs";
import { VocabData } from "./data/vocab";

interface CardSchema extends DBSchema {
  cards: {
    key: string;
    value: ItemData;
  };
}

export class Database {
  private static instance: Database | undefined;

  public static async getInstance(): Promise<Database> {
    if (Database.instance === undefined) {
      Database.instance = await Database.init();
    }

    return Database.instance;
  }

  private db: IDBPDatabase<CardSchema>;

  private constructor(db: IDBPDatabase<CardSchema>) {
    this.db = db;
  }

  private static async init(): Promise<Database> {
    const db = await openDB<CardSchema>("cardDB", 1, {
      upgrade(db) {
        db.createObjectStore("cards", { keyPath: "id" });
      },
    });

    return new Database(db);
  }

  public addCard(card: ItemData): void {
    this.db.put("cards", card);
  }

  public async getById(id: string): Promise<ItemData | null> {
    return (await this.db.get("cards", id)) ?? null;
  }

  public async getDueLessons(): Promise<ItemData[]> {
    return this.select(
      (itemData) => itemData.srsData.isDue() && itemData.srsData.isLesson()
    );
  }

  public async getDueReviews(): Promise<ItemData[]> {
    return this.select((itemData) => {
      return itemData.srsData.isDue() && itemData.srsData.isReview();
    });
  }

  public async handleCompletion(
    id: string,
    incorrectGuesses: number
  ): Promise<void> {
    let item = await this.getById(id);
    console.log(item);
    if (item === null) {
      return;
    }

    this.hydrateData(item);
    item.srsData.handleReviewed(incorrectGuesses);

    await this.db.put("cards", item);
  }

  private hydrateData(data: ItemData): void {
    if (data.id.startsWith("ck")) {
      Object.setPrototypeOf(data, KanjiData.prototype);
    } else if (data.id.startsWith("cv")) {
      Object.setPrototypeOf(data, VocabData.prototype);
    }

    Object.setPrototypeOf(data.srsData, SRSData.prototype);
  }

  private async select(
    query: (_itemData: ItemData) => boolean
  ): Promise<ItemData[]> {
    const transaction = this.db.transaction("cards");

    const result: ItemData[] = [];

    for await (const cursor of transaction.store) {
      let value = cursor.value;
      this.hydrateData(value);
      if (query(value)) {
        result.push(value);
      }
    }

    return result;
  }
}
