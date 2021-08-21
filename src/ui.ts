import addCardsPanelHtml from './addCardsPanel.html';
import addVocabHtml from './addVocab.html';
import addKanjiHtml from './addKanji.html';
import importVocabHtml from './importVocab.html';
import importKanjiHtml from './importKanji.html';

import stylesheet from './stylesheet.css';
import { Kanji } from './kanji';
import { Vocab } from './vocab';
import { KanjiApi } from './kanjiapi';
import { katakanaToHiragana, titleCase } from './utils';
import { Jisho } from './jisho';

export class UI {
  static outerDiv: HTMLDivElement;
  static addCardsPanel: HTMLDivElement;
  static addTypeForm: HTMLFormElement;
  static additionForm: HTMLFormElement;

  public static addArrayInputs(element: HTMLElement): void {
    const arrayInputs = element.querySelectorAll('.arrayInput');

    for (const arrayInput of arrayInputs) {
      const name = arrayInput.getAttribute('name') + '[]';

      const required = arrayInput.getAttribute('required');

      const template = arrayInput.querySelector(
        '.arrayInputTemplate'
      ) as HTMLTemplateElement;
      const inputFields = template.content.querySelectorAll('.arrayInputInput');
      inputFields.forEach((elem) => {
        const inputElem = elem as HTMLInputElement;
        inputElem.name = name;
        inputElem.required = true;
      });

      const addButton = document.createElement('button');
      arrayInput.appendChild(addButton);
      addButton.classList.add('arrayInputAdd');
      addButton.textContent = '+';

      const removeAction = (event: Event) => {
        const target = event.target as HTMLButtonElement;
        if (target.parentNode === null) {
          console.error('Somehow a button was attached to nothing?');
          return;
        }
        const parentNode = target.parentNode as HTMLElement;
        parentNode.remove();

        if (required) {
          const buttons = arrayInput.querySelectorAll(
            '.arrayInputRemove'
          ) as NodeListOf<HTMLButtonElement>;
          if (buttons[0] !== undefined) {
            buttons[0].disabled = true;
          }
        }
      };

      if (required) {
        const newEntry = template.content.cloneNode(true) as DocumentFragment;

        const button = newEntry.querySelector(
          '.arrayInputRemove'
        ) as HTMLButtonElement;
        button.onclick = removeAction;
        button.disabled = true;

        arrayInput.insertBefore(newEntry, addButton);
      }

      if (required) {
        const removeButton = arrayInput.querySelector(
          '.arrayInputRemove'
        ) as HTMLButtonElement;
        removeButton.onclick = removeAction;
      }

      addButton.onclick = () => {
        const newEntry = template.content.cloneNode(true) as DocumentFragment;

        if (required) {
          arrayInput.querySelectorAll('.arrayInputRemove').forEach((elem) => {
            const buttonElem = elem as HTMLButtonElement;
            buttonElem.disabled = false;
          });
        }

        const button = newEntry.querySelector(
          '.arrayInputRemove'
        ) as HTMLButtonElement;
        button.onclick = removeAction;

        arrayInput.insertBefore(newEntry, addButton);
      };
    }
  }

  public static getArrayInputValues(
    form: HTMLFormElement,
    name: string
  ): string[] {
    const result = form.elements.namedItem(`${name}[]`);

    if (result === undefined || result === null) {
      return [];
    }

    if (result instanceof Element) {
      const inputElem = result as HTMLInputElement;
      return [inputElem.value];
    }

    return [...result].map((elem) => {
      const inputElem = elem as HTMLInputElement;
      return inputElem.value;
    });
  }

  public static setup(): void {
    UI.outerDiv = document.body.appendChild(document.createElement('div'));
    UI.outerDiv.classList.add('addCardsPanelOuter');
    UI.outerDiv.innerHTML = addCardsPanelHtml;

    const style = document.head.appendChild(document.createElement('style'));
    style.innerHTML = stylesheet;

    UI.addCardsPanel = UI.outerDiv.querySelector(
      '.addCardsPanel'
    ) as HTMLDivElement;
    UI.addTypeForm = UI.outerDiv.querySelector(
      '.addTypeForm'
    ) as HTMLFormElement;
    UI.additionForm = UI.outerDiv.querySelector(
      '.additionForm'
    ) as HTMLFormElement;

    UI.addTypeForm.onchange = UI.addTypeChange;

    UI.displayOptionsAddVocab();

    UI.toggleAddDisplay();

    window.addEventListener('load', () => {
      const sitemap = document.querySelector('#sitemap');
      if (sitemap) {
        const firstChild = sitemap.firstChild;

        const listItem = sitemap.insertBefore(
          document.createElement('li'),
          firstChild
        );
        listItem.classList.add('sitemap__section');

        const listButton = listItem.appendChild(
          document.createElement('button')
        );
        listButton.classList.add('sitemap__section-header');

        listButton.innerHTML = `
                <span lang="ja">???</span>
                <span lang="en" class="font-sans">Add Custom</span>
            `;
        listButton.addEventListener('click', UI.toggleAddDisplay);
      }

      UI.changeReviewElementCount();
    });
  }

  public static toggleAddDisplay(): void {
    const outerDiv = document.querySelector(
      '.addCardsPanelOuter'
    ) as HTMLDivElement;
    const display = outerDiv.style['display'];
    outerDiv.style['display'] = display === 'none' ? 'flex' : 'none';
  }

  private static addTypeChange() {
    const form = document.querySelector('.addTypeForm') as HTMLFormElement;

    const formData = new FormData(form);

    const addType = formData.get('addType');
    const itemType = formData.get('itemType');

    UI.removeAddDisplay();

    if (addType === 'add') {
      if (itemType === 'vocab') {
        UI.displayOptionsAddVocab();
      } else {
        UI.displayOptionsAddKanji();
      }
    } else {
      if (itemType === 'vocab') {
        UI.displayOptionsImportVocab();
      } else {
        UI.displayOptionsImportKanji();
      }
    }
  }

  private static removeAddDisplay() {
    const chooseDeck = document.querySelector('#chooseDeck');
    chooseDeck && chooseDeck.remove();

    const chooseDeckLabel = document.querySelector('#chooseDeckLabel');
    chooseDeckLabel && chooseDeckLabel.remove();

    UI.additionForm.innerHTML = '';
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

    const vocab = UI.additionForm.querySelector('#vocab') as HTMLInputElement;
    vocab.addEventListener('input', UI.onVocabInput);

    UI.addArrayInputs(UI.additionForm);
  }

  private static onVocabInput(inputEvent: Event) {
    const kanji = UI.additionForm.querySelector(
      '.kanjiComposition'
    ) as HTMLInputElement;

    kanji
      .querySelectorAll('.kanjiCompositionElement')
      .forEach((elem) => elem.remove());

    const template = kanji.querySelector(
      '.kanjiCompositionTemplate'
    ) as HTMLTemplateElement;

    const vocab = inputEvent.target as HTMLInputElement;

    const vocabWord = vocab.value;

    const regex = /[\u4e00-\u9faf]/g;

    vocabWord
      .match(regex)
      ?.filter((c, index, self) => self.indexOf(c) === index)
      ?.forEach(async (c) => {
        let newEntry = template.content.cloneNode(true) as DocumentFragment;
        newEntry = kanji.appendChild(newEntry);

        const kanjiInput = newEntry.querySelector(
          '.kanjiCompositionKanji'
        ) as HTMLInputElement;
        kanjiInput.value = c;

        const kanjiData = await KanjiApi.getKanji(c);

        const kanjiMeaning = newEntry.querySelector(
          '.kanjiCompositionMeaning'
        ) as HTMLInputElement;
        kanjiMeaning.value = titleCase(kanjiData.meanings[0] ?? '');

        const kanjiReading = newEntry.querySelector(
          '.kanjiCompositionReading'
        ) as HTMLInputElement;
        kanjiReading.value = katakanaToHiragana(kanjiData.on_readings[0] ?? '');
      });

    (async () => {
      const jishoResult = await Jisho.queryTerm(vocabWord);

      const result = jishoResult[0]?.data[0];
      if (result === undefined) {
        return;
      }

      result.
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

    UI.addArrayInputs(UI.additionForm);
  }

  private static displayOptionsImportVocab() {
    const buttonLabel = UI.outerDiv.insertBefore(
      document.createElement('label'),
      UI.additionForm
    ) as HTMLLabelElement;
    buttonLabel.htmlFor = 'chooseDeck';
    buttonLabel.textContent = 'Choose deck';
    buttonLabel.id = 'chooseDeckLabel';

    const buttonInput = UI.outerDiv.insertBefore(
      document.createElement('input'),
      UI.additionForm
    );
    buttonInput.type = 'file';
    buttonInput.accept = 'text/plain';
    buttonInput.id = 'chooseDeck';
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

      const firstLine = result.split('\n')[0] ?? '';

      const possibleOptions = firstLine.split('\t');

      const selectOptions = possibleOptions
        .map((elem, index) => {
          return `<option value="${index}">${elem}</option>`;
        })
        .join('\n');

      UI.additionForm.innerHTML = importVocabHtml;
      UI.additionForm.onsubmit = (submitEvent) => {
        submitEvent.preventDefault();

        const form = submitEvent.target as HTMLFormElement;

        if (Vocab.importVocab(form)) {
          UI.addTypeChange();
        }
      };
      [...UI.additionForm.querySelectorAll('[to-fill=\'true\']')].map(
        (item) => (item.innerHTML += selectOptions)
      );
    };

    fileReader.readAsText(file);
  }

  private static displayOptionsImportKanji() {
    const buttonLabel = UI.outerDiv.insertBefore(
      document.createElement('label'),
      UI.additionForm
    );
    buttonLabel.htmlFor = 'chooseDeck';
    buttonLabel.textContent = 'Choose deck';
    buttonLabel.id = 'chooseDeckLabel';

    const buttonInput = UI.outerDiv.insertBefore(
      document.createElement('input'),
      UI.additionForm
    );
    buttonInput.type = 'file';
    buttonInput.accept = 'text/plain';
    buttonInput.id = 'chooseDeck';
    buttonInput.onchange = UI.importKanjiFileChange;
  }

  private static importKanjiFileChange(changeEvent: Event) {
    const target = changeEvent.target as HTMLInputElement;

    const file = target.files?.[0];

    const fileReader = new FileReader();

    fileReader.onload = (event) => {
      const target = event.target as FileReader;

      const result = target.result as string;

      const firstLine = result.split('\n')[0] ?? '';

      const possibleOptions = firstLine.split('\t');

      const selectOptions = possibleOptions
        .map((elem, index) => {
          return `<option value="${index}">${elem}</option>`;
        })
        .join('\n');

      UI.additionForm.innerHTML = importKanjiHtml;
      UI.additionForm.onsubmit = (submitEvent) => {
        submitEvent.preventDefault();

        const form = submitEvent.target as HTMLFormElement;

        if (Kanji.importKanji(form)) {
          UI.addTypeChange();
        }
      };

      [...UI.additionForm.querySelectorAll('[to-fill=\'true\']')].map(
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
      '.lessons-and-reviews__reviews-button'
    ) as HTMLButtonElement;
    if (reviewButton) {
      $.getJSON('/review/queue', (data) => {
        const count = data.length;

        UI.reviewCountToButtonClass(count, reviewButton);

        const numberSpan = document.querySelector(
          '.lessons-and-reviews__reviews-button > span'
        ) as HTMLSpanElement;
        numberSpan.textContent = count;
      });

      const lessonButton = document.querySelector(
        '.lessons-and-reviews__lessons-button'
      ) as HTMLButtonElement;
      $.getJSON('/lesson/queue', (data) => {
        const count = data.queue.length;

        UI.lessonCountToButtonClass(count, lessonButton);

        const numberSpan = document.querySelector(
          '.lessons-and-reviews__lessons-button > span'
        ) as HTMLSpanElement;
        numberSpan.textContent = count;
      });
    }

    const startReviewQueueCount = document.querySelector('#review-queue-count');
    if (startReviewQueueCount) {
      $.getJSON('/review/queue', (data) => {
        const count = data.length;
        const startReviewButton = document.querySelector(
          '#start-session > a'
        ) as HTMLButtonElement;
        if (count !== 0) {
          startReviewButton.classList.remove('disabled');
          startReviewButton.replaceWith(startReviewButton.cloneNode(true));
        }

        startReviewQueueCount.textContent = count;
      });
    }

    const startLessonQueueCount = document.querySelector('#lesson-queue-count');
    if (startLessonQueueCount) {
      $.getJSON('/lesson/queue', (data) => {
        const count = data.queue.length;
        const startLessonButton = document.querySelector(
          '#start-session > a'
        ) as HTMLButtonElement;
        if (count !== 0) {
          startLessonButton.classList.remove('disabled');
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
      'lessons-and-reviews__reviews-button--',
      reviewStages
    );
  }

  private static lessonCountToButtonClass(count: number, node: HTMLElement) {
    const lessonStages = [0, 1, 25, 50, 100, 250, 500];

    UI.countToButtonClass(
      count,
      node,
      'lessons-and-reviews__lessons-button--',
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
