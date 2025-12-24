import type {App} from "obsidian";
import { Modal, setIcon} from "obsidian";
import type {QuizSession} from "../logic/QuizSession";

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

		const text = contentEl.createEl("div", { cls: ["flex-align-center", "gap6"]});

		const iconEl = text.createEl("span");
		setIcon(iconEl, "party-popper");

		text.createSpan({
			text: `You scored ${this.quizSession.getScorePercent()}%`
		});

		const buttonContainer
			= contentEl.createEl("div", { cls: ["flex-justify-end", "gap8", "mt36"]});

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
