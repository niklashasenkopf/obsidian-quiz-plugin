import {App, PluginSettingTab, Setting} from "obsidian";
import QuizPlugin from "../../main";
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
			})

		new Setting(containerEl)
			.setName('Number Of Questions')
			.setDesc('Number of generated questions per quiz')
			.addDropdown(dropdown => {
				[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].forEach((n) => {
					dropdown.addOption(n.toString(), n.toString());
				});
				dropdown.setValue(this.plugin.settings.numberOfQuestions.toString());
				dropdown.onChange(async (value) => {
					this.plugin.settings.numberOfQuestions = parseInt(value, 10);
					await this.plugin.saveSettings();
				});
			});
	}
}
