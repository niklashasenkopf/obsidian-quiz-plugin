import {MCQuizDTO} from "../MCQuizDTO";

export type StoredQuiz = {
	id: string;
	filePath: string;
	difficulty: string;
	createdAt: string;
	quiz: MCQuizDTO;
	progress?: {
		score: number;
		completed: boolean;
		lastAttempt?: string
	};
}

export interface QuizPluginData {
	quizzes: StoredQuiz[];
}
