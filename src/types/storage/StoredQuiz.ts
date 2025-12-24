import type {MCQuizDTO} from "../MCQuizDTO";
import type {QuizAttemptState} from "../QuizAttemptState";

export type StoredQuiz = {
	id: string;
	filePath: string;
	difficulty: string;
	createdAt: string;
	quiz: MCQuizDTO;
	attempt?: {
		lastCompleted?: {
			scorePercent: number;
			completedAt: string;
		},
		inProgress?: {
			startedAt: string;
			state: QuizAttemptState;
		}
	};
}

export interface QuizPluginData {
	quizzes: StoredQuiz[];
}

