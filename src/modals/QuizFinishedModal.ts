import {App, Modal, setIcon} from "obsidian";
import {QuizSession} from "../logic/QuizSession";

export class QuizFinishedModal extends Modal {

	constructor(
		app: App,
		private quizSession: QuizSession,
		private onConfirm: () => void
		) {
		super(app)
	}

	onOpen() {
		const { contentEl } = this;

		this.setTitle("Quiz finished!");

		// contentEl.createEl('h3', { text: 'Delete Quiz'});
		const text = contentEl.createEl("div");
		text.style.display = "flex";
		text.style.alignItems = "center";
		text.style.gap = "6px";

		const iconEl = text.createEl("span");
		setIcon(iconEl, "party-popper");

		text.createSpan({
			text: `You scored ${this.quizSession.getScorePercent()}%`
		});


		const buttonContainer = contentEl.createEl("div");
		buttonContainer.style.display = "flex";
		buttonContainer.style.justifyContent = "flex-end";
		buttonContainer.style.gap = "8px";
		buttonContainer.style.marginTop = "36px";

		const okButton = buttonContainer.createEl("button", { text: "OK" });
		okButton.onclick = () => {
			this.onConfirm();
			this.close();
		};

	}

	onClose() {
		this.contentEl.empty();
	}
}
