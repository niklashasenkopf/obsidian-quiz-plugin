import type {StoredQuiz} from "../types/storage/StoredQuiz";
import {setIcon} from "obsidian";

export class QuizDashboardRenderer {

	constructor(
		private readonly container: HTMLElement,
		private onStartQuiz: (quiz: StoredQuiz) => void,
		private onEditQuiz: (quiz: StoredQuiz) => void
		) {}

	render(quizzes: StoredQuiz[]) {
		this.container.empty();
		this.container.createEl("h4", { text: "Generated quizzes" })
		const quizGrid = this.container.createEl("div", { cls: "dashboard-quizzes"});

		if(quizzes.length > 0) {
			this.renderQuizItems(quizGrid, quizzes);
		} else {
			const empty =
				this.container.createEl("div", { cls: "dashboard-empty-disclaimer" });
			setIcon(empty, "book-dashed");
			empty.createSpan({ text: "No quizzes created for this file"})
		}

	}

	renderQuizItems(container: HTMLElement, quizzes: StoredQuiz[]) {
		quizzes.forEach(quiz => {
			const item = container.createEl("div", { cls: "dashboard-item-container"});

			item.createEl("p", { text: quiz.difficulty, cls: ["difficulty", quiz.difficulty.toLowerCase()]});

			const container1
				= item.createEl("div", { cls: ["flex-justify-between", "flex-align-center"]});

			container1.createEl("p", { text: `${quiz.quiz.questions.length} questions`});

			const scoreInPercent = quiz.attempt?.lastCompleted?.scorePercent.toString();

			let scoreText: string;
			if (scoreInPercent) {
				scoreText = `${scoreInPercent}%`
			} else {
				scoreText = ""
			}

			const scoreElem
				= container1.createEl("div",
				{ text: scoreText, cls: ["flex-center", "dashboard-item-last-score"]});
			if (!scoreInPercent) scoreElem.setCssProps({ display: "none" });

			const formattedDate = new Date(quiz.createdAt).toLocaleDateString("en-US", {
				month: "short",
				day: "numeric"
			});
			const createdAt
				= container1.createEl("div", { cls: ["flex-align-center", "gap-4"] });
			setIcon(createdAt, "calendar");
			createdAt.createSpan({ text: `${formattedDate}`})

			item.createEl("div", { cls: "separation-line" });

			const container2 = item.createEl("div", { cls: ["font-italic", "flex-center"] });
			let text: string;
			if(quiz.attempt?.inProgress) {
				text = "In Progress"
			} else if (!quiz.attempt?.lastCompleted) {
				text = "Not taken"
			} else {
				text = "Completed"
			}
			container2.createEl("p", { text: `${text}`, cls: "status"})

			const buttonsContainer
				= item.createEl("div", { cls: ["flex-align-center", "flex-justify-between"]});

			const playButton
				= buttonsContainer.createEl(
					"button", {
						text: quiz.attempt?.inProgress ? "Resume" : "Take" ,
						cls: ["gap-4", "mod-cta"]
					});
			playButton.onclick = () => this.onStartQuiz(quiz);

			const editButton
				= buttonsContainer.createEl("button", { text: "Edit" ,cls: ["gap-4", "mod-muted"]})
			editButton.onclick = () => this.onEditQuiz(quiz);
		})
	}
}
