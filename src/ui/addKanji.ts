import { KanjiAPI } from "../apis/kanjiapi";
import { KanjiData } from "../storage/data/kanji";
import { KanjiUtils } from "../utils/kanjiUtils";
import { StringUtils } from "../utils/stringUtils";
import { ItemList } from "./itemList";
import { AddFormData, UIHandler } from "./uiHandler";

export class AddKanjiHandler extends UIHandler {
  public hook(root: HTMLFormElement): void {
    super.hook(root);

    const slugInput = root.querySelector("#data-slug") as HTMLInputElement;
    slugInput.addEventListener("input", () => {
      this.handleInput(slugInput.value);
    });
  }

  protected createItem(formData: AddFormData): KanjiData {
    return new KanjiData(formData);
  }

  private async handleInput(input: string): Promise<void> {
    if (!KanjiUtils.isKanji(input)) {
      return;
    }

    const kanjiapiData = await KanjiAPI.fetchKanji(input);

    let meaningList = this.itemLists[0] as ItemList;

    meaningList.clearElements();
    kanjiapiData.meanings
      .map(StringUtils.uppercaseFirst)
      .forEach((meaning) => meaningList.addElem({ en: meaning }));

    let onyomiList = this.itemLists[1] as ItemList;

    onyomiList.clearElements();
    kanjiapiData.on_readings
      .map(KanjiUtils.katakanaToHiragana)
      .forEach((on) => onyomiList.addElem({ on: on }));

    let kunyomiList = this.itemLists[2] as ItemList;

    kunyomiList.clearElements();
    kanjiapiData.kun_readings.forEach((kun) =>
      kunyomiList.addElem({ kun: kun })
    );

    let nanoriList = this.itemLists[3] as ItemList;

    nanoriList.clearElements();
    kanjiapiData.name_readings.forEach((nanori) =>
      nanoriList.addElem({ nanori: nanori })
    );
  }
}
