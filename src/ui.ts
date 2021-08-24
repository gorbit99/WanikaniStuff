import addCardsPanelHtml from "./addCardsPanel.html";
import addVocabHtml from "./addVocab.html";
import addKanjiHtml from "./addKanji.html";
import importVocabHtml from "./importVocab.html";
import importKanjiHtml from "./importKanji.html";

import stylesheet from "./stylesheet.css";
import { Kanji } from "./kanji";
import { Vocab } from "./vocab";
import { KanjiApi } from "./kanjiapi";
import { katakanaToHiragana, titleCase } from "./utils";
import { Jisho } from "./jisho";
import { ArrayInput } from "./arrayInput";

export class UI {
  static outerDiv: HTMLDivElement;
  static addCardsPanel: HTMLDivElement;
  static addTypeForm: HTMLFormElement;
  static additionForm: HTMLFormElement;

  public static setup(): void {
    UI.outerDiv = document.body.appendChild(document.createElement("div"));
    UI.outerDiv.classList.add("addCardsPanelOuter");
    UI.outerDiv.innerHTML = addCardsPanelHtml;

    const style = document.head.appendChild(document.createElement("style"));
    style.innerHTML = stylesheet;

    UI.addCardsPanel = UI.outerDiv.querySelector(
      ".addCardsPanel"
    ) as HTMLDivElement;
    UI.addTypeForm = UI.outerDiv.querySelector(
      ".addTypeForm"
    ) as HTMLFormElement;
    UI.additionForm = UI.outerDiv.querySelector(
      ".additionForm"
    ) as HTMLFormElement;

    UI.addTypeForm.onchange = UI.addTypeChange;

    UI.displayOptionsAddVocab();

    UI.toggleAddDisplay();

    window.addEventListener("DOMContentLoaded", () => {
      const sitemap = document.querySelector("#sitemap");
      if (sitemap) {
        const firstChild = sitemap.firstChild;

        const listItem = sitemap.insertBefore(
          document.createElement("li"),
          firstChild
        );
        listItem.classList.add("sitemap__section");

        const listButton = listItem.appendChild(
          document.createElement("button")
        );
        listButton.classList.add("sitemap__section-header");

        listButton.innerHTML = `
                <span lang="ja">???</span>
                <span lang="en" class="font-sans">Add Custom</span>
            `;
        listButton.addEventListener("click", UI.toggleAddDisplay);
      }

      UI.changeReviewElementCount();
    });
  }

  public static toggleAddDisplay(): void {
    const outerDiv = document.querySelector(
      ".addCardsPanelOuter"
    ) as HTMLDivElement;
    const display = outerDiv.style["display"];
    outerDiv.style["display"] = display === "none" ? "flex" : "none";
  }

  private static addTypeChange() {
    const form = document.querySelector(".addTypeForm") as HTMLFormElement;

    const formData = new FormData(form);

    const addType = formData.get("addType");
    const itemType = formData.get("itemType");

    UI.removeAddDisplay();

    if (addType === "add") {
      if (itemType === "vocab") {
        UI.displayOptionsAddVocab();
      } else {
        UI.displayOptionsAddKanji();
      }
    } else {
      if (itemType === "vocab") {
        UI.displayOptionsImportVocab();
      } else {
        UI.displayOptionsImportKanji();
      }
    }
  }

  private static removeAddDisplay() {
    const chooseDeck = document.querySelector("#chooseDeck");
    chooseDeck && chooseDeck.remove();

    const chooseDeckLabel = document.querySelector("#chooseDeckLabel");
    chooseDeckLabel && chooseDeckLabel.remove();

    UI.additionForm.innerHTML = "";
  }

  private static displayOptionsAddVocab() {
    UI.additionForm.innerHTML = addVocabHtml;

    UI.additionForm.onsubmit = (submitEvent) => {
      submitEvent.preventDefault();

      const form = submitEvent.target as HTMLFormElement;
      if (Vocab.addVocab(form)) {
        UI.addTypeChange();
      }
    };

    const vocab = UI.additionForm.querySelector("#vocab") as HTMLInputElement;
    vocab.addEventListener("keyup", (keyboardEvent) => {
      if (keyboardEvent.code === "Enter") {
        UI.onVocabChange(keyboardEvent);
      }
    });

    ArrayInput.setupElementsOn(UI.additionForm);
  }

  private static onVocabChange(changeEvent: Event) {
    const kanji = UI.additionForm.querySelector(
      "#kanjiComposition"
    ) as HTMLInputElement;

    console.log(changeEvent);
    const vocab = changeEvent.target as HTMLInputElement;

    const vocabWord = vocab.value;

    (async () => {
      const kanjiCompositionArrayInput = new ArrayInput(kanji);

      kanjiCompositionArrayInput.clear();

      const regex = /[\u4e00-\u9faf]/g;

      vocabWord
        .match(regex)
        ?.filter((c, index, self) => self.indexOf(c) === index)
        ?.forEach(async (c) => {
          const newEntry = kanjiCompositionArrayInput.addField();

          const kanjiCharacter = newEntry.querySelector(
            ".kanjiCompositionKanji"
          ) as HTMLInputElement;
          kanjiCharacter.value = c;

          const kanjiData = await KanjiApi.getKanji(c);

          const kanjiMeaning = newEntry.querySelector(
            ".kanjiCompositionMeaning"
          ) as HTMLInputElement;
          kanjiMeaning.value = titleCase(kanjiData.meanings[0] ?? "");

          const kanjiReading = newEntry.querySelector(
            ".kanjiCompositionReading"
          ) as HTMLInputElement;
          kanjiReading.value = katakanaToHiragana(
            kanjiData.on_readings[0] ?? ""
          );
        });
    })();

    (async () => {
      const jishoResult = await Jisho.queryTerm(vocabWord);

      if (jishoResult.meta.status !== 200) {
        return;
      }

      const result = jishoResult.data[0];
      if (result === undefined) {
        return;
      }

      const filteredSenses = result.senses.filter(
        (sense) => !sense.parts_of_speech.includes("Wikipedia definition")
      );

      const meanings = filteredSenses
        .map((sense) => sense.english_definitions[0] ?? "")
        .map((meaning) => titleCase(meaning));

      const meaningElement = UI.additionForm.querySelector(
        "#meaning"
      ) as HTMLDivElement;
      const meaningArrayInput = new ArrayInput(meaningElement);

      meaningArrayInput.fill(meanings.length, (container, i) => {
        const inputField = container.querySelector(
          ".arrayInputInput"
        ) as HTMLInputElement;
        inputField.value = meanings[i] ?? "";
      });

      const partsOfSpeech = filteredSenses
        .map((sense) => sense.parts_of_speech)
        .flat()
        .filter((val, i, self) => self.indexOf(val) === i);

      const partsOfSpeechElement = UI.additionForm.querySelector(
        "#partsOfSpeech"
      ) as HTMLDivElement;
      const partsOfSpeechArrayInput = new ArrayInput(partsOfSpeechElement);

      partsOfSpeechArrayInput.fill(partsOfSpeech.length, (container, i) => {
        const inputField = container.querySelector(
          ".arrayInputInput"
        ) as HTMLInputElement;
        inputField.value = partsOfSpeech[i] as string;
      });

      const readings = result.japanese
        .filter((japanese) => japanese.word === vocabWord)
        .map((japanese) => japanese.reading);

      if (readings.length > 0) {
        const readingElement = UI.additionForm.querySelector(
          "#reading"
        ) as HTMLDivElement;
        const readingArrayInput = new ArrayInput(readingElement);

        readingArrayInput.fill(readings.length, (container, i) => {
          const inputField = container.querySelector(
            ".arrayInputInput"
          ) as HTMLInputElement;
          inputField.value = readings[i] as string;
        });
      }
    })();
  }

  private static displayOptionsAddKanji() {
    UI.additionForm.innerHTML = addKanjiHtml;
    UI.additionForm.onsubmit = (submitEvent) => {
      submitEvent.preventDefault();

      const target = submitEvent.target as HTMLFormElement;
      if (Kanji.addKanji(target)) {
        UI.addTypeChange();
      }
    };

    ArrayInput.setupElementsOn(UI.additionForm);
  }

  private static displayOptionsImportVocab() {
    const buttonLabel = UI.outerDiv.insertBefore(
      document.createElement("label"),
      UI.additionForm
    ) as HTMLLabelElement;
    buttonLabel.htmlFor = "chooseDeck";
    buttonLabel.textContent = "Choose deck";
    buttonLabel.id = "chooseDeckLabel";

    const buttonInput = UI.outerDiv.insertBefore(
      document.createElement("input"),
      UI.additionForm
    );
    buttonInput.type = "file";
    buttonInput.accept = "text/plain";
    buttonInput.id = "chooseDeck";
    buttonInput.onchange = UI.importVocabFileChange;
  }

  private static importVocabFileChange(changeEvent: Event) {
    const target = changeEvent.target as HTMLInputElement;

    if (target.files === null) {
      return;
    }

    const file = target.files[0];

    if (file === undefined) {
      return;
    }

    const fileReader = new FileReader();

    fileReader.onload = (event) => {
      const target = event.target as FileReader;
      const result = target.result as string;

      const firstLine = result.split("\n")[0] ?? "";

      const possibleOptions = firstLine.split("\t");

      const selectOptions = possibleOptions
        .map((elem, index) => {
          return `<option value="${index}">${elem}</option>`;
        })
        .join("\n");

      UI.additionForm.innerHTML = importVocabHtml;
      UI.additionForm.onsubmit = (submitEvent) => {
        submitEvent.preventDefault();

        const form = submitEvent.target as HTMLFormElement;

        if (Vocab.importVocab(form)) {
          UI.addTypeChange();
        }
      };
      [...UI.additionForm.querySelectorAll("[to-fill='true']")].map(
        (item) => (item.innerHTML += selectOptions)
      );
    };

    fileReader.readAsText(file);
  }

  private static displayOptionsImportKanji() {
    const buttonLabel = UI.outerDiv.insertBefore(
      document.createElement("label"),
      UI.additionForm
    );
    buttonLabel.htmlFor = "chooseDeck";
    buttonLabel.textContent = "Choose deck";
    buttonLabel.id = "chooseDeckLabel";

    const buttonInput = UI.outerDiv.insertBefore(
      document.createElement("input"),
      UI.additionForm
    );
    buttonInput.type = "file";
    buttonInput.accept = "text/plain";
    buttonInput.id = "chooseDeck";
    buttonInput.onchange = UI.importKanjiFileChange;
  }

  private static importKanjiFileChange(changeEvent: Event) {
    const target = changeEvent.target as HTMLInputElement;

    const file = target.files?.[0];

    const fileReader = new FileReader();

    fileReader.onload = (event) => {
      const target = event.target as FileReader;

      const result = target.result as string;

      const firstLine = result.split("\n")[0] ?? "";

      const possibleOptions = firstLine.split("\t");

      const selectOptions = possibleOptions
        .map((elem, index) => {
          return `<option value="${index}">${elem}</option>`;
        })
        .join("\n");

      UI.additionForm.innerHTML = importKanjiHtml;
      UI.additionForm.onsubmit = (submitEvent) => {
        submitEvent.preventDefault();

        const form = submitEvent.target as HTMLFormElement;

        if (Kanji.importKanji(form)) {
          UI.addTypeChange();
        }
      };

      [...UI.additionForm.querySelectorAll("[to-fill='true']")].map(
        (item) => (item.innerHTML += selectOptions)
      );
    };

    if (file === undefined) {
      return;
    }

    fileReader.readAsText(file);
  }

  public static changeReviewElementCount(): void {
    const reviewButton = document.querySelector(
      ".lessons-and-reviews__reviews-button"
    ) as HTMLButtonElement;
    if (reviewButton) {
      $.getJSON("/review/queue", (data) => {
        const count = data.length;

        UI.reviewCountToButtonClass(count, reviewButton);

        const numberSpan = document.querySelector(
          ".lessons-and-reviews__reviews-button > span"
        ) as HTMLSpanElement;
        numberSpan.textContent = count;
      });

      const lessonButton = document.querySelector(
        ".lessons-and-reviews__lessons-button"
      ) as HTMLButtonElement;
      $.getJSON("/lesson/queue", (data) => {
        const count = data.queue.length;

        UI.lessonCountToButtonClass(count, lessonButton);

        const numberSpan = document.querySelector(
          ".lessons-and-reviews__lessons-button > span"
        ) as HTMLSpanElement;
        numberSpan.textContent = count;
      });
    }

    const startReviewQueueCount = document.querySelector("#review-queue-count");
    if (startReviewQueueCount) {
      $.getJSON("/review/queue", (data) => {
        const count = data.length;
        const startReviewButton = document.querySelector(
          "#start-session > a"
        ) as HTMLButtonElement;
        if (count !== 0) {
          startReviewButton.classList.remove("disabled");
          startReviewButton.replaceWith(startReviewButton.cloneNode(true));
        }

        startReviewQueueCount.textContent = count;
      });
    }

    const startLessonQueueCount = document.querySelector("#lesson-queue-count");
    if (startLessonQueueCount) {
      $.getJSON("/lesson/queue", (data) => {
        const count = data.queue.length;
        const startLessonButton = document.querySelector(
          "#start-session > a"
        ) as HTMLButtonElement;
        if (count !== 0) {
          startLessonButton.classList.remove("disabled");
          startLessonButton.replaceWith(startLessonButton.cloneNode(true));
        }

        startLessonQueueCount.textContent = count;
      });
    }
  }

  private static reviewCountToButtonClass(count: number, node: HTMLElement) {
    const reviewStages = [0, 1, 50, 100, 250, 500, 1000];

    UI.countToButtonClass(
      count,
      node,
      "lessons-and-reviews__reviews-button--",
      reviewStages
    );
  }

  private static lessonCountToButtonClass(count: number, node: HTMLElement) {
    const lessonStages = [0, 1, 25, 50, 100, 250, 500];

    UI.countToButtonClass(
      count,
      node,
      "lessons-and-reviews__lessons-button--",
      lessonStages
    );
  }

  private static countToButtonClass(
    count: number,
    node: HTMLElement,
    base: string,
    stages: number[]
  ) {
    for (const stage of stages) {
      node.classList.remove(base + stage);
    }

    for (let i = 0, len = stages.length - 1; i < len; i++) {
      if (count < (stages[i + 1] ?? 0)) {
        node.classList.add(base + stages[i]);
        return;
      }
    }

    node.classList.add(base + stages[stages.length - 1]);
  }
}
