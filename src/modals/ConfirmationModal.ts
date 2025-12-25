import type {App} from "obsidian";
import { Modal } from "obsidian";

export interface ConfirmationModalOptions {
	title: string;
	message: string;
	confirmText?: string;
	confirmColor?: string;
	cancelText?: string;
	onConfirm: () => void;
	onCancel?: () => void;
}

export class ConfirmationModal extends Modal {
	private options: ConfirmationModalOptions;

	constructor(app: App, options: ConfirmationModalOptions) {
		super(app);
		this.options = options;
	}

	onOpen() {
		const { contentEl } = this;

		this.setTitle(this.options.title);

		contentEl.createEl('p', {
			text: this.options.message
		})

		const buttonContainer
			= contentEl.createEl("div", { cls: ["flex-justify-end", "gap-8", "mt-36"]});

		const cancelBtn
			= buttonContainer.createEl("button", { text: this.options.cancelText, cls: "gap-4" });
		cancelBtn.onclick = () => {
			if (this.options.onCancel) this.options.onCancel();
			this.close();
		}

		const confirmBtn
			= buttonContainer.createEl("button", { text: this.options.confirmText, cls: "gap-4" });
		confirmBtn.onclick = () => {
			this.options.onConfirm()
			this.close()
		}
		confirmBtn.style.backgroundColor = this.options.confirmColor ? this.options.confirmColor : "var(--color-purple)";

	}

	onClose() {
		this.contentEl.empty();
	}
}
