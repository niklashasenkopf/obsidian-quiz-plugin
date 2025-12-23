import QuizPlugin from "../../main";
import {QuizPluginData, StoredQuiz} from "../types/storage/StoredQuiz";
import {MCQuizDTO} from "../types/MCQuizDTO";

export class QuizStorage {
	private plugin: QuizPlugin;
	private data: QuizPluginData;

	constructor(plugin: QuizPlugin) {
		this.plugin = plugin;
		this.data = { quizzes: []}
	}

	async load(): Promise<void> {
		this.data = (await this.plugin.loadData()) ?? { quizzes: [] }
	}

	async save(): Promise<void> {
		await this.plugin.saveData(this.data);
	}

	getQuizzesForFile(filePath: string): StoredQuiz[] {
		return this.data.quizzes.filter(q => q.filePath === filePath);
	}

	addQuiz(filePath: string, quiz: MCQuizDTO, difficulty: string): StoredQuiz {
		const stored: StoredQuiz = {
			id: new Date().toISOString(),
			filePath,
			difficulty,
			createdAt: new Date().toISOString(),
			quiz,
		};
		this.data.quizzes.push(stored);
		this.save();
		return stored;
	}

	uploadQuizProgress(id: string, scoreInPercent: number, completed: boolean): void {
		const quiz = this.data.quizzes.find(q => q.id === id);
		if (!quiz) return;
		quiz.progress = {
			score: scoreInPercent,
			completed: completed,
			lastAttempt: new Date().toISOString()
		}
	}
}
