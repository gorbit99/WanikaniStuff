import { Database } from "./database";

import { handleLessonCompleted, handleReviewCompleted } from "./sessions";
import { UI } from "./ui";

export const database = new Database();

(function () {
  "use strict";

  console.log(database);

  if ($ === undefined || $.jStorage === undefined) {
    return;
  }

  UI.setup();

  database.load();

  const originalAjax = $.ajax;
  $.ajax = ajaxOverride;

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

    if (
      data.url === "/json/progress" &&
      data.type === "PUT" &&
      data.dataType === "json"
    ) {
      //eslint-disable-next-line @typescript-eslint/no-explicit-any
      const incorrectData = data.data as any;
      for (const item in incorrectData) {
        if (item.startsWith("c")) {
          const incorrectArray = incorrectData[item] as [number, number | ""];
          handleReviewCompleted(item, incorrectArray);
          delete incorrectData[item];
        }
      }
      return originalAjax(data);
    } else if (data.url === "/json/lesson/completed" && data.type === "PUT") {
      //eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sessionData = data.data as any;
      for (const item of sessionData.keys.filter(
        (id: number | string) => typeof id === "string" && id.startsWith("c")
      )) {
        handleLessonCompleted(item);
      }

      sessionData.keys = sessionData.keys.filter(
        (item: number | string) =>
          typeof item !== "string" || !item.startsWith("c")
      );

      return originalAjax(data);
    } else if (
      data.url === "/review/queue" &&
      data.type === "get" &&
      data.dataType === "json"
    ) {
      const originalSuccess = data.success as (
        //eslint-disable-next-line @typescript-eslint/no-explicit-any
        _data: any,
        _status: string,
        _jqXHR: JQuery.jqXHR
      ) => void;
      if (originalSuccess !== undefined) {
        data.success = async (items, status, jqXHR) => {
          const dueReviews = await database.getDueReviews();
          originalSuccess(items.concat(dueReviews), status, jqXHR);
        };
      }

      return originalAjax(data);
    } else if (
      data.url === "/lesson/queue" &&
      data.type === "get" &&
      data.dataType === "json"
    ) {
      (async () => {
        const originalSuccess = data.success as (
          //eslint-disable-next-line @typescript-eslint/no-explicit-any
          _data: any,
          _status: string,
          _jqXHR: JQuery.jqXHR
        ) => void;
        data.success = undefined;

        const items = await originalAjax(data);

        const additionalQueue = await database.getDueLessons();
        const additionalRadicals = 0;
        const additionalKanji = additionalQueue.filter(
          (item) => "kan" in item
        ).length;
        const additionalVocab = additionalQueue.filter(
          (item) => "voc" in item
        ).length;
        items.count.rad += additionalRadicals;
        items.count.kan += additionalKanji;
        items.count.voc += additionalVocab;

        items.queue = items.queue.concat(additionalQueue);

        originalSuccess(items, status, originalAjax({}));

        console.log("Hello");
      })();

      return originalAjax({});
    } else if (
      data.url?.startsWith("/json/") &&
      data.type === "get" &&
      data.dataType === "json"
    ) {
      (async () => {
        const result = await database.fromJSONEndpoint(data.url as string);
        if (result) {
          const success = data.success as (
            //eslint-disable-next-line @typescript-eslint/no-explicit-any
            _data: any,
            _status?: string,
            _jqXHR?: JQuery.jqXHR
          ) => void;
          success(result);
          return originalAjax({});
        }
      })();
    }

    return originalAjax(data);
  }
})();
