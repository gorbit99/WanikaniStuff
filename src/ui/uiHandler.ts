import { ItemData } from "../storage/data/common";
import { Database } from "../storage/database";
import { ItemList } from "./itemList";

export type AddFormData = Record<
  string,
  string | string[] | Record<string, string>[]
>;

export abstract class UIHandler {
  protected itemLists: ItemList[] = [];
  protected root: HTMLFormElement | undefined;
  private abortController: AbortController | undefined;

  public hook(root: HTMLFormElement): void {
    this.root = root;

    [...root.querySelectorAll("input")].forEach(
      (elem) => ((elem as HTMLInputElement).required = true)
    );
    [...root.querySelectorAll("textarea")].forEach(
      (elem) => ((elem as HTMLTextAreaElement).required = true)
    );

    [...root.querySelectorAll(".item-list")].forEach((elem) =>
      this.itemLists.push(new ItemList(elem as HTMLElement))
    );

    this.abortController = new AbortController();

    root.addEventListener(
      "submit",
      (event) => {
        event.preventDefault();

        const formData = this.getFormValues();
        const result = this.createItem(formData);
        this.submitItem(result);
        this.clearForm();
      },
      { signal: this.abortController.signal }
    );
  }

  private async submitItem(item: ItemData): Promise<void> {
    let db = await Database.getInstance();
    db.addCard(item);
  }

  private clearForm() {
    this.root?.reset();

    this.itemLists.forEach((list) => list.reset());
  }

  public unhook(): void {
    this.abortController?.abort();
  }

  protected getFormValues(): AddFormData {
    let data = Object.fromEntries(
      [...(this.root as HTMLElement).querySelectorAll(":scope > [name]")].map(
        (elem) => {
          let input = elem as HTMLInputElement;
          return [input.name, input.value];
        }
      )
    );

    let stringData: AddFormData = {};
    Object.keys(data).forEach((key) => {
      stringData[key] = data[key] as string;
    });

    for (let itemList of this.itemLists) {
      let groupName = itemList.getGroupName();

      if (groupName) {
        let values = itemList.getValues();
        stringData[groupName] = values;
      } else {
        let values = itemList.getValuesAsLists();
        for (let key in values) {
          stringData[key] = values[key] as string[];
        }
      }
    }

    return stringData;
  }

  protected abstract createItem(formData: AddFormData): ItemData;
}
