import { SceneContext } from "../scene_manager/scene-context";
import { SceneManager } from "../scene_manager/scene-manager";
import { ActionUIScene, ModalUIScene } from "../scene_manager/ui-scene";

export class LockPlayerScene extends ActionUIScene {
	static readonly id = "lock_player";

	constructor(sceneManager: SceneManager, context: SceneContext) {
		super(LockPlayerScene.id, context.getSourcePlayer());

		this.setContext(context);
		this.setSimpleBody("edu_tools.ui.lock_player.body");

		this.addButton(
			"edu_tools.ui.lock_player.buttons.add_team_lock",
			(): void => {
				sceneManager.openSceneWithContext(
					context,
					"lock_player_add_team_lock",
					true,
				);
			},
			"textures/edu_tools/ui/icons/lock_player/add_team_lock",
		);
		this.addButton(
			"edu_tools.ui.lock_player.buttons.view_teams",
			(): void => {
				sceneManager.openSceneWithContext(
					context,
					"lock_player_settings",
					true,
				);
			},
			"textures/edu_tools/ui/icons/lock_player/view_teams",
		);

		this.show(context.getSourcePlayer(), sceneManager);
	}
}
