import {MCQuizDTO} from "../types/MCQuizDTO";

export class QuizService {
	constructor(private baseUrl: string) {}

	async generateQuiz(
		filename: string,
		content: string,
		difficulty: string,
		numQuestions: number
	): Promise<MCQuizDTO> {
		const formData: FormData = new FormData();
		formData.append("file", new Blob([content], {type: "text/markdown"}), filename);
		formData.append("difficulty", difficulty);
		formData.append("numQuestions", numQuestions.toString());


		const result = await fetch(`${this.baseUrl}/mcQuestion/createQuiz`, {
			method: "POST",
			body: formData
		});

		if (!result.ok) {
			throw new Error(result.statusText);
		}

		return (await result.json()) as MCQuizDTO;
	}
}
