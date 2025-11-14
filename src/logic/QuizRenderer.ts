import {MCQuizDTO} from "../types/MCQuizDTO";
import {QuizState} from "./QuizState";

export class QuizRenderer {
	private container: HTMLElement;
	private readonly onAnswerSelect: (index: number) => void;
	private readonly onCheckAnswer: () => void;
	private readonly onPrev: () => void;
	private readonly onNext: () => void;

	constructor(
		container: HTMLElement,
		onAnswerSelect: (index: number) => void,
		onCheckAnswer: () => void,
		onPrev: () => void,
		onNext: () => void
	) {
		this.container = container;
		this.onAnswerSelect = onAnswerSelect;
		this.onCheckAnswer = onCheckAnswer;
		this.onPrev = onPrev;
		this.onNext = onNext;
	}

	render(quiz: MCQuizDTO, state: QuizState) {
		this.container.empty();
		this.renderHeader(quiz, state);
		this.renderPossibleAnswers(quiz, state);
		this.renderButtons();
	}

	renderHeader(quiz: MCQuizDTO, state: QuizState) {
		const numQuestions = quiz.questions.length;
		const question = quiz.questions[state.currentIndex];

		this.container.createEl("h5", {
			text: `Question ${state.currentIndex + 1}/${numQuestions}`
		});

		this.container.createEl("p", {
			text: question.question
		});
	}

	renderPossibleAnswers(quiz: MCQuizDTO, state: QuizState) {
		const question = quiz.questions[state.currentIndex];

		question.possibleAnswers.forEach((answer, idx) => {
			const answerObject = this.container.createEl(
				"p",
				{
					text: `${idx + 1}. ${answer}`,
					cls: 'possibleAnswer'
				}
			);

			const selectedIndex = state.getSelectedAnswerIndex(state.currentIndex);
			const checked = state.isChecked(state.currentIndex);

			// Clear conditional classes
			answerObject.removeClass('selected');
			answerObject.removeClass('correct');
			answerObject.removeClass('incorrect');

			answerObject.toggleClass('correct', checked && idx === question.correctAnswerIndex);
			answerObject.toggleClass('incorrect', checked && selectedIndex === idx && question.correctAnswerIndex !== idx);
			answerObject.toggleClass('selected', !checked && selectedIndex === idx);

			answerObject.onclick = () => {
				if (!checked) this.onAnswerSelect(idx);
			}
		});
	}

	renderButtons() {
		const buttonContainer = this.container.createEl("div");
		buttonContainer.style.display = "flex";
		buttonContainer.style.alignItems = "center";
		buttonContainer.style.justifyContent = "space-between"

		// Check Answer
		const checkButton = buttonContainer.createEl("button", { text: "Check Answer"});
		checkButton.onclick = this.onCheckAnswer;

		// Navigation
		const quizNavigation = buttonContainer.createEl('div');

		// Previous Question
		const previous = quizNavigation.createEl(
			'button',
			{ text: "Previous"}
		);
		previous.onclick = () => this.onPrev();

		// Next Question
		const next = quizNavigation.createEl(
			'button',
			{ text: "Next"}
		);
		next.style.marginLeft = "8px";
		next.onclick = () => this.onNext();
	}
}
