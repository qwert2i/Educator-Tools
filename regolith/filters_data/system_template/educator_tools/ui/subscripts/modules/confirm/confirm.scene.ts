import { SceneManager } from "../scene_manager/scene-manager";
import { ActionUIScene } from "../scene_manager/ui-scene";
import { SceneContext } from "../scene_manager/scene-context";
import { ConfirmSceneConfig } from "./confirm-scene-config";

/**
 * Class representing the Confirmation Scene.
 */
export class ConfirmScene extends ActionUIScene {
	private config: ConfirmSceneConfig;

	constructor(
		sceneManager: SceneManager,
		context: SceneContext,
		config: ConfirmSceneConfig,
	) {
		// Add the current scene to the context history
		context.addToHistory("confirm");

		// Create the scene
		super(config.title || "confirm", context.getSourcePlayer());
		this.context = context;
		this.config = config;

		// Set the body text
		this.setSimpleBody(config.body);

		// Add buttons from the configuration
		if (config.buttons && config.buttons.length > 0) {
			config.buttons.forEach((button) => {
				this.addButton(button.label, () => {
					button.handler(context, sceneManager);
				});
			});
		} else {
			// Default button if none provided
			this.addButton("edu_tools.ui.buttons.continue", () => {
				sceneManager.goBack(context);
			});
		}

		// Show the scene
		this.show(context.getSourcePlayer(), sceneManager);
	}
}

// Export the interface for use in other files
export { ConfirmSceneConfig } from "./confirm-scene-config";
