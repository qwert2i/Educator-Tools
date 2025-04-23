import { Module } from "../../module-manager";
import { SceneManager } from "../scene_manager/scene-manager";
import { MainScene } from "./main.scene";
import { SceneContext } from "../scene_manager/scene-context";

/**
 * Service for managing the main menu.
 */
export class MainService implements Module {
	/**
	 * Unique identifier for the module.
	 */
	public static readonly id: string = "main";

	/**
	 * Registers all scenes related to the main menu.
	 * @param sceneManager - The SceneManager to register scenes with.
	 */
	public registerScenes(sceneManager: SceneManager): void {
		sceneManager.registerScene(
			"main",
			(manager: SceneManager, context: SceneContext) => {
				// Create a new instance of MainScene
				new MainScene(manager, context);
			},
		);
	}
}
