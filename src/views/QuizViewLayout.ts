export class QuizViewLayout {
	container: HTMLElement;
	headerContainer: HTMLElement;
	header: HTMLElement;
	generationButton: HTMLButtonElement;
	goBackButton: HTMLButtonElement;
	dashboardContainer: HTMLElement;
	quizContainer: HTMLElement;

	constructor(container: HTMLElement) {
		this.container = container;
		container.empty();
		container.setCssProps({
			"max-width": "700px",
			"align-self": "center"
		})

		// Header
		this.headerContainer
			= container.createEl("div", { cls: ["flex-align-center", "flex-justify-between", "p-sides-20"]});

		this.header = this.headerContainer.createEl("h4", {
			text: "Quiz panel",
		});

		this.goBackButton = this.headerContainer.createEl("button", {
			text: "Go back",
		});

		// Generate button
		this.generationButton = container.createEl("button", {
			text: "Generate quiz",
			cls: ["mod-cta", "m-sides-20"]
		});

		// Dashboard
		this.dashboardContainer = container.createEl("div", { cls: "m-20"});

		// Quiz container
		this.quizContainer = container.createEl("div", { cls: "m-sides-20" });
	}
}
