import type {App} from "obsidian";
import { Setting} from "obsidian";
import { Modal} from "obsidian";
import type {StoredQuiz} from "../types/storage/StoredQuiz";
import {Difficulty} from "../types/Difficulty";
import type {MCQuestionDTO} from "../types/MCQuestionDTO";
import type {MCQuizDTO} from "../ai/MCQuizSchema";

export class EditQuizModal extends Modal {

	private isDirty: boolean = false;
	private saveChangesBtn: HTMLButtonElement;
	private rightPane: HTMLElement;
	private editingQuiz: MCQuizDTO;

	constructor(
		app: App,
		private readonly storedQuiz: StoredQuiz,
		private onConfirm: (quizId: string, updatedQuiz: MCQuizDTO) => void,
		private onDelete: (quiz: StoredQuiz) => void
	) {
		super(app);
		this.storedQuiz = storedQuiz;
	}

	onOpen(): Promise<void> | void {
		this.modalEl.addClass("quiz-modal");
		this.setTitle("Quiz editing");

		// Deep clone the quiz to edit
		this.editingQuiz = structuredClone(this.storedQuiz.quiz);

		const editPane = this.contentEl.createDiv();
		editPane.setCssProps({ display: "flex" });

		const leftPane = editPane.createEl("div");
		this.rightPane = editPane.createEl("div", { cls: "question-edit-container" });
		this.rightPane.setCssProps({ display: "none" });

		this.renderSettings(leftPane);
		const container = leftPane.createEl("div", { cls: "quiz-edit-questions-container"})
		this.editingQuiz.questions.forEach((q, index) => {
			this.renderQuestionItem(container, q, index);
		})

		this.renderButtons();
	}

	onClose() {
		this.contentEl.empty();
	}

	private renderButtons() {

		const outerContainer
			= this.contentEl.createEl("div", { cls: ["flex-justify-between", "mt-36"]})

		const deleteBtn
			= outerContainer.createEl("button", { text: "Delete", cls: "mod-warning"})
		deleteBtn.onclick = () => {
			this.onDelete(this.storedQuiz);
		}

		const buttonContainer
			= outerContainer.createEl("div", { cls: ["flex-align-center", "gap-8"]});

		const cancelBtn
			= buttonContainer.createEl("button", { text: "Cancel", cls: "gap-4" });
		cancelBtn.onclick = () => this.close();

		this.saveChangesBtn
			= buttonContainer.createEl("button", { text: "Save changes", cls: ["gap-4", "mod-cta"]});
		this.saveChangesBtn.disabled = true;
		this.saveChangesBtn.onclick = () => {
			this.onConfirm(this.storedQuiz.id, this.editingQuiz)
			this.close()
		}

	}

	private renderSettings(contentEl: HTMLElement) {
		new Setting(contentEl)
			.setName("Difficulty")
			.setDesc("This quiz was harder or easier than you thought? Change the difficulty value to your liking.")
			.addDropdown(d => {
				Object.values(Difficulty).forEach(diff =>
					d.addOption(diff, diff)
				);
				d.setValue(this.storedQuiz.difficulty);
				d.onChange(v => {
					this.storedQuiz.difficulty = v as Difficulty;
				});
			});
	}

	private renderQuestionItem(contentEl: HTMLElement, question: MCQuestionDTO, index: number) {
		const item
			= contentEl.createEl("div", { text: `Question ${index + 1}` , cls: "quiz-edit-question-item" })
		item.onclick = () => this.openQuestionEditPane(question, index + 1)
	}

	private openQuestionEditPane(question: MCQuestionDTO, index: number): void {
		const modal = this.modalEl;
		const styles = getComputedStyle(modal);

		let widthValue = styles.getPropertyValue("--modal-width").trim();

		let widthPx: number;

		if (widthValue.endsWith("vw")) {
			const vw = parseFloat(widthValue);
			widthPx = (vw / 100) * window.innerWidth;
		} else {
			widthPx = parseFloat(widthValue);
		}

		if (!Number.isNaN(widthPx)) {
			modal.style.setProperty(
				"width",
				`${widthPx + 300}px`
			);
		}

		this.rightPane.setCssProps({ display: "flex" });

		this.renderQuestionEditPane(question, index);
	}

	private renderQuestionEditPane(question: MCQuestionDTO, index: number) {
		this.rightPane.empty();

		const questionSection = this.rightPane.createDiv({ cls: "quiz-edit-section"});
		questionSection.createEl("label", {
			text: `Question ${index}`,
			cls: "quiz-edit-label"
		});
		const questionInput = questionSection.createEl("textarea", {
			cls: "quiz-edit-textarea",
			text: question.question
		})
		questionInput.oninput = () => {
			question.question = questionInput.value;
			this.markDirty();
		}

		const answersSection = this.rightPane.createDiv({ cls: "quiz-edit-section"});
		answersSection.createEl("label", {
			text: "Possible answers",
			cls: "quiz-edit-label"
		})

		question.possibleAnswers.forEach((answer,index) => {
			const answerRow = answersSection.createDiv({
				cls: "quiz-edit-answer-row"
			})

			const answerInput = answerRow.createEl("input", {
				type: "text",
				value: answer,
				cls: "quiz-edit-answer-input"
			})

			answerInput.oninput = () => {
				question.possibleAnswers[index] = answerInput.value;
				this.markDirty();
			}

			const correctCheckbox = answerRow.createEl("input", {
				type: "checkbox",
				cls: "quiz-edit-answer-correct"
			})

			correctCheckbox.checked = index === question.correctAnswerIndex

			correctCheckbox.onchange = () => {
				question.correctAnswerIndex = index;

				answersSection.querySelectorAll<HTMLInputElement>(".quiz-edit-answer-correct")
					.forEach((cb, i) => cb.checked = i === index);

				this.markDirty();
			}
		})
	}

	private markDirty() {
		if (!this.isDirty) {
			this.isDirty = true;
			this.saveChangesBtn.disabled = false;
		}
	}
}
