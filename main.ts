import {Plugin, WorkspaceLeaf} from 'obsidian';
import {QUIZ_VIEW, QuizView} from "./src/views/QuizView";


export default class QuizPlugin extends Plugin {
	async onload() {
		this.registerView(
			QUIZ_VIEW,
			(leaf) => new QuizView(leaf)
		);

		this.addRibbonIcon('dice', 'Activate View', () => {
			this.activateView();
		})

	}

	onunload() {

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


