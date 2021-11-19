import { JishoAPI } from "../apis/jisho";
import { KanjiAPI, KanjiAPIResponse } from "../apis/kanjiapi";
import { VocabData } from "../storage/data/vocab";
import { KanjiUtils } from "../utils/kanjiUtils";
import { StringUtils } from "../utils/stringUtils";
import { ItemList } from "./itemList";
import { AddFormData, UIHandler } from "./uiHandler";

export class AddVocabHandler extends UIHandler {
  private lastKanji: string[] = [];

  hook(root: HTMLFormElement) {
    super.hook(root);

    let kanjiInput = root.querySelector("#data-slug") as HTMLInputElement;

    kanjiInput.addEventListener("input", (_) => this.handleInput(kanjiInput));
  }

  protected createItem(formData: AddFormData): VocabData {
    return new VocabData(formData);
  }

  private async handleInput(kanjiInput: HTMLInputElement) {
    let value = kanjiInput.value;

    this.fillKanjiComposition(value);

    const jishoResult = (await JishoAPI.fetchSearch(value)).data.filter(
      (elem) => elem.slug === value
    )[0];

    if (jishoResult === undefined) {
      return;
    }

    let meaningItemList = this.itemLists[0] as ItemList;
    meaningItemList.clearElements();

    let meanings = jishoResult.senses
      .filter(
        (sense) => !sense.parts_of_speech.includes("Wikipedia definition")
      )
      .flatMap((sense) => sense.english_definitions)
      .map(StringUtils.uppercaseFirst)
      .filter((value, index, array) => array.indexOf(value) === index);
    meanings.forEach((meaning) => meaningItemList.addElem({ en: meaning }));

    let readingItemList = this.itemLists[1] as ItemList;
    readingItemList.clearElements();

    let readings = jishoResult.japanese
      .map((elem) => elem.reading)
      .filter((value, index, array) => array.indexOf(value) === index);
    readings.forEach((reading) => readingItemList.addElem({ kana: reading }));

    let posItemList = this.itemLists[2] as ItemList;
    posItemList.clearElements();

    let partsOfSpeech = jishoResult.senses
      .flatMap((sense) => sense.parts_of_speech)
      .filter((pos) => pos !== "Wikipedia definition")
      .filter((value, index, array) => array.indexOf(value) === index);
    partsOfSpeech.forEach((pos) =>
      posItemList.addElem({ parts_of_speech: pos })
    );
  }

  private async fillKanjiComposition(input: string): Promise<void> {
    let kanji = [...input].filter(KanjiUtils.isKanji);

    let common = 0;
    let added: string[] = [];
    let isCommon = true;
    for (let i = 0; i < kanji.length; i++) {
      if (kanji[i] != this.lastKanji[i]) {
        isCommon = false;
      }

      if (isCommon) {
        common++;
      } else {
        added.push(kanji[i] as string);
      }
    }

    for (let i = 0; i < this.lastKanji.length - common; i++) {
      this.dropLastKanji();
    }

    let kanjiData = await Promise.all(
      added.map(async (newKanji) => await KanjiAPI.fetchKanji(newKanji))
    );
    kanjiData.map((newKanji) => this.addKanji(newKanji));

    this.lastKanji = kanji;
  }

  private dropLastKanji(): void {
    (this.itemLists[4] as ItemList).dropElem();
  }

  private async addKanji(kanjiData: KanjiAPIResponse): Promise<void> {
    let kanjiItemList = this.itemLists[4] as ItemList;

    kanjiItemList.addElem({
      kan: kanjiData.kanji,
      ja: kanjiData.on_readings.map(KanjiUtils.katakanaToHiragana).join(", "),
      en: kanjiData.meanings.map(StringUtils.uppercaseFirst).join(", "),
    });
  }
}
