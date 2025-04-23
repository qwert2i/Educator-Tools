import { SceneManager } from "../scene_manager/scene-manager";
import { SceneContext } from "../scene_manager/scene-context";
import { RawBodyElement, ActionUIScene } from "../scene_manager/ui-scene";

/**
 * Configuration for creating a confirmation scene.
 */
export interface ConfirmSceneConfig {
	title: string;
	body?: string;
	rawBody?: RawBodyElement[];
	buttons: {
		label: string;
		handler: (context: SceneContext, manager: SceneManager) => void;
	}[];
}

/**
 * A generic confirmation scene that can be configured dynamically.
 */
export class ConfirmScene extends ActionUIScene {
	private manager: SceneManager;

	/**
	 * Creates a new ConfirmScene.
	 * @param manager - The scene manager.
	 * @param context - The scene context.
	 * @param config - The configuration for this confirmation scene.
	 */
	constructor(
		manager: SceneManager,
		context: SceneContext,
		config: ConfirmSceneConfig,
	) {
		super(config.title, context.getSourcePlayer());

		this.context = context;
		this.manager = manager;

		// Set body content
		if (config.rawBody) {
			this.setRawBody(config.rawBody);
		} else if (config.body) {
			this.setSimpleBody(config.body);
		}

		// Add buttons with handlers that have access to context and manager
		config.buttons.forEach((btn) => {
			this.addButton(btn.label, () => btn.handler(this.context, this.manager));
		});

		// Show the UI
		this.show(context.getSourcePlayer());
	}
}
