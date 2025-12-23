import {App, Notice} from "obsidian";
import {QuizService} from "../services/QuizService";
import {QuizStorage} from "../logic/QuizStorage";
import {MCQuizDTO} from "../types/MCQuizDTO";
import QuizPlugin from "../../main";
import {StoredQuiz} from "../types/storage/StoredQuiz";

export class QuizController {
	constructor(
		private app: App,
		private plugin: QuizPlugin,
		private quizService: QuizService,
		private quizStorage: QuizStorage
	) {}

	async generateAndStoreQuiz(): Promise<MCQuizDTO | undefined> {
		const activeFile = this.app.workspace.getActiveFile();
		if (!activeFile) {
			new Notice("Please open a file in the workspace first");
			return;
		}

		const content = await this.app.vault.read(activeFile);

		const quiz = await this.quizService.generateQuiz(
			activeFile.name,
			content,
			this.plugin.settings.questionDifficulty,
			this.plugin.settings.numberOfQuestions
		);

		this.quizStorage.addQuiz(
			activeFile.path,
			quiz,
			this.plugin.settings.questionDifficulty
		)

		return quiz;
	}

	getStoredQuizzesForFile(filePath: string): StoredQuiz[] {
		return this.quizStorage.getQuizzesForFile(filePath);
	}

	deleteStoredQuiz(storedQuiz: StoredQuiz): void {
		this.quizStorage.deleteQuiz(storedQuiz);
	}
}
