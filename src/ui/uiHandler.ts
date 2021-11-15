import { ItemData } from "../storage/data/common";
import { ItemList } from "./itemList";

export type AddFormData = Record<
  string,
  string | string[] | Record<string, string>[]
>;

export abstract class UIHandler {
  protected itemLists: ItemList[] = [];
  protected root: HTMLFormElement | undefined;

  public hook(root: HTMLFormElement): void {
    this.root = root;

    [...root.querySelectorAll(".item-list")].forEach((elem) =>
      this.itemLists.push(new ItemList(elem as HTMLElement))
    );

    root.addEventListener("submit", (event) => {
      event.preventDefault();

      const formData = this.getFormValues();

      console.log(this.createItem(formData));
    });
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
