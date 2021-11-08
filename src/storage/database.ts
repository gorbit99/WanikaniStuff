import { DBSchema, IDBPDatabase, openDB } from "idb/with-async-ittr";
import { ItemData } from "./data/common";

interface CardSchema extends DBSchema {
  cards: {
    key: string;
    value: ItemData;
  };
}

export class Database {
  private db: IDBPDatabase<CardSchema>;

  private constructor(db: IDBPDatabase<CardSchema>) {
    this.db = db;
  }

  public static async init(): Promise<Database> {
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

  public async getDueLessons(): Promise<ItemData[]> {
    return this.select(
      (itemData) => itemData.srsData.isDue() && itemData.srsData.isLesson()
    );
  }

  public async getDueReviews(): Promise<ItemData[]> {
    return this.select(
      (itemData) => itemData.srsData.isDue() && itemData.srsData.isReview()
    );
  }

  private async select(
    query: (_itemData: ItemData) => boolean
  ): Promise<ItemData[]> {
    const transaction = this.db.transaction("cards");

    const result = [];

    for await (const cursor of transaction.store) {
      if (query(cursor.value)) {
        result.push(cursor.value);
      }
    }

    return result;
  }
}
