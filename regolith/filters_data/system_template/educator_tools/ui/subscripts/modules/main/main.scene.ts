import { SceneManager } from "../scene_manager/scene-manager";
import { ActionUIScene } from "../scene_manager/ui-scene";
import { SceneContext } from "../scene_manager/scene-context";

const SceneName = "main";

/**
 * Class representing the Main Scene.
 */
export class MainScene extends ActionUIScene {
	/**
	 * Creates an instance of MainScene.
	 * @param sceneManager - The SceneManager instance.
	 * @param context - The SceneContext instance.
	 */
	constructor(sceneManager: SceneManager, context: SceneContext) {
		super("main", context.getSourcePlayer());

		// Set the context for this scene
		this.setContext(context);

		this.setSimpleBody("edu_tools.ui.main.body");
		this.addButton(
			"edu_tools.ui.main.buttons.teleport",
			(): void => {
				sceneManager.openSceneWithContext(context, "set_players", "teleport");
			},
			"textures/edu_tools/ui/icons/main/teleport",
		);
		this.addButton(
			"edu_tools.ui.main.buttons.gamemode",
			(): void => {
				sceneManager.openSceneWithContext(context, "set_players", "gamemode");
			},
			"textures/edu_tools/ui/icons/main/gamemode",
		);
		this.addButton(
			"edu_tools.ui.main.buttons.timer",
			(): void => {
				sceneManager.openSceneWithContext(context, "timer");
			},
			"textures/edu_tools/ui/icons/main/timer",
		);
		this.addButton(
			"edu_tools.ui.main.buttons.world_settings",
			(): void => {
				sceneManager.openSceneWithContext(context, "world_settings");
			},
			"textures/edu_tools/ui/icons/main/world_settings",
		);
		this.addButton(
			"edu_tools.ui.main.buttons.lock_players",
			(): void => {
				sceneManager.openSceneWithContext(context, "lock_players");
			},
			"textures/edu_tools/ui/icons/main/lock_players",
		);
		this.addButton(
			"edu_tools.ui.main.buttons.copy_inventory",
			(): void => {
				sceneManager.openScene("set_players", "copy_inventory");
			},
			"textures/edu_tools/ui/icons/main/copy_inventory",
		);
		this.addButton(
			"edu_tools.ui.main.buttons.manage_health",
			(): void => {
				sceneManager.openScene("set_players", "manage_health");
			},
			"textures/edu_tools/ui/icons/main/manage_health",
		);
		this.addButton(
			"edu_tools.ui.buttons.exit",
			(): void => {},
			"textures/edu_tools/ui/icons/_general/exit",
		);

		// Show the UI to the source player
		this.show(context.getSourcePlayer(), sceneManager);
	}
}
