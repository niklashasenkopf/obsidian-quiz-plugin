import {z} from "zod";

export const MCQuizSchema = z.object({
	questions: z.array(
		z.object({
			question: z.string(),
			possibleAnswers: z.array(z.string()),
			correctAnswerIndex: z.number().int(),
			explanation: z.string()
		})
	)
})

export type MCQuizDTO = z.infer<typeof MCQuizSchema>;
