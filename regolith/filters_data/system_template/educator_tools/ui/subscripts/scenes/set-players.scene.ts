import { SceneManager } from "../scene-manager";
import { ActionUIScene } from "../ui-scene";
import {
	EntityInventoryComponent,
	ItemStack,
	Player,
	system,
	world,
} from "@minecraft/server";

const SceneName = "set_players";

/**
 * Class representing the Set Players Scene.
 */
export class SetPlayersScene extends ActionUIScene {
	/**
	 * Creates an instance of SetPlayersScene.
	 * @param sceneManager - The SceneManager instance.
	 * @param operation - The current operation ("teleport" or "gamemode").
	 */
	constructor(private readonly sceneManager: SceneManager, operation: string) {
		sceneManager.addToSceneHistory(SceneName);

		if (operation === "teleport") {
			const [SUBJECT_PLAYER_TYPE, OPTIONS] =
				sceneManager.getSubjectPlayersType();

			if (SUBJECT_PLAYER_TYPE == null) {
				// Subject not selected: select subject.
				super("set_players.teleport.subject", sceneManager.getSourcePlayer());
				this.setSimpleBody(
					"edu_tools.ui.set_players.select_subject_for_teleport.body",
				);

				this.addButton(
					"edu_tools.ui.set_players.buttons.you",
					(): void => {
						sceneManager.setSubjectPlayersType("self");
						sceneManager.openScene("set_players", "teleport");
					},
					"textures/edu_tools/ui/icons/set_players/self",
				);
				this.addButton(
					"edu_tools.ui.set_players.buttons.all",
					(): void => {
						sceneManager.setSubjectPlayersType("all");
						sceneManager.openScene("set_players", "teleport");
					},
					"textures/edu_tools/ui/icons/set_players/all",
				);
				world.getPlayers().forEach((player: Player): void => {
					if (player !== sceneManager.getSourcePlayer()) {
						this.addButton(
							player.name,
							(): void => {
								sceneManager.setSubjectPlayersType(
									"specific_player",
									null,
									player,
								);
								sceneManager.openScene("set_players", "teleport");
							},
							"textures/edu_tools/ui/icons/set_players/player",
						);
					}
				});

				this.addButton("edu_tools.ui.buttons.back", (): void => {
					sceneManager.openScene("main");
				});

				this.show(sceneManager.getSourcePlayer());
			} else {
				// Subject already selected: choose target.
				super("set_players.teleport.target", sceneManager.getSourcePlayer());
				this.setSimpleBody(
					"edu_tools.ui.set_players.select_target_for_teleport.body",
				);

				if (SUBJECT_PLAYER_TYPE === "self") {
					world.getPlayers().forEach((player: Player): void => {
						if (player !== sceneManager.getSourcePlayer()) {
							this.addButton(
								player.name,
								(): void => {
									sceneManager.setTargetPlayersType(
										"specific_player",
										null,
										player,
									);
									sceneManager.getSourcePlayer().teleport(player.location);
									const config = {
										title: "confirm.teleport",
										body: "edu_tools.ui.confirm.teleport.self.body",
										buttons: [
											{
												label: "edu_tools.ui.buttons.continue",
												handler: () => sceneManager.openScene("main"),
											},
											{
												label: "edu_tools.ui.buttons.exit",
												handler: () => {},
											},
										],
									};
									sceneManager.openScene("confirm", config);
								},
								"textures/edu_tools/ui/icons/set_players/player",
							);
						}
					});
				} else if (SUBJECT_PLAYER_TYPE === "all") {
					world.getPlayers().forEach((player: Player): void => {
						this.addButton(
							player.name,
							(): void => {
								sceneManager.setTargetPlayersType(
									"specific_player",
									null,
									player,
								);
								sceneManager
									.getSourcePlayer()
									.runCommand(`tp @a ${player.name}`);
								const config = {
									title: "confirm.teleport",
									body: "edu_tools.ui.confirm.teleport.all.body",
									buttons: [
										{
											label: "edu_tools.ui.buttons.continue",
											handler: () => sceneManager.openScene("main"),
										},
										{
											label: "edu_tools.ui.buttons.exit",
											handler: () => {},
										},
									],
								};
								sceneManager.openScene("confirm", config);
							},
							"textures/edu_tools/ui/icons/set_players/player",
						);
					});
				} else if (SUBJECT_PLAYER_TYPE === "specific_player") {
					const specificPlayer = OPTIONS as Player;
					world.getPlayers().forEach((player: Player): void => {
						if (player !== specificPlayer) {
							this.addButton(
								player.name,
								(): void => {
									sceneManager.setTargetPlayersType(
										"specific_player",
										null,
										player,
									);
									specificPlayer.teleport(player.location);
									const config = {
										title: "confirm.teleport",
										body: "edu_tools.ui.confirm.teleport.specific.body",
										buttons: [
											{
												label: "edu_tools.ui.buttons.continue",
												handler: () => sceneManager.openScene("main"),
											},
											{
												label: "edu_tools.ui.buttons.exit",
												handler: () => {},
											},
										],
									};
									sceneManager.openScene("confirm", config);
								},
								"textures/edu_tools/ui/icons/set_players/player",
							);
						}
					});
				}

				this.addButton("edu_tools.ui.buttons.back", (): void => {
					sceneManager.setSubjectPlayersType(null, null, null);
					//sceneManager.goBack(); // TODO: Context is lost here, so we need to open the main scene again.
					sceneManager.openScene("main");
				});

				this.show(sceneManager.getSourcePlayer());
			}
		} else if (operation === "gamemode") {
			super("set_players.gamemode", sceneManager.getSourcePlayer());
			this.setSimpleBody(
				"edu_tools.ui.set_players.select_subject_for_gamemode_change.body",
			);

			this.addButton(
				"edu_tools.ui.set_players.buttons.you",
				(): void => {
					sceneManager.setSubjectPlayersType("self");
					sceneManager.openScene("set_gamemode");
				},
				"textures/edu_tools/ui/icons/set_players/self",
			);
			this.addButton(
				"edu_tools.ui.set_players.buttons.all",
				(): void => {
					sceneManager.setSubjectPlayersType("all");
					sceneManager.openScene("set_gamemode");
				},
				"textures/edu_tools/ui/icons/set_players/all",
			);
			world.getPlayers().forEach((player: Player): void => {
				if (player !== sceneManager.getSourcePlayer()) {
					this.addButton(
						player.name,
						(): void => {
							sceneManager.setSubjectPlayersType(
								"specific_player",
								null,
								player,
							);
							sceneManager.openScene("set_gamemode");
						},
						"textures/edu_tools/ui/icons/set_players/player",
					);
				}
			});

			this.addButton("edu_tools.ui.buttons.back", (): void => {
				sceneManager.openScene("main");
			});

			this.show(sceneManager.getSourcePlayer());
		} else if (operation === "manage_health") {
			super("set_players.manage_health", sceneManager.getSourcePlayer());
			this.setSimpleBody(
				"edu_tools.ui.set_players.select_subject_for_manage_health_change.body",
			);

			this.addButton(
				"edu_tools.ui.set_players.buttons.you",
				(): void => {
					sceneManager.setSubjectPlayersType("self");
					sceneManager.openScene("manage_health");
				},
				"textures/edu_tools/ui/icons/set_players/self",
			);
			this.addButton(
				"edu_tools.ui.set_players.buttons.all",
				(): void => {
					sceneManager.setSubjectPlayersType("all");
					sceneManager.openScene("manage_health");
				},
				"textures/edu_tools/ui/icons/set_players/all",
			);
			world.getPlayers().forEach((player: Player): void => {
				if (player !== sceneManager.getSourcePlayer()) {
					this.addButton(
						player.name,
						(): void => {
							sceneManager.setSubjectPlayersType(
								"specific_player",
								null,
								player,
							);
							sceneManager.openScene("manage_health");
						},
						"textures/edu_tools/ui/icons/set_players/player",
					);
				}
			});

			this.addButton("edu_tools.ui.buttons.back", (): void => {
				sceneManager.openScene("main");
			});

			this.show(sceneManager.getSourcePlayer());
		} else if (operation === "copy_inventory") {
			const [SUBJECT_PLAYER_TYPE, OPTIONS] =
				sceneManager.getSubjectPlayersType();

			if (SUBJECT_PLAYER_TYPE == null) {
				// Subject not selected: select subject.
				super(
					"set_players.copy_inventory.subject",
					sceneManager.getSourcePlayer(),
				);
				this.setSimpleBody(
					"edu_tools.ui.set_players.select_subject_for_copy_inventory.body",
				);

				world.getPlayers().forEach((player: Player): void => {
					this.addButton(
						player.name,
						(): void => {
							sceneManager.setSubjectPlayersType(
								"specific_player",
								null,
								player,
							);
							sceneManager.openScene("set_players", "copy_inventory");
						},
						"textures/edu_tools/ui/icons/set_players/player",
					);
				});

				this.addButton("edu_tools.ui.buttons.back", (): void => {
					sceneManager.openScene("main");
				});

				this.show(sceneManager.getSourcePlayer());
			} else {
				// Subject already selected: choose target.
				super(
					"set_players.copy_inventory.target",
					sceneManager.getSourcePlayer(),
				);
				this.setSimpleBody(
					"edu_tools.ui.set_players.select_target_for_copy_inventory.body",
				);

				if (SUBJECT_PLAYER_TYPE === "specific_player") {
					const specificPlayer = OPTIONS as Player;
					world.getPlayers().forEach((player: Player): void => {
						if (player !== specificPlayer) {
							this.addButton(
								player.name,
								(): void => {
									sceneManager.setTargetPlayersType(
										"specific_player",
										null,
										player,
									);
									this.copyInventory(specificPlayer, player);
									const config = {
										title: "confirm.copy_inventory",
										body: "edu_tools.ui.confirm.copy_inventory.specific.body",
										buttons: [
											{
												label: "edu_tools.ui.buttons.continue",
												handler: () => {
													sceneManager.openScene("main");
												},
											},
											{
												label: "edu_tools.ui.buttons.exit",
												handler: () => {},
											},
										],
									};
									sceneManager.openScene("confirm", config);
								},
								"textures/edu_tools/ui/icons/set_players/player",
							);
						}
					});

					this.addButton(
						"edu_tools.ui.set_players.buttons.all",
						(): void => {
							world.getPlayers().forEach((player: Player): void => {
								if (player !== specificPlayer) {
									this.copyInventory(specificPlayer, player);
								}
							});
							const config = {
								title: "confirm.copy_inventory",
								body: "edu_tools.ui.confirm.copy_inventory.all.body",
								buttons: [
									{
										label: "edu_tools.ui.buttons.continue",
										handler: () => {
											sceneManager.openScene("main");
										},
									},
									{
										label: "edu_tools.ui.buttons.exit",
										handler: () => {},
									},
								],
							};
							sceneManager.openScene("confirm", config);
						},
						"textures/edu_tools/ui/icons/set_players/all",
					);
				}

				this.addButton("edu_tools.ui.buttons.back", (): void => {
					sceneManager.setSubjectPlayersType(null, null, null);
					sceneManager.goBack();
				});

				this.show(sceneManager.getSourcePlayer());
			}
		} else {
			console.error("Invalid operation: " + operation);
			sceneManager.openScene("main");
		}
	}

	private copyInventory(source: Player, target: Player): void {
		const sComponents = source.getComponent(
			EntityInventoryComponent.componentId,
		) as EntityInventoryComponent;
		const tComponents = target.getComponent(
			EntityInventoryComponent.componentId,
		) as EntityInventoryComponent;
		if (
			sComponents &&
			tComponents &&
			sComponents.container &&
			tComponents.container
		) {
			tComponents.container.clearAll();
			let spaceLeft = false;
			for (let i = 0; i < sComponents.container.size; i++) {
				const item = sComponents.container.getItem(i);
				if (tComponents.container.size > i) {
					if (
						item &&
						item.typeId === "edu_tools:educator_tool" &&
						this.sceneManager.getWorldData().getHostPlayer() &&
						this.sceneManager.getWorldData().getHostPlayer().id !== target.id
					) {
						// Do not copy the Educator Tool if the target player is not the host player
						continue;
					}
					if (!item || item.typeId === "minecraft:air") spaceLeft = true;
					tComponents.container.setItem(i, item);
				}
			}
			if (
				//this.sceneManager.getWorldData().getHostPlayer() &&
				//this.sceneManager.getWorldData().getHostPlayer().id !== target.id
				true
			) {
				if (!spaceLeft) {
					world.sendMessage({
						translate: "edu_tools.message.no_space_for_educator_tool",
					});
				} else {
					for (let i = 0; i < tComponents.container.size; i++) {
						const item = tComponents.container.getItem(i);
						if (!item || item.typeId === "minecraft:air") {
							tComponents.container.setItem(
								i,
								new ItemStack("edu_tools:educator_tool"),
							);
							break;
						}
					}
				}
			}
		}
	}
}
