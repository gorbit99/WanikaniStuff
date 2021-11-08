import { Database } from "./storage/database";
import { UI } from "./ui";

if (!("indexedDB" in window)) {
  alert(
    "Your browser seems to be outdated, update it before trying to use WICS!"
  );

  throw "IndexedDBNotSupported";
}

UI.getInstance().init();

const db = await Database.init();

db.getDueReviews();
