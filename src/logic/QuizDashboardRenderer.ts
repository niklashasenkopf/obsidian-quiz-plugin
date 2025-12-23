import {StoredQuiz} from "../types/storage/StoredQuiz";
import {setIcon} from "obsidian";

export class QuizDashboardRenderer {

	constructor(
		private readonly container: HTMLElement,
		private onStartQuiz : (quiz: StoredQuiz) => void
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

			const difficulty = item.createEl("p", { text: quiz.difficulty });
			difficulty.style.fontWeight = "bold";
			difficulty.style.margin = "4px 0px";

			const container1 = item.createEl("div");
			container1.style.display = "flex";
			container1.style.justifyContent = "space-between";
			container1.style.alignItems = "center"
			container1.createEl("p", { text: `${quiz.quiz.questions.length} questions`});
			const formattedDate = new Date(quiz.createdAt).toLocaleDateString("en-US", {
				month: "short", // "Jan", "Feb", "Mar", etc.
				day: "numeric"  // 1–31
			});

			container1.createEl("p", { text: `Created at ${formattedDate}`});

			item.createEl("div", { cls: "separation-line" });

			const container2 = item.createEl("div");
			container2.style.display = "flex";
			container2.style.justifyContent = "center";
			container2.style.alignItems = "center";
			let text: string;
			if(quiz.progress?.completed) {
				text = `${quiz.progress.score}%`
			} else {
				text = "Not taken"
			}
			container2.createEl("p", { text: `${text}`})

			if(quiz.progress?.completed) {
				container2.createEl("p", { text: `Last attempt: ${quiz.progress.lastAttempt}`})
			}

			const buttonsContainer = item.createEl("div");
			buttonsContainer.style.display = "flex";
			buttonsContainer.style.alignItems = "center";
			buttonsContainer.style.justifyContent = "space-between";

			const playButton = buttonsContainer.createEl("button");
			setIcon(playButton, "play");
			playButton.createSpan({text: "Take"});
			playButton.style.gap = "4px";
			playButton.onclick = () => this.onStartQuiz(quiz);

			const deleteButton = buttonsContainer.createEl("button");
			setIcon(deleteButton, "trash");
			deleteButton.createSpan({text: "Delete"});
			deleteButton.style.gap = "4px";
		})
	}
}
