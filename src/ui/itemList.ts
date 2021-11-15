export class ItemList {
  private readonly root: HTMLElement;
  private readonly itemContainer: HTMLElement;
  private readonly template: HTMLTemplateElement;
  private readonly isReadonly: boolean;
  private readonly isOptional: boolean;

  private readonly valueNames: string[];

  constructor(elem: HTMLElement) {
    this.root = elem;
    this.template = elem.querySelector(".item-template") as HTMLTemplateElement;

    this.valueNames = [...this.template.content.querySelectorAll("[name]")].map(
      (elem) => (elem as HTMLInputElement).name
    );

    this.isOptional = elem.dataset["optional"] !== undefined;
    this.isReadonly = elem.dataset["readonly"] !== undefined;

    this.itemContainer = document.createElement("div") as HTMLElement;
    this.itemContainer.classList.add("item-container");
    elem.append(this.itemContainer);

    if (!this.isOptional && !this.isReadonly) {
      this.addElem({});
    }

    if (!this.isReadonly) {
      const addButton = document.createElement("div");
      addButton.classList.add("itemlist-add-button");
      elem.append(addButton);
      addButton.addEventListener("click", () => this.addElem({}));
    }
  }

  public addElem(data: Record<string, string>): void {
    const elem = this.template.content.cloneNode(true) as HTMLElement;
    [...elem.querySelectorAll("[name]")].forEach((field) => {
      const inputElem = field as HTMLInputElement;
      const name = inputElem.name;
      if (data[name]) {
        inputElem.value = data[name] as string;
      }
      inputElem.required = true;
    });

    const container = document.createElement("div");
    container.classList.add("itemlist-item-container");
    container.append(elem);

    if (!this.isReadonly) {
      const removeButton = document.createElement("div");
      removeButton.classList.add("itemlist-remove-button");
      removeButton.addEventListener("click", () => container.remove());
      container.append(removeButton);
    }

    this.itemContainer.append(container);
  }

  public getValues(): Record<string, string>[] {
    const values = this.valueNames.map((name) =>
      [...this.itemContainer.querySelectorAll(`[name=${name}]`)].map(
        (elem) => (elem as HTMLInputElement).value
      )
    );

    const objects = (values[0] as string[]).map((_, i) =>
      Object.fromEntries(
        values.map((_, j) => [this.valueNames[j], values[j]?.[i]])
      )
    );

    return objects;
  }

  public getValuesAsLists(): Record<string, string[]> {
    return this.valueNames.reduce((record: Record<string, string[]>, name) => {
      record[name] = [
        ...this.itemContainer.querySelectorAll(`[name=${name}]`),
      ].map((elem) => (elem as HTMLInputElement).value);
      return record;
    }, {});
  }

  public getGroupName(): string | null {
    return this.root.dataset["groupname"] ?? null;
  }
}
