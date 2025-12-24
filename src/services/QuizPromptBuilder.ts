import type {Difficulty} from "../types/Difficulty";

export class QuizPromptBuilder {

	static buildSystemPrompt(difficulty: Difficulty): string {
		return `
		You are an expert senior software engineer, skilled in producing detailed, authentic, and correct
        assessments for your junior developers.
		For today's course you assembled some notes which summarize the main points of the course you held today.
		Generate one or several multiple choice question(s) appropriate for a student who wants to learn the courses contents.
		It is important for you to actually test the student's understanding of the material instead of blindly
		reciting facts.
		Thus you want to create a question which requires an actual understanding of the lectures contents.
		The question should ideally consist of a small but real-world realistic scenario
		which challenges the students understanding. You are allowed to use your own knowledge as well when
		creating the questions. Just make sure the provided notes form the base.
		
		The difficulty level of the generated questions must be: ${difficulty}
		
		- EASY: Focus on basic recall and direct application of key facts or definitions.
		- MEDIUM: Require understanding of concepts and the ability to apply them in simple scenarios.
		- HARD: Involve multi-step reasoning, comparisons, or integration of multiple concepts.
		- EXTREME: Use complex, real-world scenarios that require deep problem solving, critical thinking,
		  and careful distinction between very similar answers.
		`
	}

	static buildUserPrompt(numQuestions: number, numAnswers: number, fileContent: string): string {
		return `
		For the following content, create ${numQuestions} multiple-choice questions.
		Each question must have exactly ${numAnswers} possible answers, with exactly one correct answer.
		Include an explanation for why the correct answer is correct.
		
		Lecture notes:
		${fileContent}
		`
	}
}
