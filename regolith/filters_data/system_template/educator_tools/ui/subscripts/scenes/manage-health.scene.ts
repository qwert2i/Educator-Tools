import { SceneManager } from "../scene-manager";
import { ActionUIScene } from "../ui-scene";
import {
	EffectType,
	EffectTypes,
	EntityHealthComponent,
	Player,
	world,
} from "@minecraft/server";

const SceneName = "manage_health";

export class ManageHealthScene extends ActionUIScene {
	constructor(sceneManager: SceneManager) {
		sceneManager.addToSceneHistory(SceneName);

		// Create the scene
		super("manage_health", sceneManager.getSourcePlayer());
		const [SUBJECT_PLAYER_TYPE, OPTIONS]: [
			string | null,
			string | Player | null,
		] = sceneManager.getSubjectPlayersType();

		let player: Player | null = null;
		if (SUBJECT_PLAYER_TYPE == "self") {
			this.setRawBody([
				{
					translate: "edu_tools.ui.manage_health.self.body",
				},
				{
					text: " §9",
				},
				{
					text: sceneManager.getSourcePlayer().name,
				},
			]);
			player = sceneManager.getSourcePlayer();
		} else if (SUBJECT_PLAYER_TYPE == "all") {
			this.setRawBody([
				{
					translate: "edu_tools.ui.manage_health.all.body",
				},
			]);
		} else if (SUBJECT_PLAYER_TYPE == "specific_player") {
			this.setRawBody([
				{
					translate: "edu_tools.ui.manage_health.specific.body",
				},
				{
					text: " §9",
				},
				{
					text: (OPTIONS as Player).name,
				},
			]);
			player = OPTIONS as Player;
		}

		// Add button to heal players
		this.addButton(
			"edu_tools.ui.manage_health.buttons.heal",
			(): void => {
				let [selectedPlayersType, options]: [
					string | null,
					string | Player | null,
				] = sceneManager.getSubjectPlayersType();

				switch (selectedPlayersType) {
					case "self":
						let player: Player = sceneManager.getSourcePlayer();
						const configSelfHeal = {
							title: "confirm.manage_health.heal",
							body: "edu_tools.ui.confirm.manage_health.self.heal.body",
							buttons: [
								{
									label: "edu_tools.ui.buttons.continue",
									handler: () => {
										const health = player.getComponent(
											EntityHealthComponent.componentId,
										) as EntityHealthComponent;
										if (health) {
											health.resetToMaxValue();
										}
										player.addEffect("saturation", 30, {
											showParticles: false,
											amplifier: 10,
										});
										sceneManager.openScene("main");
									},
								},
								{
									label: "edu_tools.ui.buttons.exit",
									handler: () => {},
								},
							],
						};
						sceneManager.openScene("confirm", configSelfHeal);
						break;
					case "all":
						const configAllHeal = {
							title: "confirm.manage_health.heal",
							body: "edu_tools.ui.confirm.manage_health.all.heal.body",
							buttons: [
								{
									label: "edu_tools.ui.buttons.continue",
									handler: () => {
										world.getPlayers().forEach((player: Player) => {
											const health = player.getComponent(
												EntityHealthComponent.componentId,
											) as EntityHealthComponent;
											if (health) {
												health.resetToMaxValue();
											}
											player.addEffect("saturation", 30, {
												showParticles: false,
												amplifier: 10,
											});
										});
										sceneManager.openScene("main");
									},
								},
								{
									label: "edu_tools.ui.buttons.exit",
									handler: () => {},
								},
							],
						};
						sceneManager.openScene("confirm", configAllHeal);
						break;
					case "specific_player":
						const configSpecificHeal = {
							title: "confirm.manage_health.heal",
							body: "edu_tools.ui.confirm.manage_health.specific.heal.body",
							buttons: [
								{
									label: "edu_tools.ui.buttons.continue",
									handler: () => {
										const specificPlayer: Player = options as Player;
										const health = specificPlayer.getComponent(
											EntityHealthComponent.componentId,
										) as EntityHealthComponent;
										if (health) {
											health.resetToMaxValue();
										}
										specificPlayer.addEffect("saturation", 30, {
											showParticles: false,
											amplifier: 10,
										});
										sceneManager.openScene("main");
									},
								},
								{
									label: "edu_tools.ui.buttons.exit",
									handler: () => {},
								},
							],
						};
						sceneManager.openScene("confirm", configSpecificHeal);
						break;
				}
			},
			"textures/edu_tools/ui/icons/manage_health/heal",
		);

		const hasDisabledHealth =
			(player?.getEffect("regeneration")?.duration || 0) > 100000;

		if (!player || !hasDisabledHealth) {
			// Add button to disable health
			this.addButton(
				"edu_tools.ui.manage_health.buttons.disable_health",
				(): void => {
					let [selectedPlayersType, options]: [
						string | null,
						string | Player | null,
					] = sceneManager.getSubjectPlayersType();

					switch (selectedPlayersType) {
						case "self":
							let player: Player = sceneManager.getSourcePlayer();
							const configSelfDisableHealth = {
								title: "confirm.manage_health.disable_health",
								body: "edu_tools.ui.confirm.manage_health.self.disable_health.body",
								buttons: [
									{
										label: "edu_tools.ui.buttons.continue",
										handler: () => {
											player.addEffect("regeneration", 1000000, {
												showParticles: false,
												amplifier: 10,
											});
											sceneManager.openScene("main");
										},
									},
									{
										label: "edu_tools.ui.buttons.exit",
										handler: () => {},
									},
								],
							};
							sceneManager.openScene("confirm", configSelfDisableHealth);
							break;
						case "all":
							const configAllDisableHealth = {
								title: "confirm.manage_health.disable_health",
								body: "edu_tools.ui.confirm.manage_health.all.disable_health.body",
								buttons: [
									{
										label: "edu_tools.ui.buttons.continue",
										handler: () => {
											world.getPlayers().forEach((player: Player) => {
												player.addEffect("regeneration", 1000000, {
													showParticles: false,
													amplifier: 10,
												});
											});
											sceneManager.openScene("main");
										},
									},
									{
										label: "edu_tools.ui.buttons.exit",
										handler: () => {},
									},
								],
							};
							sceneManager.openScene("confirm", configAllDisableHealth);
							break;
						case "specific_player":
							const configSpecificDisableHealth = {
								title: "confirm.manage_health.disable_health",
								body: "edu_tools.ui.confirm.manage_health.specific.disable_health.body",
								buttons: [
									{
										label: "edu_tools.ui.buttons.continue",
										handler: () => {
											const specificPlayer: Player = options as Player;

											specificPlayer.addEffect("regeneration", 1000000, {
												showParticles: false,
												amplifier: 10,
											});
											sceneManager.openScene("main");
										},
									},
									{
										label: "edu_tools.ui.buttons.exit",
										handler: () => {},
									},
								],
							};
							sceneManager.openScene("confirm", configSpecificDisableHealth);
							break;
					}
				},
				"textures/edu_tools/ui/icons/manage_health/disable_health",
			);
		}
		if (!player || hasDisabledHealth) {
			// Add button to enable health
			this.addButton(
				"edu_tools.ui.manage_health.buttons.enable_health",
				(): void => {
					let [selectedPlayersType, options]: [
						string | null,
						string | Player | null,
					] = sceneManager.getSubjectPlayersType();

					switch (selectedPlayersType) {
						case "self":
							let player: Player = sceneManager.getSourcePlayer();
							const configSelfEnableHealth = {
								title: "confirm.manage_health.enable_health",
								body: "edu_tools.ui.confirm.manage_health.self.enable_health.body",
								buttons: [
									{
										label: "edu_tools.ui.buttons.continue",
										handler: () => {
											player.removeEffect("regeneration");
											sceneManager.openScene("main");
										},
									},
									{
										label: "edu_tools.ui.buttons.exit",
										handler: () => {},
									},
								],
							};
							sceneManager.openScene("confirm", configSelfEnableHealth);
							break;
						case "all":
							const configAllEnableHealth = {
								title: "confirm.manage_health.enable_health",
								body: "edu_tools.ui.confirm.manage_health.all.enable_health.body",
								buttons: [
									{
										label: "edu_tools.ui.buttons.continue",
										handler: () => {
											world.getPlayers().forEach((player: Player) => {
												player.removeEffect("regeneration");
											});
											sceneManager.openScene("main");
										},
									},
									{
										label: "edu_tools.ui.buttons.exit",
										handler: () => {},
									},
								],
							};
							sceneManager.openScene("confirm", configAllEnableHealth);
							break;
						case "specific_player":
							const configSpecificEnableHealth = {
								title: "confirm.manage_health.enable_health",
								body: "edu_tools.ui.confirm.manage_health.specific.enable_health.body",
								buttons: [
									{
										label: "edu_tools.ui.buttons.continue",
										handler: () => {
											const specificPlayer: Player = options as Player;
											specificPlayer.removeEffect("regeneration");
											sceneManager.openScene("main");
										},
									},
									{
										label: "edu_tools.ui.buttons.exit",
										handler: () => {},
									},
								],
							};
							sceneManager.openScene("confirm", configSpecificEnableHealth);
							break;
					}
				},
				"textures/edu_tools/ui/icons/manage_health/enable_health",
			);
		}

		const hasDisabledHunger =
			(player?.getEffect("saturation")?.duration || 0) > 100000;

		if (!player || !hasDisabledHunger) {
			// Add button to disable hunger
			this.addButton(
				"edu_tools.ui.manage_health.buttons.disable_hunger",
				(): void => {
					let [selectedPlayersType, options]: [
						string | null,
						string | Player | null,
					] = sceneManager.getSubjectPlayersType();

					switch (selectedPlayersType) {
						case "self":
							let player: Player = sceneManager.getSourcePlayer();
							const configSelfDisableHunger = {
								title: "confirm.manage_health.disable_hunger",
								body: "edu_tools.ui.confirm.manage_health.self.disable_hunger.body",
								buttons: [
									{
										label: "edu_tools.ui.buttons.continue",
										handler: () => {
											player.addEffect("saturation", 1000000, {
												showParticles: false,
												amplifier: 10,
											});
											sceneManager.openScene("main");
										},
									},
									{
										label: "edu_tools.ui.buttons.exit",
										handler: () => {},
									},
								],
							};
							sceneManager.openScene("confirm", configSelfDisableHunger);
							break;
						case "all":
							const configAllDisableHunger = {
								title: "confirm.manage_health.disable_hunger",
								body: "edu_tools.ui.confirm.manage_health.all.disable_hunger.body",
								buttons: [
									{
										label: "edu_tools.ui.buttons.continue",
										handler: () => {
											world.getPlayers().forEach((player: Player) => {
												player.addEffect("saturation", 1000000, {
													showParticles: false,
													amplifier: 10,
												});
											});
											sceneManager.openScene("main");
										},
									},
									{
										label: "edu_tools.ui.buttons.exit",
										handler: () => {},
									},
								],
							};
							sceneManager.openScene("confirm", configAllDisableHunger);
							break;
						case "specific_player":
							const configSpecificDisableHunger = {
								title: "confirm.manage_health.disable_hunger",
								body: "edu_tools.ui.confirm.manage_health.specific.disable_hunger.body",
								buttons: [
									{
										label: "edu_tools.ui.buttons.continue",
										handler: () => {
											const specificPlayer: Player = options as Player;
											specificPlayer.addEffect("saturation", 1000000, {
												showParticles: false,
												amplifier: 10,
											});
											sceneManager.openScene("main");
										},
									},
									{
										label: "edu_tools.ui.buttons.exit",
										handler: () => {},
									},
								],
							};
							sceneManager.openScene("confirm", configSpecificDisableHunger);
							break;
					}
				},
				"textures/edu_tools/ui/icons/manage_health/disable_hunger",
			);
		}

		if (!player || hasDisabledHunger) {
			// Add button to enable hunger
			this.addButton(
				"edu_tools.ui.manage_health.buttons.enable_hunger",
				(): void => {
					let [selectedPlayersType, options]: [
						string | null,
						string | Player | null,
					] = sceneManager.getSubjectPlayersType();

					switch (selectedPlayersType) {
						case "self":
							let player: Player = sceneManager.getSourcePlayer();
							const configSelfEnableHunger = {
								title: "confirm.manage_health.enable_hunger",
								body: "edu_tools.ui.confirm.manage_health.self.enable_hunger.body",
								buttons: [
									{
										label: "edu_tools.ui.buttons.continue",
										handler: () => {
											player.removeEffect("saturation");
											sceneManager.openScene("main");
										},
									},
									{
										label: "edu_tools.ui.buttons.exit",
										handler: () => {},
									},
								],
							};
							sceneManager.openScene("confirm", configSelfEnableHunger);
							break;
						case "all":
							const configAllEnableHunger = {
								title: "confirm.manage_health.enable_hunger",
								body: "edu_tools.ui.confirm.manage_health.all.enable_hunger.body",
								buttons: [
									{
										label: "edu_tools.ui.buttons.continue",
										handler: () => {
											world.getPlayers().forEach((player: Player) => {
												player.removeEffect("saturation");
											});
											sceneManager.openScene("main");
										},
									},
									{
										label: "edu_tools.ui.buttons.exit",
										handler: () => {},
									},
								],
							};
							sceneManager.openScene("confirm", configAllEnableHunger);
							break;
						case "specific_player":
							const configSpecificEnableHunger = {
								title: "confirm.manage_health.enable_hunger",
								body: "edu_tools.ui.confirm.manage_health.specific.enable_hunger.body",
								buttons: [
									{
										label: "edu_tools.ui.buttons.continue",
										handler: () => {
											const specificPlayer: Player = options as Player;
											specificPlayer.removeEffect("saturation");
											sceneManager.openScene("main");
										},
									},
									{
										label: "edu_tools.ui.buttons.exit",
										handler: () => {},
									},
								],
							};
							sceneManager.openScene("confirm", configSpecificEnableHunger);
							break;
					}
				},
				"textures/edu_tools/ui/icons/manage_health/enable_hunger",
			);
		}

		// Add button to reset
		this.addButton(
			"edu_tools.ui.manage_health.buttons.reset",
			(): void => {
				let [selectedPlayersType, options]: [
					string | null,
					string | Player | null,
				] = sceneManager.getSubjectPlayersType();

				switch (selectedPlayersType) {
					case "self":
						let player: Player = sceneManager.getSourcePlayer();
						const configSelfReset = {
							title: "confirm.manage_health.reset",
							body: "edu_tools.ui.confirm.manage_health.self.reset.body",
							buttons: [
								{
									label: "edu_tools.ui.buttons.continue",
									handler: () => {
										player.removeEffect("saturation");
										player.removeEffect("regeneration");
										sceneManager.openScene("main");
									},
								},
								{
									label: "edu_tools.ui.buttons.exit",
									handler: () => {},
								},
							],
						};
						sceneManager.openScene("confirm", configSelfReset);
						break;
					case "all":
						const configAllReset = {
							title: "confirm.manage_health.reset",
							body: "edu_tools.ui.confirm.manage_health.all.reset.body",
							buttons: [
								{
									label: "edu_tools.ui.buttons.continue",
									handler: () => {
										world.getPlayers().forEach((player: Player) => {
											player.removeEffect("saturation");
											player.removeEffect("regeneration");
										});
										sceneManager.openScene("main");
									},
								},
								{
									label: "edu_tools.ui.buttons.exit",
									handler: () => {},
								},
							],
						};
						sceneManager.openScene("confirm", configAllReset);
						break;
					case "specific_player":
						const configSpecificReset = {
							title: "confirm.manage_health.reset",
							body: "edu_tools.ui.confirm.manage_health.specific.reset.body",
							buttons: [
								{
									label: "edu_tools.ui.buttons.continue",
									handler: () => {
										const specificPlayer: Player = options as Player;
										specificPlayer.removeEffect("saturation");
										specificPlayer.removeEffect("regeneration");
										sceneManager.openScene("main");
									},
								},
								{
									label: "edu_tools.ui.buttons.exit",
									handler: () => {},
								},
							],
						};
						sceneManager.openScene("confirm", configSpecificReset);
						break;
				}
			},
			"textures/edu_tools/ui/icons/manage_health/reset",
		);

		this.show(sceneManager.getSourcePlayer());
	}
}
