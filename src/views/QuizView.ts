import {ItemView, Notice, WorkspaceLeaf} from "obsidian";
import {MCQuizDTO} from "../types/MCQuizDTO";
import {QuizService} from "../services/QuizService";
import {QuizState} from "../logic/QuizState";
import {QuizRenderer} from "../logic/QuizRenderer";
import QuizPlugin from "../../main";
import {QuizStorage} from "../logic/QuizStorage";
import {QuizDashboardRenderer} from "../logic/QuizDashboardRenderer";
import {StoredQuiz} from "../types/storage/StoredQuiz";

export const QUIZ_VIEW = "quiz-view";

export class QuizView extends ItemView {

	plugin: QuizPlugin
	quizService: QuizService;
	quizState: QuizState;
	quizRenderer: QuizRenderer;
	quizDashboardRenderer: QuizDashboardRenderer;
	quizStorage: QuizStorage;


	generationButton: HTMLButtonElement | null;
	quizContainer: HTMLElement | null;
	dashboardContainer: HTMLElement | null;
	loadedQuiz: MCQuizDTO | null;

	constructor(leaf: WorkspaceLeaf, plugin: QuizPlugin, storage: QuizStorage) {
		super(leaf);
		this.quizService = new QuizService("http://localhost:8080");
		this.quizState = new QuizState();
		this.plugin = plugin;
		this.quizStorage = storage;
	}

	getViewType(): string {
		return QUIZ_VIEW;
	}

	getDisplayText(): string {
		return "Quiz View";
	}

	async onOpen() {
		const container = this.containerEl;
		container.style.maxWidth = "700px";
		container.style.alignSelf = "center";
		container.empty();

		// Creating the header
		const header = container.createEl('h4', { text: 'Quiz Panel'});
		header.style.padding = '20px';

		// Creating the generation button
		this.generationButton = container.createEl('button', { text: 'Generate'});
		this.generationButton.classList.add("mod-cta");
		this.generationButton.style.margin = "0px 20px";
		this.generationButton.onclick = async () => {
			const quiz: MCQuizDTO | undefined = await this.generateQuiz();
			if(quiz) {
				new Notice(`Generated quiz with ${quiz.questions.length} questions`);
				this.storeQuiz(quiz);
				this.refreshDashboard();
			}
		}

		// Create the container for the dashboard
		this.dashboardContainer = container.createEl("div");
		this.dashboardContainer.style.margin = "20px";
		this.quizDashboardRenderer = new QuizDashboardRenderer(
			this.dashboardContainer,
			(quiz) => this.startStoredQuiz(quiz)
		);

		this.registerEvent(
			this.app.workspace.on("active-leaf-change", () => {
				this.refreshDashboard();
			})
		)

		// Create container for result display
		this.quizContainer = container.createEl('div');
		this.quizContainer.style.margin = "0px 20px";

		this.quizRenderer = new QuizRenderer(
			this.quizContainer,
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

	private storeQuiz(quiz: MCQuizDTO): void {
		const activeFile = this.app.workspace.getActiveFile();
		const difficulty = this.plugin.settings.questionDifficulty;

		if(!activeFile) {
			new Notice("Quiz cannot be stored, no active file in the workspace");
			return;
		}

		this.quizStorage.addQuiz(activeFile.path, quiz, difficulty);

		new Notice("Quiz successfully stored");
	}

	private async generateQuiz(): Promise<MCQuizDTO | undefined> {
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

			const difficulty = this.plugin.settings.questionDifficulty;
			const numQuestions = this.plugin.settings.numberOfQuestions;

			return await this.quizService.generateQuiz(
				activeFile.name,
				content,
				difficulty,
				numQuestions
			);

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
		if (!this.quizContainer) return;
		this.quizRenderer.render(quiz, this.quizState);
	}

	private refreshDashboard() {
		if(!this.dashboardContainer || !this.quizDashboardRenderer) return;

		const activeFile = this.app.workspace.getActiveFile()?.path;

		this.dashboardContainer.empty();

		if(activeFile) {
			const loadedQuizzes = this.quizStorage.getQuizzesForFile(activeFile);
			this.quizDashboardRenderer.render(loadedQuizzes);
		} else {
			const msg = this.dashboardContainer.createEl("p", {
				text: "Open a file to view saved quizzes."
			});
			msg.style.opacity = "0.7";
		}
	}

	private showQuizView() {
		if (this.dashboardContainer) this.dashboardContainer.style.display = "none";
		if (this.quizContainer) this.quizContainer.style.display = "block";
	}

	private showDashboardView() {
		if(this.quizContainer) this.quizContainer.style.display = "none";
		if(this.dashboardContainer) this.dashboardContainer.style.display = "block";
	}

	private startStoredQuiz(storedQuiz: StoredQuiz) {
		this.loadedQuiz = storedQuiz.quiz;
		this.quizState.resetQuizState();
		this.showQuizView();
		this.displayQuiz(this.loadedQuiz);
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
		if (this.loadedQuiz) {
			const numberOfQuestions = this.loadedQuiz.questions.length;
			this.quizState.navigateToNextQuestion(numberOfQuestions);
			this.reRender();
		}
	}

	private onPrev() {
		this.quizState.navigateToPreviousQuestion();
		this.reRender();
	}

	private reRender() {
		if (this.loadedQuiz) this.displayQuiz(this.loadedQuiz);
	}
}
