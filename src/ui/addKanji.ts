import { KanjiData } from "../storage/data/kanji";
import { AddFormData, UIHandler } from "./uiHandler";

export class AddKanjiHandler extends UIHandler {
  protected createItem(formData: AddFormData): KanjiData {
    return new KanjiData(formData);
  }
}
