import {ItemView, Notice, WorkspaceLeaf} from "obsidian";
import {QuizState} from "../logic/QuizState";
import {QuizRenderer} from "../logic/QuizRenderer";
import {QuizDashboardRenderer} from "../logic/QuizDashboardRenderer";
import {StoredQuiz} from "../types/storage/StoredQuiz";
import {QuizController} from "../controllers/QuizController";
import {QuizViewLayout} from "./QuizViewLayout";
import {QuizSession} from "../logic/QuizSession";

export const QUIZ_VIEW = "quiz-view";

enum QuizViewMode {
	Dashboard,
	Quiz
}

export class QuizView extends ItemView {

	private mode: QuizViewMode = QuizViewMode.Dashboard;
	private quizRenderer: QuizRenderer;
	private quizDashboardRenderer: QuizDashboardRenderer;
	private quizController: QuizController;
	private layout: QuizViewLayout;
	private quizSession: QuizSession | null = null;
	private currentFilePath: string | null = null;

	constructor(leaf: WorkspaceLeaf, quizController: QuizController) {
		super(leaf);
		this.quizController = quizController
	}

	getViewType(): string {
		return QUIZ_VIEW;
	}

	getDisplayText(): string {
		return "Quiz View";
	}

	async onOpen() {
		this.layout = new QuizViewLayout(this.containerEl);

		this.layout.goBackButton.onclick = () => {
			this.setMode(QuizViewMode.Dashboard);
		}

		this.layout.generationButton.onclick = async () => {
			const quiz = await this.quizController.generateAndStoreQuiz();
			if (quiz) {
				new Notice(`Generated quiz with ${quiz.questions.length} questions`);
				this.refreshDashboard();
			}
		}

		this.quizDashboardRenderer = new QuizDashboardRenderer(
			this.layout.dashboardContainer,
			(quiz) => this.startStoredQuiz(quiz),
			(quiz) => this.deleteStoredQuiz(quiz)
		)

		this.quizRenderer = new QuizRenderer(
			this.layout.quizContainer,
			(index) => this.onAnswerSelect(index),
			() => this.onCheckAnswer(),
			() => this.onPrev(),
			() => this.onNext()
		)

		this.currentFilePath = this.app.workspace.getActiveFile()?.path ?? null;

		this.registerEvent(
			this.app.workspace.on("file-open", (file) => {
				this.currentFilePath = file?.path ?? null;
				this.refreshDashboard();
			})
		)

		// this.loadedQuiz = mockQuiz
		// this.displayQuiz(this.loadedQuiz);
		this.setMode(QuizViewMode.Dashboard);
		this.refreshDashboard();
	}

	async onClose() {
		// Nothing to clean up so far
	}

	private setMode(mode: QuizViewMode) {
		this.mode = mode;

		const isQuiz = mode === QuizViewMode.Quiz;

		if (this.layout.quizContainer)
			this.layout.quizContainer.style.display = isQuiz ? "block" : "none";

		if (this.layout.dashboardContainer)
			this.layout.dashboardContainer.style.display = isQuiz ? "none" : "block";

		if (this.layout.generationButton)
			this.layout.generationButton.style.display = isQuiz ? "none" : "block";

		if (this.layout.goBackButton)
			this.layout.goBackButton.style.display = isQuiz ? "block" : "none";
	}

	private renderSession() {
		if (!this.quizSession || ! this.layout.quizContainer) return;

		this.quizRenderer.render(
			this.quizSession.getQuiz(),
			this.quizSession.getState()
		)
	}

	private refreshDashboard() {
		if(!this.quizDashboardRenderer) return;

		this.layout.dashboardContainer.empty();

		if(this.currentFilePath) {
			const loadedQuizzes = this.quizController.getStoredQuizzesForFile(this.currentFilePath);
			this.quizDashboardRenderer.render(loadedQuizzes);
		} else {
			const msg = this.layout.dashboardContainer.createEl("p", {
				text: "Open a file to view saved quizzes."
			});
			msg.style.opacity = "0.7";
		}
	}

	private startStoredQuiz(storedQuiz: StoredQuiz) {
		this.quizSession = new QuizSession(
			storedQuiz.quiz,
			new QuizState()
		)

		this.quizSession?.start()
		this.setMode(QuizViewMode.Quiz);
		this.renderSession();
	}

	private deleteStoredQuiz(storedQuiz: StoredQuiz) {
		this.quizController.deleteStoredQuiz(storedQuiz);
		this.refreshDashboard();
	}

	private onAnswerSelect(index: number) {
		this.quizSession?.selectAnswer(index);
		this.renderSession();
	}

	private onCheckAnswer() {
		this.quizSession?.checkAnswer();
		this.renderSession();
	}

	private onNext() {
		this.quizSession?.next();
		this.renderSession();
	}

	private onPrev() {
		this.quizSession?.prev();
		this.renderSession();
	}
}
