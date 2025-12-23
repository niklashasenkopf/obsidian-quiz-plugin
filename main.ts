import {Plugin, WorkspaceLeaf} from 'obsidian';
import {QUIZ_VIEW, QuizView} from "./src/views/QuizView";
import {Difficulty} from "./src/types/Difficulty";
import {QuizSettingsTab} from "./src/views/QuizSettingsTab";
import {QuizStorage} from "./src/logic/QuizStorage";
import {QuizController} from "./src/controllers/QuizController";
import {QuizService} from "./src/services/QuizService";

interface QuizPluginSettings {
	questionDifficulty: Difficulty;
	numberOfQuestions: number
}

const DEFAULT_SETTINGS: QuizPluginSettings = {
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

		this.quizController = new QuizController(
			this.app,
			this,
			new QuizService("http://localhost:8080"),
			this.storage
		)

		this.registerView(
			QUIZ_VIEW,
			(leaf) => new QuizView(leaf, this.quizController)
		);

		this.addSettingTab(new QuizSettingsTab(this.app, this));

		this.addRibbonIcon('dice', 'Activate View', () => {
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


