import addCustomDialog from "./addCustomDialog.html";
import addCustomDialogCss from "./addCustomDialog.css";
import addKanji from "./addKanji.html";
import addVocab from "./addVocab.html";
import addCustomButton from "./addCustomButton.html";
import { AddKanjiHandler } from "./addKanji";
import { UIHandler } from "./uiHandler";
import { AddVocabHandler } from "./addVocab";

interface UIOption {
  html: string;
  handler: UIHandler;
}

export class UI {
  private static instance: UI | undefined;

  private dialogContainer: HTMLElement;
  private dataForm: HTMLFormElement | undefined;

  private dialogExpanded = false;
  private customButton: HTMLElement | undefined;

  readonly uiOptions = {
    addKanji: {
      html: addKanji,
      handler: new AddKanjiHandler(),
    },
    addVocab: {
      html: addVocab,
      handler: new AddVocabHandler(),
    },
  };
  private currentUIHandler: UIHandler | undefined;

  constructor() {
    this.dialogContainer = document.createElement("div");
    this.dialogContainer.classList.add("wics-addcustom-dialog");
    document.body.append(this.dialogContainer);
  }

  public init(): void {
    const sitemap = document.querySelector("#sitemap") as HTMLElement;
    if (sitemap === null) {
      return;
    }

    this.dialogContainer.innerHTML = addCustomDialog;

    const dialogContainerStyle = document.createElement(
      "style"
    ) as HTMLStyleElement;
    dialogContainerStyle.textContent = addCustomDialogCss;
    document.head.append(dialogContainerStyle);

    this.dialogContainer.classList.add("hidden");

    this.dataForm = this.dialogContainer.querySelector(
      ".data-form"
    ) as HTMLFormElement;

    this.setDataForm(this.uiOptions.addKanji);

    const customButtonContainer = document.createElement("li");
    customButtonContainer.classList.add("sitemap__section");
    customButtonContainer.innerHTML = addCustomButton;
    sitemap.insertBefore(
      customButtonContainer,
      sitemap.children[0] as HTMLElement
    );
    this.customButton = customButtonContainer.children[0] as HTMLElement;
    this.customButton.addEventListener("click", () => this.toggleDialog());

    let addtypeForm = this.dialogContainer.querySelector(
      ".addtype-select-group"
    ) as HTMLFormElement;
    addtypeForm.addEventListener("change", () =>
      this.addSelectionChanged(addtypeForm)
    );
  }

  public addSelectionChanged(form: HTMLFormElement) {
    let formData = new FormData(form);

    let itemType = formData.get("itemtype");
    let addType = formData.get("addtype");

    if (itemType === "kanji" && addType === "add") {
      this.setDataForm(this.uiOptions.addKanji);
    } else if (itemType === "vocab" && addType === "add") {
      this.setDataForm(this.uiOptions.addVocab);
    }
  }

  public static getInstance(): UI {
    if (UI.instance === undefined) {
      UI.instance = new UI();
    }
    return UI.instance;
  }

  private setDataForm(uiOption: UIOption) {
    this.currentUIHandler?.unhook();
    const dataForm = this.dataForm as HTMLFormElement;
    dataForm.innerHTML = uiOption.html;

    uiOption.handler.hook(dataForm);
    this.currentUIHandler = uiOption.handler;
  }

  private toggleDialog() {
    this.dialogExpanded = !this.dialogExpanded;
    const customButton = this.customButton as HTMLElement;
    customButton.setAttribute("data-expanded", this.dialogExpanded.toString());
    customButton.setAttribute("aria-expanded", this.dialogExpanded.toString());

    this.dialogContainer.classList.toggle("hidden");
  }
}
