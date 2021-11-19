import { Endpoints } from "./injection/endpoints";
import { Database } from "./storage/database";
import { UI } from "./ui";

Endpoints.getInstance().init();

window.addEventListener("DOMContentLoaded", () => {
  if (!("indexedDB" in window)) {
    alert(
      "Your browser seems to be outdated, update it before trying to use WICS!"
    );

    throw "IndexedDBNotSupported";
  }

  UI.getInstance().init();

  async function handleDatabase() {
    const db = await Database.getInstance();

    console.log(await db.getDueLessons());
  }

  handleDatabase();
});
