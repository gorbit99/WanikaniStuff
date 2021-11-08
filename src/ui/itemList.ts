export class ItemList {
  readonly itemContainer: HTMLElement;
  readonly template: HTMLTemplateElement;
  readonly isReadonly: boolean;
  readonly isOptional: boolean;

  readonly valueNames: string[];

  constructor(elem: HTMLElement) {
    this.template = elem.querySelector(".item-template") as HTMLTemplateElement;

    this.valueNames = [...this.template.querySelectorAll("[name]")].map(
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
      if (this.isReadonly) {
        inputElem.readOnly = true;
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

  public getValues(): Record<string, string[]> {
    return this.valueNames.reduce((record: Record<string, string[]>, name) => {
      record[name] = [
        ...this.itemContainer.querySelectorAll(`[name=${name}]`),
      ].map((elem) => (elem as HTMLInputElement).value);
      return record;
    }, {});
  }
}
