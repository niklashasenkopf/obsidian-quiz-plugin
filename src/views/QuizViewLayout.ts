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
		container.style.maxWidth = "700px";
		container.style.alignSelf = "center";

		// Header
		this.headerContainer = container.createEl("div");
		this.headerContainer.style.display = "flex";
		this.headerContainer.style.alignItems = "center";
		this.headerContainer.style.justifyContent = "space-between";
		this.headerContainer.style.padding = "0px 20px";

		this.header = this.headerContainer.createEl("h4", {
			text: "Quiz Panel",
		});

		this.goBackButton = this.headerContainer.createEl("button", {
			text: "Go back",
		});

		// Generate button
		this.generationButton = container.createEl("button", {
			text: "Generate Quiz",
		});
		this.generationButton.classList.add("mod-cta");
		this.generationButton.style.margin = "0px 20px";

		// Dashboard
		this.dashboardContainer = container.createEl("div");
		this.dashboardContainer.style.margin = "20px";

		// Quiz container
		this.quizContainer = container.createEl("div");
		this.quizContainer.style.margin = "0px 20px";
	}
}
