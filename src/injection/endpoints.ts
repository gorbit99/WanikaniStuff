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

      if (data.success === undefined) {
        return originalAjax(data);
      }

      console.log(
        data.type?.toLowerCase() === "put" &&
          data.dataType === "json" &&
          data.url?.startsWith("/json/progress")
      );

      const originalSuccess = data.success as (
        _data: ReviewData[],
        _status: string,
        _jqXHR: JQuery.jqXHR
      ) => void;

      if (
        data.type?.toLowerCase() === "get" &&
        data.dataType === "json" &&
        data.url?.startsWith("/review/queue")
      ) {
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

              console.log(items);
              originalSuccess(items, status, jqXHR);
            });
          });
        };
      } else if (
        data.type?.toLowerCase() === "put" &&
        data.dataType === "json" &&
        data.url?.startsWith("/json/progress")
      ) {
        console.log("Hello");
        if (data.data === undefined) {
          return originalAjax(data);
        }
        let items = data.data as Record<number | string, [number, number]>;
        console.log(Object.keys(items));
      }
      return originalAjax(data);
    }

    const originalAjax = $.ajax;
    $.ajax = ajaxOverride;
  }
}
