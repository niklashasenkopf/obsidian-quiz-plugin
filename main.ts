import type { WorkspaceLeaf} from 'obsidian';
import {Plugin} from 'obsidian';
import {QUIZ_VIEW, QuizView} from "./src/views/QuizView";
import {Difficulty} from "./src/types/Difficulty";
import {QuizSettingsTab} from "./src/views/QuizSettingsTab";
import {QuizStorage} from "./src/logic/QuizStorage";
import {QuizController} from "./src/controllers/QuizController";
import {QuizService} from "./src/services/QuizService";

export interface QuizPluginSettings {
	openAIApiKey: string,
	model: string,
	questionDifficulty: Difficulty;
	numberOfQuestions: number
}

export const DEFAULT_SETTINGS: QuizPluginSettings = {
	openAIApiKey: "",
	model: "gpt-4o-mini",
	questionDifficulty: Difficulty.EXTREME,
	numberOfQuestions: 5
}


export default class QuizPlugin extends Plugin {
	settings: QuizPluginSettings
	storage: QuizStorage
	quizController: QuizController

	async onload() {
		await this.loadSettings();
		this.storage = new QuizStorage(this);
		await this.storage.load();

		const apiKey = this.settings.openAIApiKey;
		const model = this.settings.model;

		this.quizController = new QuizController(
			this.app,
			this,
			new QuizService(apiKey, model),
			this.storage
		)

		this.registerView(
			QUIZ_VIEW,
			(leaf) => new QuizView(leaf, this.quizController, this.settings)
		);

		this.addSettingTab(new QuizSettingsTab(this.app, this));

		this.addRibbonIcon('wallet-cards', 'Show quiz panel', () => {
			this.activateView();
		})

	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	async activateView() {
		const { workspace } = this.app;

		let leaf: WorkspaceLeaf | null;
		const leaves = workspace.getLeavesOfType(QUIZ_VIEW);

		if (leaves.length > 0) {
			// A leaf with our view already exists, use that
			leaf = leaves[0];
		} else {
			// Our view could not be found in the workspace, create a new leaf in the right sidebar for it
			leaf = workspace.getRightLeaf(false);
			await leaf?.setViewState({ type: QUIZ_VIEW, active: true });
		}

		if (leaf) await workspace.revealLeaf(leaf);
	}
}


