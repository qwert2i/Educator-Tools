import { SceneManager } from "../scene-manager";
import { ActionUIScene } from "../ui-scene";
import { Player, world } from "@minecraft/server";

const SceneName = "set_gamemode";

export class SetGamemodeScene extends ActionUIScene {
	constructor(sceneManager: SceneManager) {
		sceneManager.addToSceneHistory(SceneName);

		// Create the scene
		super("set_gamemode", sceneManager.getSourcePlayer());
		const [SUBJECT_PLAYER_TYPE, OPTIONS]: [
			string | null,
			string | Player | null,
		] = sceneManager.getSubjectPlayersType();

		if (SUBJECT_PLAYER_TYPE == "self") {
			this.setRawBody([
				{
					translate: "edu_tools.ui.set_gamemode.self.body",
				},
				{
					text: " §9",
				},
				{
					text: sceneManager.getSourcePlayer().name,
				},
				{
					text: " §r",
				},
				{
					translate: "edu_tools.ui.set_gamemode.self.body2",
				},
			]);
		} else if (SUBJECT_PLAYER_TYPE == "all") {
			this.setRawBody([
				{
					translate: "edu_tools.ui.set_gamemode.all.body",
				},
			]);
		} else if (SUBJECT_PLAYER_TYPE == "specific_player") {
			this.setRawBody([
				{
					translate: "edu_tools.ui.set_gamemode.specific.body",
				},
				{
					text: " §9",
				},
				{
					text: (OPTIONS as Player).name,
				},
				{
					text: " §r",
				},
				{
					translate: "edu_tools.ui.set_gamemode.specific.body2",
				},
			]);
		}

		this.addButton(
			"edu_tools.ui.set_gamemode.buttons.survival",
			(): void => {
				let [selectedPlayersType, options]: [
					string | null,
					string | Player | null,
				] = sceneManager.getSubjectPlayersType();

				switch (selectedPlayersType) {
					case "self":
						let player: Player = sceneManager.getSourcePlayer();

						player.runCommand("gamemode survival");
						const configSelfSurvival = {
							title: "confirm.gamemode",
							body: "edu_tools.ui.confirm.gamemode.self.body",
							buttons: [
								{
									label: "edu_tools.ui.buttons.continue",
									handler: () => sceneManager.openScene("main"),
								},
								{ label: "edu_tools.ui.buttons.exit", handler: () => {} },
							],
						};
						sceneManager.openScene("confirm", configSelfSurvival);
						break;
					case "all":
						const sourcePlayer: Player = sceneManager.getSourcePlayer();

						world.getPlayers().forEach((player: Player) => {
							if (player !== sourcePlayer) {
								player.runCommand("gamemode survival");
							}
						});
						const configAllSurvival = {
							title: "confirm.gamemode",
							body: "edu_tools.ui.confirm.gamemode.all.body",
							buttons: [
								{
									label: "edu_tools.ui.buttons.continue",
									handler: () => sceneManager.openScene("main"),
								},
								{ label: "edu_tools.ui.buttons.exit", handler: () => {} },
							],
						};
						sceneManager.openScene("confirm", configAllSurvival);
						break;
					case "specific_player":
						const specificPlayer: Player = options as Player;

						specificPlayer.runCommand("gamemode survival");
						const configSpecificSurvival = {
							title: "confirm.gamemode",
							body: "edu_tools.ui.confirm.gamemode.specific.body",
							buttons: [
								{
									label: "edu_tools.ui.buttons.continue",
									handler: () => sceneManager.openScene("main"),
								},
								{ label: "edu_tools.ui.buttons.exit", handler: () => {} },
							],
						};
						sceneManager.openScene("confirm", configSpecificSurvival);
						break;
				}
			},
			"textures/edu_tools/ui/icons/set_gamemode/survival",
		);
		this.addButton(
			"edu_tools.ui.set_gamemode.buttons.adventure",
			(): void => {
				let [selectedPlayersType, options]: [
					string | null,
					string | Player | null,
				] = sceneManager.getSubjectPlayersType();

				switch (selectedPlayersType) {
					case "self":
						let player: Player = sceneManager.getSourcePlayer();

						player.runCommand("gamemode adventure");
						const configSelfAdventure = {
							title: "confirm.gamemode",
							body: "edu_tools.ui.confirm.gamemode.self.body",
							buttons: [
								{
									label: "edu_tools.ui.buttons.continue",
									handler: () => sceneManager.openScene("main"),
								},
								{ label: "edu_tools.ui.buttons.exit", handler: () => {} },
							],
						};
						sceneManager.openScene("confirm", configSelfAdventure);
						break;
					case "all":
						const sourcePlayer: Player = sceneManager.getSourcePlayer();

						world.getPlayers().forEach((player: Player) => {
							if (player !== sourcePlayer) {
								player.runCommand("gamemode adventure");
							}
						});
						const configAllAdventure = {
							title: "confirm.gamemode",
							body: "edu_tools.ui.confirm.gamemode.all.body",
							buttons: [
								{
									label: "edu_tools.ui.buttons.continue",
									handler: () => sceneManager.openScene("main"),
								},
								{ label: "edu_tools.ui.buttons.exit", handler: () => {} },
							],
						};
						sceneManager.openScene("confirm", configAllAdventure);
						break;
					case "specific_player":
						const specificPlayer: Player = options as Player;

						specificPlayer.runCommand("gamemode adventure");
						const configSpecificAdventure = {
							title: "confirm.gamemode",
							body: "edu_tools.ui.confirm.gamemode.specific.body",
							buttons: [
								{
									label: "edu_tools.ui.buttons.continue",
									handler: () => sceneManager.openScene("main"),
								},
								{ label: "edu_tools.ui.buttons.exit", handler: () => {} },
							],
						};
						sceneManager.openScene("confirm", configSpecificAdventure);
						break;
				}
			},
			"textures/edu_tools/ui/icons/set_gamemode/adventure",
		);
		this.addButton(
			"edu_tools.ui.set_gamemode.buttons.creative",
			(): void => {
				let [selectedPlayersType, options]: [
					string | null,
					string | Player | null,
				] = sceneManager.getSubjectPlayersType();

				switch (selectedPlayersType) {
					case "self":
						let player: Player = sceneManager.getSourcePlayer();

						player.runCommand("gamemode creative");
						const configSelfCreative = {
							title: "confirm.gamemode",
							body: "edu_tools.ui.confirm.gamemode.self.body",
							buttons: [
								{
									label: "edu_tools.ui.buttons.continue",
									handler: () => sceneManager.openScene("main"),
								},
								{ label: "edu_tools.ui.buttons.exit", handler: () => {} },
							],
						};
						sceneManager.openScene("confirm", configSelfCreative);
						break;
					case "all":
						const sourcePlayer: Player = sceneManager.getSourcePlayer();

						world.getPlayers().forEach((player: Player) => {
							if (player !== sourcePlayer) {
								player.runCommand("gamemode creative");
							}
						});
						const configAllCreative = {
							title: "confirm.gamemode",
							body: "edu_tools.ui.confirm.gamemode.all.body",
							buttons: [
								{
									label: "edu_tools.ui.buttons.continue",
									handler: () => sceneManager.openScene("main"),
								},
								{ label: "edu_tools.ui.buttons.exit", handler: () => {} },
							],
						};
						sceneManager.openScene("confirm", configAllCreative);
						break;
					case "specific_player":
						const specificPlayer: Player = options as Player;

						specificPlayer.runCommand("gamemode creative");
						const configSpecificCreative = {
							title: "confirm.gamemode",
							body: "edu_tools.ui.confirm.gamemode.specific.body",
							buttons: [
								{
									label: "edu_tools.ui.buttons.continue",
									handler: () => sceneManager.openScene("main"),
								},
								{ label: "edu_tools.ui.buttons.exit", handler: () => {} },
							],
						};
						sceneManager.openScene("confirm", configSpecificCreative);
						break;
				}
			},
			"textures/edu_tools/ui/icons/set_gamemode/creative",
		);

		this.show(sceneManager.getSourcePlayer());
	}
}
