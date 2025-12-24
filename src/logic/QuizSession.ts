import type {QuizState} from "./QuizState";
import type {StoredQuiz} from "../types/storage/StoredQuiz";

export class QuizSession {
	constructor(
		private stored: StoredQuiz,
		private state: QuizState,
	) {}

	selectAnswer(index: number) {
		this.state.selectAnswerForCurrentQuestion(index);
	}

	checkAnswer() {
		this.state.markCurrentQuestionAsChecked()
	}

	next() {
		this.state.navigateToNextQuestion(this.stored.quiz.questions.length);
	}

	prev() {
		this.state.navigateToPreviousQuestion();
	}

	getState(): QuizState {
		return this.state;
	}

	getStoredQuiz(): StoredQuiz {
		return this.stored;
	}


	isFinished(): boolean {
		const totalQuestions = this.stored.quiz.questions.length;
		const answers = this.state.answers;

		for (let i = 0; i < totalQuestions; i++) {
			if (!answers[i]?.checked) {
				return false;
			}
		}

		return true;
	}

	getScorePercent(): number {
		const total = this.stored.quiz.questions.length;
		let correct = 0;

		for (let i = 0; i < total; i++) {
			const answer = this.state.answers[i];
			if (!answer?.checked) continue;

			const question = this.stored.quiz.questions[i];
			if (answer.selectedIndex === question.correctAnswerIndex) {
				correct++;
			}
		}

		return total === 0 ? 0 : Math.round((correct / total) * 100);
	}


}
