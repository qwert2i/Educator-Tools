import { SceneManager } from "../scene_manager/scene-manager";
import { ActionUIScene } from "../scene_manager/ui-scene";
import { GamemodeService } from "./gamemode.service";
import { Team } from "../teams/interfaces/team.interface";
import { SceneContext } from "../scene_manager/scene-context";

export class SetGamemodeScene extends ActionUIScene {
	public static readonly id = "set_gamemode";
	private gamemodeService: GamemodeService;

	constructor(sceneManager: SceneManager, context: SceneContext) {
		// Add the current scene to the context history
		context.addToHistory(SetGamemodeScene.id);

		// Create the scene
		super(SetGamemodeScene.id, context.getSourcePlayer());
		this.context = context;

		// Get the gamemode service
		this.gamemodeService = sceneManager.getModule<GamemodeService>(
			GamemodeService.id,
		)!;

		// Get the target team
		const subjectTeam = context.getSubjectTeam();

		if (!subjectTeam) {
			// If no team is selected, show an error message
			this.setRawBody([
				{
					translate: "edu_tools.ui.set_gamemode.no_team_selected",
				},
			]);

			// Add a single button to go back
			this.addButton("edu_tools.ui.buttons.back", (): void => {
				sceneManager.goBack(context);
			});
		} else {
			// Team is selected, show the gamemode options
			this.setRawBody([
				{
					translate: "edu_tools.ui.set_gamemode.team.body",
				},
				{
					text: " §9",
				},
				{
					text: subjectTeam.name,
				},
				{
					text: " §r",
				},
				{
					translate: "edu_tools.ui.set_gamemode.team.body2",
				},
			]);

			// Add gamemode buttons
			this.addGamemodeButtons(sceneManager, subjectTeam);
		}

		// Pass the context to the scene to handle navigation
		this.setContext(context);
		this.show(context.getSourcePlayer(), sceneManager);
	}

	private addGamemodeButtons(
		sceneManager: SceneManager,
		subjectTeam: Team,
	): void {
		// Survival Button
		this.addButton(
			"edu_tools.ui.set_gamemode.buttons.survival",
			(): void => {
				this.applyGamemode("survival", sceneManager, subjectTeam);
			},
			"textures/edu_tools/ui/icons/set_gamemode/survival",
		);

		// Adventure Button
		this.addButton(
			"edu_tools.ui.set_gamemode.buttons.adventure",
			(): void => {
				this.applyGamemode("adventure", sceneManager, subjectTeam);
			},
			"textures/edu_tools/ui/icons/set_gamemode/adventure",
		);

		// Creative Button
		this.addButton(
			"edu_tools.ui.set_gamemode.buttons.creative",
			(): void => {
				this.applyGamemode("creative", sceneManager, subjectTeam);
			},
			"textures/edu_tools/ui/icons/set_gamemode/creative",
		);
	}

	private applyGamemode(
		gamemode: string,
		sceneManager: SceneManager,
		subjectTeam: Team,
	): void {
		// Apply gamemode to team
		this.gamemodeService.setTeamGamemode(subjectTeam, gamemode);

		const configTeam = {
			title: "confirm.gamemode",
			body: "edu_tools.ui.confirm.gamemode.team.body",
			buttons: [
				{
					label: "edu_tools.ui.buttons.continue",
					handler: (context: SceneContext, manager: SceneManager) => {
						manager.openSceneWithContext(context, "main");
					},
				},
				{
					label: "edu_tools.ui.buttons.exit",
					handler: () => {},
				},
			],
		};
		sceneManager.openSceneWithContext(this.context!, "confirm", configTeam);
	}
}
