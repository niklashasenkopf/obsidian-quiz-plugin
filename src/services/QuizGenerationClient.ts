import {OpenAI} from "openai";
import {Notice} from "obsidian";
import {zodTextFormat} from "openai/helpers/zod";
import type {ZodType} from "zod";

export class QuizGenerationClient {
	private client: OpenAI

	constructor(apiKey: string) {
		if (!apiKey) {
			new Notice("OpenAI API key is missing")
			throw new Error("OpenAI API key is missing")
		}

		this.client = new OpenAI({
			apiKey,
			dangerouslyAllowBrowser: true
		});
	}

	async generateJson<T>(
		model: string,
		systemPrompt: string,
		userPrompt: string,
		schema: ZodType<T>
	): Promise<T> {
		const response = await this.client.responses.parse({
			model,
			input: [
				{ role: "system", content: systemPrompt },
				{ role: "user", content: userPrompt }
			],
			text: {
				format: zodTextFormat(schema, "quiz"),
			}
		});

		if(!response.output_parsed) {
			throw new Error("Failed to parse structured response from OpenAI-API")
		}
		return response.output_parsed as T;
	}
}
