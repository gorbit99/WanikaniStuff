import { Database, DataItem } from "./database";

import { handleLessonCompleted, handleReviewCompleted } from "./sessions";
import { UI } from "./ui";

export const database = new Database();

(function () {
  "use strict";

  if ($ === undefined || $.jStorage === undefined) {
    return;
  }

  UI.setup();

  database.load();
  database.migrate();

  const originalAjax = $.ajax;
  $.ajax = ajaxOverride;

  function ajaxOverride(data: JQuery.AjaxSettings): JQuery.jqXHR;
  function ajaxOverride(
    url: string,
    data: JQuery.AjaxSettings | undefined
  ): JQuery.jqXHR;
  function ajaxOverride(
    a: string | JQuery.AjaxSettings,
    b?: JQuery.AjaxSettings | undefined
  ): JQuery.jqXHR {
    if (typeof a === "string") {
      return originalAjax(a, b);
    }

    let data = a;

    if (
      data.url === "/json/progress" &&
      data.type === "PUT" &&
      data.dataType === "json"
    ) {
      let incorrectData = data.data as any;
      for (const item in incorrectData) {
        if (item.startsWith("c")) {
          let incorrectArray = incorrectData[item] as [number, number | ""];
          handleReviewCompleted(item, incorrectArray);
          delete incorrectData[item];
        }
      }
      return originalAjax(data);
    } else if (data.url === "/json/lesson/completed" && data.type === "PUT") {
      let sessionData = data.data as any;
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
        data: any,
        status: string,
        jqXHR: JQuery.jqXHR
      ) => void;
      if (originalSuccess !== undefined) {
        data.success = (items, status, jqXHR) => {
          items = items.concat(database.getDueReviews());
          originalSuccess(
            items.map((item: DataItem) => item.reviewData),
            status,
            jqXHR
          );
        };
      }

      return originalAjax(data);
    } else if (
      data.url === "/lesson/queue" &&
      data.type === "get" &&
      data.dataType === "json"
    ) {
      const originalSuccess = data.success as (
        data: any,
        status: string,
        jqXHR: JQuery.jqXHR
      ) => void;
      data.success = (items, status, jqXHR) => {
        const additionalQueue = database.getDueLessons();
        const additionalRadicals = 0;
        const additionalKanji = additionalQueue.filter(
          (item) => "kan" in item.reviewData
        ).length;
        const additionalVocab = additionalQueue.filter(
          (item) => "voc" in item.reviewData
        ).length;
        items.count.rad += additionalRadicals;
        items.count.kan += additionalKanji;
        items.count.voc += additionalVocab;

        items.queue = items.queue.concat(
          additionalQueue.map((item) => item.lessonData)
        );

        originalSuccess(items, status, jqXHR);
      };

      return originalAjax(data);
    } else if (
      data.url?.startsWith("/json/") &&
      data.type === "get" &&
      data.dataType === "json"
    ) {
      const result = database.fromJSONEndpoint(data.url);
      if (result) {
        let success = data.success as (
          data: any,
          status?: string,
          jqXHR?: JQuery.jqXHR
        ) => void;
        success(result);
        return originalAjax({});
      }
    }

    return originalAjax(data);
  }
})();
