import { SceneManager } from "../scene-manager";
import { ActionUIScene } from "../ui-scene";

const SceneName = "main";

/**
 * Class representing the Main Scene.
 */
export class MainScene extends ActionUIScene {
	/**
	 * Creates an instance of MainScene.
	 * @param sceneManager - The SceneManager instance.
	 */
	constructor(sceneManager: SceneManager) {
		sceneManager.addToSceneHistory(SceneName);

		super("main", sceneManager.getSourcePlayer());

		this.setSimpleBody("edu_tools.ui.main.body");
		this.addButton(
			"edu_tools.ui.main.buttons.teleport",
			(): void => {
				sceneManager.openScene("set_players", "teleport");
			},
			"textures/edu_tools/ui/icons/main/teleport",
		);
		this.addButton(
			"edu_tools.ui.main.buttons.gamemode",
			(): void => {
				sceneManager.openScene("set_players", "gamemode");
			},
			"textures/edu_tools/ui/icons/main/gamemode",
		);
		this.addButton(
			"edu_tools.ui.main.buttons.timer",
			(): void => {
				sceneManager.openScene("timer");
			},
			"textures/edu_tools/ui/icons/main/timer",
		);
		this.addButton(
			"edu_tools.ui.main.buttons.world_settings",
			(): void => {
				sceneManager.openScene("world_settings");
			},
			"textures/edu_tools/ui/icons/main/world_settings",
		);
		this.addButton(
			"edu_tools.ui.main.buttons.lock_players",
			(): void => {
				sceneManager.openScene("lock_players");
			},
			"textures/edu_tools/ui/icons/main/lock_players",
		);
		this.addButton(
			"edu_tools.ui.buttons.exit",
			(): void => {},
			"textures/edu_tools/ui/icons/_general/exit",
		);

		this.show(sceneManager.getSourcePlayer());
	}
}
