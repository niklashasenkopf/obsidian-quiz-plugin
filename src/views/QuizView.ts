import {ItemView, Notice, WorkspaceLeaf} from "obsidian";
import {MCQuizDTO} from "../types/MCQuizDTO";
import {QuizService} from "../services/QuizService";
import {QuizState} from "../logic/QuizState";
import {QuizRenderer} from "../logic/QuizRenderer";

export const QUIZ_VIEW = "quiz-view";

export class QuizView extends ItemView {
	quizService: QuizService;
	quizState: QuizState;
	quizRenderer: QuizRenderer;
	generationButton: HTMLButtonElement | null;
	resultContainer: HTMLElement | null;
	loadedQuiz: MCQuizDTO | null;

	constructor(leaf: WorkspaceLeaf) {
		super(leaf);
		this.quizService = new QuizService("http://localhost:8080");
		this.quizState = new QuizState();
	}

	getViewType(): string {
		return QUIZ_VIEW;
	}

	getDisplayText(): string {
		return "Quiz View";
	}

	async onOpen() {
		const container = this.containerEl;
		container.empty();

		// Creating the header
		const header = container.createEl('h4', { text: 'Quiz Panel'});
		header.style.padding = '20px';

		// Creating the generation button
		this.generationButton = container.createEl('button', { text: 'Generate'});
		this.generationButton.classList.add("mod-cta");
		this.generationButton.style.margin = "0px 20px";
		this.generationButton.onclick = async () => {
			await this.generateQuiz();
		}

		// Create container for result display
		this.resultContainer = container.createEl('div');
		this.resultContainer.style.margin = "0px 20px";

		this.quizRenderer = new QuizRenderer(
			this.resultContainer,
			(index) => this.onAnswerSelect(index),
			() => this.onCheckAnswer(),
			() => this.onPrev(),
			() => this.onNext()
		)

		// this.loadedQuiz = mockQuiz
		// this.displayQuiz(this.loadedQuiz);
	}

	async onClose() {
		// Nothing to clean up so far
	}

	private async generateQuiz() {
		const activeFile = this.app.workspace.getActiveFile();

		if(!activeFile) {
			new Notice("Please open a file in the workspace first.");
			return;
		}

		if(this.generationButton) {
			this.generationButton.disabled = true;
			this.generationButton.textContent = "Generating...";
		}

		const content = await this.app.vault.read(activeFile);

		try {
			const quiz: MCQuizDTO = await this.quizService.generateQuiz(
				activeFile.name,
				content,
				"EXTREME",
				5
			);

			new Notice(`Generated quiz with ${quiz.questions.length} questions`);

			// Display the loaded quiz in the view
			this.displayQuiz(quiz);
			this.loadedQuiz = quiz;
		} catch (error) {
			console.error(error);
			new Notice(error.toString());
		} finally {
			if(this.generationButton) {
				this.generationButton.disabled = false;
				this.generationButton.textContent = "Generate";
			}
		}
	}

	private displayQuiz(quiz: MCQuizDTO) {
		if (!this.resultContainer) return;
		this.quizRenderer.render(quiz, this.quizState);
	}

	private onAnswerSelect(index: number) {
		this.quizState.selectAnswerForCurrentQuestion(index);
		this.reRender();
	}

	private onCheckAnswer() {
		this.quizState.markCurrentQuestionAsChecked();
		this.reRender();
	}

	private onNext() {
		let numberOfQuestions = this.loadedQuiz!.questions.length;
		this.quizState.navigateToNextQuestion(numberOfQuestions);
		this.reRender();
	}

	private onPrev() {
		this.quizState.navigateToPreviousQuestion();
		this.reRender();
	}

	private reRender() {
		this.displayQuiz(this.loadedQuiz!);
	}
}
