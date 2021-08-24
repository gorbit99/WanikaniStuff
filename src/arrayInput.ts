export class ArrayInput {
  private rootElement: HTMLElement;
  private required: boolean;
  private generated: boolean;
  private name: string;
  private template: HTMLTemplateElement;

  constructor(arrayInput: HTMLElement) {
    this.rootElement = arrayInput;

    this.required = arrayInput.getAttribute("required") === "true";
    this.generated = arrayInput.getAttribute("generated") === "true";
    this.name = arrayInput.getAttribute("name") + "[]";
    this.template = arrayInput.querySelector(
      ".arrayInputTemplate"
    ) as HTMLTemplateElement;
  }

  public static setupElementsOn(element: HTMLElement): void {
    element.querySelectorAll(".arrayInput").forEach((element) => {
      const arrayInput = new ArrayInput(element as HTMLElement);
      arrayInput.setup();
    });
  }

  public setup(): void {
    const inputFields =
      this.template.content.querySelectorAll(".arrayInputInput");
    inputFields.forEach((elem) => {
      const inputElem = elem as HTMLInputElement;
      inputElem.name = this.name;
      inputElem.required = true;
    });

    if (!this.generated) {
      const addButton = document.createElement("button");
      this.rootElement.appendChild(addButton);
      addButton.classList.add("arrayInputAdd");
      addButton.textContent = "+";

      addButton.onclick = () => {
        this.addField();
      };
    }

    if (this.required) {
      this.addField();
    }

    if (this.required) {
      const removeButton = this.rootElement.querySelector(
        ".arrayInputRemove"
      ) as HTMLButtonElement;
      removeButton.onclick = this.removeAction;
    }
  }

  public addField(): HTMLElement {
    const newEntry = this.template.content.cloneNode(true) as DocumentFragment;
    const arrayInputRow = newEntry.querySelector(
      ".arrayInputRow"
    ) as HTMLElement;

    if (!this.generated) {
      const addButton = this.rootElement.querySelector(".arrayInputAdd");

      this.rootElement.insertBefore(newEntry, addButton);
    } else {
      this.rootElement.appendChild(newEntry);
    }

    if (this.required) {
      this.rootElement.querySelectorAll(".arrayInputRemove").forEach((elem) => {
        const buttonElem = elem as HTMLButtonElement;
        buttonElem.disabled = false;
      });
    }

    const removeButton = arrayInputRow.querySelector(
      ".arrayInputRemove"
    ) as HTMLButtonElement;
    if (removeButton) {
      removeButton.onclick = this.removeAction;
    }

    return arrayInputRow;
  }

  private removeAction(event: Event): void {
    const target = event.target as HTMLButtonElement;
    if (target.parentNode === null) {
      console.error("Somehow a button was attached to nothing?");
      return;
    }
    const parentNode = target.parentNode as HTMLElement;
    parentNode.remove();

    if (this.required) {
      const buttons = this.rootElement.querySelectorAll(
        ".arrayInputRemove"
      ) as NodeListOf<HTMLButtonElement>;
      if (buttons[0] !== undefined) {
        buttons[0].disabled = true;
      }
    }
  }

  public getValues(): string[] {
    const result = [
      ...this.rootElement.querySelectorAll(`[name="${this.name}"]`),
    ].map((element) => (element as HTMLInputElement).value);

    return result;
  }

  public clear(): void {
    this.rootElement
      .querySelectorAll(".arrayInputRow")
      .forEach((row) => row.remove());

    if (this.required) {
      this.addField();
    }
  }

  public fill(
    count: number,
    dataFunc: (_container: HTMLElement, _index: number) => void
  ): void {
    if (count === 0) {
      this.clear();
      return;
    }
    this.rootElement
      .querySelectorAll(".arrayInputRow")
      .forEach((row) => row.remove());

    for (let i = 0; i < count; i++) {
      const newEntry = this.addField();
      dataFunc(newEntry, i);
    }
  }
}
