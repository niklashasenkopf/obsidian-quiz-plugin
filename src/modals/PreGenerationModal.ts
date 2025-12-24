import {App, Modal, Notice, setIcon, Setting} from "obsidian";
import {Difficulty} from "../types/Difficulty";

export interface QuizGenerationOptions {
	model: string;
	difficulty: Difficulty;
	numQuestions: number
}

export class PreGenerationModal extends Modal {

	private model: string;
	private difficulty: Difficulty;
	private numQuestions: number;
	private costEl: HTMLElement;

	constructor(
		app: App,
		private initial: QuizGenerationOptions,
		private onConfirm: (options: QuizGenerationOptions) => void
	) {
		super(app)
	}

	onOpen() {
		const { contentEl } = this
		this.model = this.initial.model;
		this.difficulty = this.initial.difficulty;
		this.numQuestions = this.initial.numQuestions;

		this.setTitle("Quiz Generation");
		this.renderSettings(contentEl);
		this.renderCost(contentEl);
		this.renderDisclaimer(contentEl);
		this.renderButtons(contentEl);
	}

	onClose() {
		this.contentEl.empty();
	}

	renderButtons(contentEl: HTMLElement) {
		const buttonContainer = contentEl.createEl("div");
		buttonContainer.style.display = "flex";
		buttonContainer.style.justifyContent = "flex-end";
		buttonContainer.style.gap = "8px";
		buttonContainer.style.marginTop = "36px";

		const cancelBtn = buttonContainer.createEl("button")
		cancelBtn.onclick = () => {
			this.close();
		}
		cancelBtn.style.gap = "4px";
		setIcon(cancelBtn, "x");
		cancelBtn.createSpan({text: "Cancel"});

		const confirmBtn = buttonContainer.createEl("button");
		confirmBtn.onclick = () => {
			this.onConfirm({
				model: this.model,
				difficulty: this.difficulty,
				numQuestions: this.numQuestions
			})
			this.close()
		}
		setIcon(confirmBtn, "bot");
		confirmBtn.createSpan({ text: "Generate" });
		confirmBtn.style.gap = "4px";
		confirmBtn.style.backgroundColor = "var(--color-purple)";
	}

	renderSettings(contentEl: HTMLElement) {
		new Setting(contentEl)
			.setName("Model")
			.addDropdown(d => {
				["gpt-4o-mini", "gpt-4o"].forEach(m =>
					d.addOption(m, m)
				);
				d.setValue(this.model);
				d.onChange(v => {
					this.model = v;
					this.updateCostEstimate();
				});
			});

		new Setting(contentEl)
			.setName("Difficulty")
			.addDropdown(d => {
				Object.values(Difficulty).forEach(diff =>
					d.addOption(diff, diff)
				);
				d.setValue(this.difficulty);
				d.onChange(v => {
					this.difficulty = v as Difficulty;
				});
			});

		new Setting(contentEl)
			.setName("Number of questions")
			.addSlider(slider => {
				slider
					.setLimits(1, 10, 1)
					.setValue(this.numQuestions)
					.setDynamicTooltip()
					.onChange(v => {
						this.numQuestions = v;
						this.updateCostEstimate();
					});
			});
	}

	renderCost(contentEl: HTMLElement) {
		this.costEl = contentEl.createEl("div", { cls: "quiz-cost-estimate" });
		this.costEl.style.marginTop = "16px";
		this.updateCostEstimate();
	}

	async updateCostEstimate() {
		if (!this.costEl) return;

		const activeFile = this.app.workspace.getActiveFile();
		if (!activeFile) {
			new Notice("Please open a file in the workspace first");
			return;
		}

		const content = await this.app.vault.read(activeFile);

		const tokens = this.estimateTotalTokens(content);
		const cost = this.estimateCostUSD(tokens);

		this.costEl.setText(
			`Estimated usage: ~${tokens.toLocaleString()} tokens (~$${cost.toFixed(4)} USD)`
		);
	}

	MODEL_PRICING: Record<string, number> = {
		"gpt-4o-mini": 0.00015 / 1000, // $ per token
		"gpt-4o": 0.005 / 1000,
	};

	private estimateCostUSD(tokens: number): number {
		const pricePerToken = this.MODEL_PRICING[this.model] ?? 0;
		return tokens * pricePerToken;
	}

	renderDisclaimer(contentEl: HTMLElement) {
		const disclaimer = contentEl.createEl("div");
		disclaimer.style.marginTop = "12px";
		disclaimer.style.fontSize = "0.9em";
		disclaimer.style.color = "var(--text-muted)";

		disclaimer.setText(
			"This action will call the OpenAI API using your personal API key. " +
			"Any costs incurred will be billed directly to your OpenAI account."
		);
	}

	private estimateTotalTokens(fileContent: string): number {
		const systemPromptTokens = 250;
		const instructionTokens = 200;

		const fileTokens = this.estimateTokensFromText(fileContent);

		const outputTokensPerQuestion = 180;
		const outputTokens = this.numQuestions * outputTokensPerQuestion;

		return (
			systemPromptTokens +
			instructionTokens +
			fileTokens +
			outputTokens
		);
	}

	private estimateTokensFromText(text: string): number {
		return Math.ceil(text.length / 4);
	}



}
