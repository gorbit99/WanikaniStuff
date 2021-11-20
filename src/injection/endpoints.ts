// import { ItemData, ReviewData } from "../storage/data/common";
// import {Database} from "../storage/database";

import { ReviewData } from "../storage/data/common";
import { Database } from "../storage/database";

// interface WaniKaniObject {
//   features: {
//     noAutoUnlock: boolean;
//     reactSlides: boolean;
//     jStorageSpy: boolean;
//   };
//   exceptions: {};
//   iosPatch: { touchable: boolean };
//   version: string;
//   username: string;
//   default_voice_actor_id: number;
//   voice_actors: {
//     voice_actor_id: number;
//     voice_actor_name: string;
//     voice_description: string;
//     gender: string;
//   }[];
//   wanikani_compatibility_mode: boolean;
// }

// declare var WaniKani: WaniKaniObject;

export class Endpoints {
  private static instance: Endpoints | undefined;

  public static getInstance(): Endpoints {
    this.instance ??= new Endpoints();

    return this.instance;
  }

  public init(): void {
    function ajaxOverride(_data: JQuery.AjaxSettings): JQuery.jqXHR;
    function ajaxOverride(
      _url: string,
      _data: JQuery.AjaxSettings | undefined
    ): JQuery.jqXHR;
    function ajaxOverride(
      a: string | JQuery.AjaxSettings,
      b?: JQuery.AjaxSettings | undefined
    ): JQuery.jqXHR {
      if (typeof a === "string") {
        return originalAjax(a, b);
      }

      const data = a;
      console.log(data);

      if (
        data.type?.toLowerCase() === "get" &&
        data.dataType === "json" &&
        data.url?.startsWith("/review/queue")
      ) {
        const originalSuccess = data.success as (
          _data: ReviewData[],
          _status: string,
          _jqXHR: JQuery.jqXHR
        ) => void;

        data.success = (items: ReviewData[], status, jqXHR) => {
          Database.getInstance().then((db) => {
            db.getDueReviews().then((additionalItems) => {
              additionalItems
                .map((itemData) => itemData.toReview())
                .forEach((item) => {
                  items.splice(
                    Math.floor(Math.random() * items.length),
                    0,
                    item
                  );
                });

              originalSuccess(items, status, jqXHR);
            });
          });
        };
      } else if (
        data.type?.toLowerCase() === "put" &&
        data.dataType === "json" &&
        data.url?.startsWith("/json/progress")
      ) {
        if (data.data === undefined) {
          return originalAjax(data);
        }
        Database.getInstance().then((db) => {
          let promise: Promise<void> | null = null;
          let items = data.data as Record<number | string, number[]>;
          Object.keys(items).forEach((id) => {
            if (typeof id === "string" && id.startsWith("c")) {
              let incorrectGuessArray = items[id] as number[];
              let incorrectGuesses =
                (incorrectGuessArray[0] ?? 0) + (incorrectGuessArray[1] ?? 0);
              if (promise === null) {
                promise = db.handleCompletion(id, incorrectGuesses);
              } else {
                promise.then(() => {
                  db.handleCompletion(id, incorrectGuesses);
                });
              }
            }
          });
        });
      }

      return originalAjax(data);
    }

    const originalAjax = $.ajax;
    $.ajax = ajaxOverride;
  }
}
