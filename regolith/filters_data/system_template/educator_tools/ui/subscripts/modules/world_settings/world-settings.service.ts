import { world, GameRule, GameRules } from "@minecraft/server";
import { PropertyStorage } from "@shapescape/storage";
import { Module } from "../../module-manager";
import { SceneManager } from "../scene_manager/scene-manager";
import { WorldSettingsScene } from "./world-settings.scene";

/**
 * Interface representing a game rule with its current value and update method
 */
interface GameRuleItem {
	/** The translation key for UI display */
	translationKey: string;
	/** Current value of the game rule */
	value: boolean;
	/** Method to toggle the game rule value */
	toggle: (value: boolean) => void;
}

/**
 * Service class to manage world game rules
 */
export class WorldSettingsService implements Module {
	readonly id = "world_settings";
	private gameRules: Map<string, GameRuleItem> = new Map();

	constructor(private readonly storage: PropertyStorage) {
		this.initGameRules();
	}

	/**
	 * Register scenes related to world settings with the SceneManager.
	 * This is called by the ModuleManager when this module is registered.
	 * @param sceneManager - The SceneManager instance.
	 */
	registerScenes(sceneManager: SceneManager): void {
		sceneManager.registerScene(
			"world_settings",
			(manager: SceneManager, context: any) => {
				new WorldSettingsScene(manager, context, this);
			},
		);
	}

	/**
	 * Initialize all available game rules
	 */
	private initGameRules(): void {
		// Standard game rules
		this.addGameRule(
			"doMobSpawning",
			"edu_tools.ui.world_settings.toggles.mob_spawning",
		);
		this.addGameRule(
			"mobGriefing",
			"edu_tools.ui.world_settings.toggles.mob_griefing",
		);
		this.addGameRule(
			"keepInventory",
			"edu_tools.ui.world_settings.toggles.keep_inventory",
		);
		this.addGameRule(
			"doDayLightCycle",
			"edu_tools.ui.world_settings.toggles.daylight_cycle",
		);
		this.addGameRule(
			"doWeatherCycle",
			"edu_tools.ui.world_settings.toggles.weather_cycle",
		);
		this.addGameRule(
			"doImmediateRespawn",
			"edu_tools.ui.world_settings.toggles.immediate_respawn",
		);
		this.addGameRule(
			"commandBlocksEnabled",
			"edu_tools.ui.world_settings.toggles.command_blocks",
		);

		// Add special composite rule for world damage
		this.gameRules.set("worldDamage", {
			translationKey: "edu_tools.ui.world_settings.toggles.world_damage",
			value: world.gameRules.mobGriefing,
			toggle: (value: boolean) => {
				world.gameRules.mobGriefing = value;
				world.gameRules.tntExplodes = value;
				world.gameRules.fireDamage = value;
			},
		});
	}

	/**
	 * Add a single game rule to the collection
	 */
	private addGameRule(ruleName: string, translationKey: string): void {
		try {
			// Check if the rule exists in world.gameRules
			if (ruleName in world.gameRules) {
				this.gameRules.set(ruleName, {
					translationKey,
					value: (world.gameRules as any)[ruleName],
					toggle: (value: boolean) => {
						(world.gameRules as GameRules)[ruleName] = value;
						this.updateGameRule(ruleName);
					},
				});
			}
		} catch (e) {
			// Handle the case where a rule doesn't exist
			console.warn(`Game rule ${ruleName} not available in this version`);
		}
	}

	private updateGameRule(ruleName: string): void {
		const rule = this.gameRules.get(ruleName);
		if (rule) {
			rule.value = (world.gameRules as any)[ruleName];
		}
	}

	/**
	 * Get all available game rules for UI display
	 */
	getGameRules(): Array<{
		id: string;
		translationKey: string;
		value: boolean;
	}> {
		const result: Array<{
			id: string;
			translationKey: string;
			value: boolean;
		}> = [];

		for (const [id, rule] of this.gameRules.entries()) {
			result.push({
				id,
				translationKey: rule.translationKey,
				value: rule.value,
			});
		}

		return result;
	}

	/**
	 * Toggle a game rule value
	 */
	toggleGameRule(id: string, value: boolean): void {
		const rule = this.gameRules.get(id);
		if (rule) {
			rule.toggle(value);
		}
	}

	/**
	 * Get the current value of a game rule
	 */
	getGameRuleValue(id: string): boolean {
		return this.gameRules.get(id)?.value ?? false;
	}
}
