export type QuizAttemptState = {
	currentQuestionIndex: number;
	answers: Record<number, {
		selectedIndex: number | null;
		checked: boolean
	}>
}
