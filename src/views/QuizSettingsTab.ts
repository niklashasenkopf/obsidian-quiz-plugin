import {App, PluginSettingTab, Setting} from "obsidian";
import QuizPlugin, {DEFAULT_SETTINGS} from "../../main";
import {Difficulty} from "../types/Difficulty";

export class QuizSettingsTab extends PluginSettingTab {
	plugin: QuizPlugin;

	constructor(app: App, plugin: QuizPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName("OpenAI API key")
			.setDesc("Your API key is stored locally and never sent anywhere else.")
			.addText(text => {
				text
					.setPlaceholder("sk-...")
					.setValue(this.plugin.settings.openAIApiKey)
					.onChange(async (value) => {
						this.plugin.settings.openAIApiKey = value.trim();
						await this.plugin.saveSettings();
					})
					.inputEl.type = "password"
			})

		new Setting(containerEl)
			.setName('Model')
			.setDesc('GPT-Model to generate quizzes')
			.addDropdown(dropdown => {
				["gpt-4o-mini"].forEach((n) => {
					dropdown.addOption(n.toString(), n.toString());
				});
				dropdown.setValue(this.plugin.settings.model);
				dropdown.onChange(async (value) => {
					this.plugin.settings.model = value;
					await this.plugin.saveSettings();
				});
			});

		new Setting(containerEl)
			.setName('Question Difficulty')
			.setDesc('Difficulty of the generated quiz questions')
			.addDropdown(dropdown => {
				Object.values(Difficulty).forEach(value => {
					dropdown.addOption(value, value);
				});

				dropdown.setValue(this.plugin.settings.questionDifficulty);

				dropdown.onChange(async (value) => {
					this.plugin.settings.questionDifficulty = value as Difficulty;
					await this.plugin.saveSettings();
				})
			});

		new Setting(containerEl)
			.setName('Number Of Questions')
			.setDesc('Number of generated questions per quiz')
			.addDropdown(dropdown => {
				const options = Array.from({ length: 10 }, (_, i) => i + 1); // 1..10
				options.forEach(n => dropdown.addOption(n.toString(), n.toString()));

				// Ensure a valid value
				const current = this.plugin.settings.numberOfQuestions ?? DEFAULT_SETTINGS.numberOfQuestions;
				dropdown.setValue(current.toString());

				dropdown.onChange(async value => {
					const parsed = parseInt(value, 10);
					if (!isNaN(parsed)) {
						this.plugin.settings.numberOfQuestions = parsed;
						await this.plugin.saveSettings();
					}
				});
			});
	}
}
