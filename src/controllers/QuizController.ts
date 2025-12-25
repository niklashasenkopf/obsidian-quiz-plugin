import type {App} from "obsidian";
import { Notice} from "obsidian";
import type {QuizStorage} from "../logic/QuizStorage";
import type {MCQuizDTO} from "../types/MCQuizDTO";
import type QuizPlugin from "../../main";
import type {StoredQuiz} from "../types/storage/StoredQuiz";
import type {QuizAttemptState} from "../types/QuizAttemptState";
import type {QuizService} from "../services/QuizService";
import type {QuizGenerationOptions} from "../modals/PreGenerationModal";

export class QuizController {
	constructor(
		private app: App,
		private plugin: QuizPlugin,
		private quizService: QuizService,
		private quizStorage: QuizStorage
	) {}

	async generateAndStoreQuiz(options: QuizGenerationOptions): Promise<MCQuizDTO | undefined> {
		const activeFile = this.app.workspace.getActiveFile();
		if (!activeFile) {
			new Notice("Please open a file in the workspace first");
			return;
		}

		const content = await this.app.vault.read(activeFile);

		const quiz = await this.quizService.generateQuiz(
			content,
			options.difficulty ?? this.plugin.settings.questionDifficulty,
			options.numQuestions ?? this.plugin.settings.numberOfQuestions
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

	saveInProgressAttempt(quizId: string, attemptState: QuizAttemptState): void {
		this.quizStorage.updateQuiz(quizId, quiz => {
			const now = new Date().toISOString();

			quiz.attempt = {
				...quiz.attempt,
				inProgress: {
					startedAt: quiz.attempt?.inProgress?.startedAt ?? now,
					state: attemptState
				}
			}
		});
	}

	completeAttempt(quizId: string, scorePercent: number): void {
		this.quizStorage.updateQuiz(quizId, quiz => {
			const now = new Date().toISOString();

			quiz.attempt = {
				lastCompleted: {
					scorePercent,
					completedAt: now
				}
			}
		})
	}

	updateQuiz(
		quizId: string,
		updatedQuiz: MCQuizDTO
	): void {
		this.quizStorage.updateQuiz(quizId, quiz => {
			quiz.quiz = structuredClone(updatedQuiz);

			// Clear in progress attempts if structure changed
			if (quiz.attempt?.inProgress) quiz.attempt.inProgress = undefined;
		})
	}
}
