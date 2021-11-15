import { VocabData } from "../storage/data/vocab";
import { AddFormData, UIHandler } from "./uiHandler";

export class AddVocabHandler extends UIHandler {
  hook(root: HTMLFormElement) {
    super.hook(root);

    let kanjiInput = root.querySelector("#data-slug") as HTMLInputElement;

    kanjiInput.addEventListener("input", (_) => this.handleInput(kanjiInput));
  }

  protected createItem(formData: AddFormData): VocabData {
    return new VocabData(formData);
  }

  private handleInput(kanjiInput: HTMLInputElement) {
    let value = kanjiInput.value;
    console.log(value);
  }
}
