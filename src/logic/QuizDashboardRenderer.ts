import {StoredQuiz} from "../types/storage/StoredQuiz";
import {setIcon} from "obsidian";

export class QuizDashboardRenderer {

	constructor(
		private readonly container: HTMLElement,
		private onStartQuiz: (quiz: StoredQuiz) => void,
		private onDeleteQuiz: (quiz: StoredQuiz) => void
		) {}

	render(quizzes: StoredQuiz[]) {
		this.container.empty();
		this.container.createEl("h4", { text: "Saved Quizzes" })
		const quizGrid = this.container.createEl("div", { cls: "quiz-grid"});
		this.renderQuizItems(quizGrid, quizzes);
	}

	renderQuizItems(container: HTMLElement, quizzes: StoredQuiz[]) {
		quizzes.forEach(quiz => {
			const item = container.createEl("div", { cls: "stored-quiz-container"});

			item.createEl("p", { text: quiz.difficulty, cls: ["difficulty", quiz.difficulty.toLowerCase()]});

			const container1 = item.createEl("div");
			container1.style.display = "flex";
			container1.style.justifyContent = "space-between";
			container1.style.alignItems = "center"
			container1.createEl("p", { text: `${quiz.quiz.questions.length} questions`});

			const scoreInPercent = quiz.attempt?.lastCompleted?.scorePercent.toString();

			let scoreText: string;
			if (scoreInPercent) {
				scoreText = `${scoreInPercent}%`
			} else {
				scoreText = ""
			}

			const scoreElem = container1.createEl("div", { text:  scoreText, cls: "status text"});
			if (!scoreInPercent) scoreElem.style.display = "none";

			const formattedDate = new Date(quiz.createdAt).toLocaleDateString("en-US", {
				month: "short", // "Jan", "Feb", "Mar", etc.
				day: "numeric"  // 1–31
			});
			const createdAt = container1.createEl("div");
			createdAt.style.display = "flex";
			createdAt.style.alignItems = "center";
			createdAt.style.gap = "4px";
			setIcon(createdAt, "calendar");
			createdAt.createSpan({ text: `${formattedDate}`})

			item.createEl("div", { cls: "separation-line" });

			const container2 = item.createEl("div", { cls: "status"});
			let text: string;
			if(quiz.attempt?.inProgress) {
				text = "In Progress"
			} else if (!quiz.attempt?.lastCompleted) {
				text = "Not taken"
			} else {
				text = `Completed`
			}
			container2.createEl("p", { text: `${text}`, cls: "status"})

			const buttonsContainer = item.createEl("div");
			buttonsContainer.style.display = "flex";
			buttonsContainer.style.alignItems = "center";
			buttonsContainer.style.justifyContent = "space-between";

			const playButton = buttonsContainer.createEl("button");
			setIcon(playButton, "play");
			playButton.createSpan({
				text: quiz.attempt?.inProgress ? "Resume" : "Take"
			});
			playButton.style.gap = "4px";
			playButton.onclick = () => this.onStartQuiz(quiz);

			const deleteButton = buttonsContainer.createEl("button");
			setIcon(deleteButton, "trash");
			deleteButton.createSpan({text: "Delete"});
			deleteButton.style.gap = "4px";
			deleteButton.onclick = () => this.onDeleteQuiz(quiz);
		})
	}
}
