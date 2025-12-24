import type {App} from "obsidian";
import { Modal, setIcon} from "obsidian";

export interface ConfirmationModalOptions {
	title: string;
	message: string;
	confirmText?: string;
	confirmIcon?: string;
	confirmColor?: string;
	cancelText?: string;
	cancelIcon?: string;
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

		// contentEl.createEl('h3', { text: 'Delete Quiz'});
		contentEl.createEl('p', {
			text: this.options.message
		})

		const buttonContainer = contentEl.createEl("div");
		buttonContainer.setCssProps({
			display: "flex",
			"justify-content": "flex-end",
			gap: "8px",
			"margin-top": "36px"
		})

		const cancelBtn = buttonContainer.createEl("button")
		cancelBtn.onclick = () => {
			if (this.options.onCancel) this.options.onCancel();
			this.close();
		}
		setIcon(cancelBtn, this.options.cancelIcon ? this.options.cancelIcon : "x");
		cancelBtn.createSpan({text: this.options.cancelText});
		cancelBtn.setCssProps({ gap: "4px" });

		const confirmBtn = buttonContainer.createEl("button");
		confirmBtn.onclick = () => {
			this.options.onConfirm()
			this.close()
		}
		setIcon(confirmBtn, this.options.confirmIcon ? this.options.confirmIcon : "trash");
		confirmBtn.createSpan({text: this.options.confirmText});
		confirmBtn.setCssProps({ gap: "4px" });
		confirmBtn.style.backgroundColor = this.options.confirmColor ? this.options.confirmColor : "var(--color-purple)";

	}

	onClose() {
		this.contentEl.empty();
	}
}
