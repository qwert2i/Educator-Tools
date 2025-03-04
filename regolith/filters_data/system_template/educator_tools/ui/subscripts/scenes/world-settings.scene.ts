import { SceneManager } from "../scene-manager";
import { ModalUIScene } from "../ui-scene";
import { world } from "@minecraft/server";

const SceneName = "world_settings";

/**
 * Class representing the World Settings Scene.
 */
export class WorldSettingsScene extends ModalUIScene {
	/**
	 * Creates an instance of WorldSettingsScene.
	 * @param sceneManager - The SceneManager instance.
	 */
	constructor(sceneManager: SceneManager) {
		super("world_settings", sceneManager.getSourcePlayer(), "main");

		this.addToggle(
			"edu_tools.ui.world_settings.toggles.mob_spawning",
			(value: boolean): void => {
				if (value) {
					world.gameRules.doMobSpawning = true;
				} else {
					world.gameRules.doMobSpawning = false;
				}
			},
			world.gameRules.doMobSpawning,
		);

		// mob griefing
		this.addToggle(
			"edu_tools.ui.world_settings.toggles.mob_griefing",
			(value: boolean): void => {
				if (value) {
					world.gameRules.mobGriefing = true;
				} else {
					world.gameRules.mobGriefing = false;
				}
			},
			world.gameRules.mobGriefing,
		);

		// keep inventory
		this.addToggle(
			"edu_tools.ui.world_settings.toggles.keep_inventory",
			(value: boolean): void => {
				if (value) {
					world.gameRules.keepInventory = true;
				} else {
					world.gameRules.keepInventory = false;
				}
			},
			world.gameRules.keepInventory,
		);

		// do daylight cycle
		this.addToggle(
			"edu_tools.ui.world_settings.toggles.daylight_cycle",
			(value: boolean): void => {
				if (value) {
					world.gameRules.doDayLightCycle = true;
				} else {
					world.gameRules.doDayLightCycle = false;
				}
			},
			world.gameRules.doDayLightCycle,
		);

		// do weather cycle
		this.addToggle(
			"edu_tools.ui.world_settings.toggles.weather_cycle",
			(value: boolean): void => {
				if (value) {
					world.gameRules.doWeatherCycle = true;
				} else {
					world.gameRules.doWeatherCycle = false;
				}
			},
			world.gameRules.doWeatherCycle,
		);

		// immediate respawn
		this.addToggle(
			"edu_tools.ui.world_settings.toggles.immediate_respawn",
			(value: boolean): void => {
				if (value) {
					world.gameRules.doImmediateRespawn = true;
				} else {
					world.gameRules.doImmediateRespawn = false;
				}
			},
			world.gameRules.doImmediateRespawn,
		);

		// command blocks
		this.addToggle(
			"edu_tools.ui.world_settings.toggles.command_blocks",
			(value: boolean): void => {
				if (value) {
					world.gameRules.commandBlocksEnabled = true;
				} else {
					world.gameRules.commandBlocksEnabled = false;
				}
			},
			world.gameRules.commandBlocksEnabled,
		);

		// world damage
		this.addToggle(
			"edu_tools.ui.world_settings.toggles.world_damage",
			(value: boolean): void => {
				if (value) {
					world.gameRules.mobGriefing = true;
					world.gameRules.tntExplodes = true;
					world.gameRules.fireDamage = true;
				} else {
					world.gameRules.mobGriefing = false;
					world.gameRules.tntExplodes = false;
					world.gameRules.fireDamage = false;
				}
			},
			world.gameRules.mobGriefing,
		);
		this.show(sceneManager.getSourcePlayer(), sceneManager);
	}
}
