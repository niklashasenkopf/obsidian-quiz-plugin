import type {QuizAttemptState} from "../types/QuizAttemptState";

export class QuizState {
	currentIndex = 0;
	answers: Record<number, { selectedIndex: number | null; checked: boolean }> = {};

	selectAnswerForCurrentQuestion(selectedIndex: number): void {
		const prev = this.answers[this.currentIndex] ?? { selectedIndex: null, checked: false };
		this.answers[this.currentIndex] = {...prev, selectedIndex};
	}

	markCurrentQuestionAsChecked(): void {
		const prev = this.answers[this.currentIndex] ?? { selectedIndex: null, checked: false };
		this.answers[this.currentIndex] = {...prev, checked: true};
	}

	navigateToNextQuestion(totalQuestions: number): void {
		if(this.currentIndex < totalQuestions - 1) {
			this.currentIndex++;
		}
	}

	navigateToPreviousQuestion(): void {
		if(this.currentIndex > 0) {
			this.currentIndex--;
		}
	}

	getSelectedAnswerIndex(questionIndex: number): number | null {
		return this.answers[questionIndex]?.selectedIndex ?? null;
	}

	isChecked(questionIndex: number): boolean {
		return this.answers[questionIndex]?.checked;
	}

	resetQuizState(): void {
		this.currentIndex = 0;
		this.answers = {};
	}

	toAttemptState(): QuizAttemptState {
		return {
			currentQuestionIndex: this.currentIndex,
			answers: this.answers
		}
	}

	public static fromAttemptState(state: QuizAttemptState): QuizState {
		const quizState = new QuizState();
		quizState.currentIndex = state.currentQuestionIndex;
		quizState.answers = state.answers;
		return quizState;
	}
}
