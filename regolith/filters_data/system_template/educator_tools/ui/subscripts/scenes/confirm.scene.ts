import { SceneManager } from "../scene-manager";
import { ActionUIScene, RawBodyElement } from "../ui-scene";

// Define the dynamic configuration interface.
export interface ConfirmSceneConfig {
	title: string;
	body?: string;
	rawBody?: RawBodyElement[];
	buttons: { label: string; handler: () => void }[];
}

/**
 * Dynamically configured confirmation scene.
 */
export class ConfirmScene extends ActionUIScene {
	constructor(sceneManager: SceneManager, config: ConfirmSceneConfig) {
		// Use the config passed directly instead of retrieving from SceneManager.
		super(config.title, sceneManager.getSourcePlayer());
		if (config.rawBody) {
			this.setRawBody(config.rawBody);
		} else if (config.body) {
			this.setSimpleBody(config.body);
		}
		config.buttons.forEach((btn) => {
			this.addButton(btn.label, btn.handler);
		});
		this.show(sceneManager.getSourcePlayer());
	}
}
