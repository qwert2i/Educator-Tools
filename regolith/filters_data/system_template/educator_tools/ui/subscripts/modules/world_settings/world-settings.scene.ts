import { world } from "@minecraft/server";
import { SceneManager } from "../scene_manager/scene-manager";
import { SceneContext } from "../scene_manager/scene-context";
import { ModalUIScene } from "../scene_manager/ui-scene";
import { WorldSettingsService } from "./world-settings.service";

/**
 * Class representing the World Settings Scene.
 */
export class WorldSettingsScene extends ModalUIScene {
	/**
	 * Creates an instance of WorldSettingsScene.
	 * @param sceneManager - The SceneManager instance.
	 * @param context - The scene context.
	 * @param worldSettingsService - The world settings service.
	 */
	constructor(
		sceneManager: SceneManager,
		context: SceneContext,
		private worldSettingsService: WorldSettingsService,
	) {
		super("world_settings", context.getSourcePlayer(), "main");

		// Dynamically add toggles for all game rules
		const gameRules = this.worldSettingsService.getGameRules();

		for (const rule of gameRules) {
			this.addToggle(
				rule.translationKey,
				(value: boolean): void => {
					this.worldSettingsService.toggleGameRule(rule.id, value);
				},
				rule.value,
			);
		}

		this.show(context.getSourcePlayer(), sceneManager);
	}
}
