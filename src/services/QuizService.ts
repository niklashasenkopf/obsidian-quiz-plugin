import {QuizGenerationClient} from "./QuizGenerationClient";
import {QuizPromptBuilder} from "./QuizPromptBuilder";
import {Difficulty} from "../types/Difficulty";
import {MCQuizSchema} from "../ai/MCQuizSchema";
import {MCQuizDTO} from "../ai/MCQuizSchema";

export class QuizService {

	private client: QuizGenerationClient;

	constructor(
		apiKey: string,
		private model: string
	) {
		this.client = new QuizGenerationClient(apiKey);
	}

	async generateQuiz(
		content: string,
		difficulty: Difficulty,
		numQuestions: number
	): Promise<MCQuizDTO> {

		const systemPrompt = QuizPromptBuilder.buildSystemPrompt(difficulty);
		const userPrompt = QuizPromptBuilder.buildUserPrompt(numQuestions, 4, content);

		return await this.client.generateJson(
			this.model,
			systemPrompt,
			userPrompt,
			MCQuizSchema
		)
	}
}
