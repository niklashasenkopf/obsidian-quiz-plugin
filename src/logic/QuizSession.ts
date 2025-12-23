import {MCQuizDTO} from "../types/MCQuizDTO";
import {QuizState} from "./QuizState";

export class QuizSession {
	constructor(
		private quiz: MCQuizDTO,
		private state: QuizState
	) {}

	start() {
		this.state.resetQuizState();
	}

	selectAnswer(index: number) {
		this.state.selectAnswerForCurrentQuestion(index);
	}

	checkAnswer() {
		this.state.markCurrentQuestionAsChecked()
	}

	next() {
		this.state.navigateToNextQuestion(this.quiz.questions.length);
	}

	prev() {
		this.state.navigateToPreviousQuestion();
	}

	getState(): QuizState {
		return this.state;
	}

	getQuiz(): MCQuizDTO {
		return this.quiz;
	}
}
