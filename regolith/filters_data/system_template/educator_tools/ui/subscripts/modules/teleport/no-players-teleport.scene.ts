import { SceneContext } from "../scene_manager/scene-context";
import { SceneManager } from "../scene_manager/scene-manager";
import { ActionUIScene } from "../scene_manager/ui-scene";

export class NoPlayersTeleportScene extends ActionUIScene {
	static readonly id = "no_players_teleport";

	constructor(sceneManager: SceneManager, context: SceneContext) {
		super(NoPlayersTeleportScene.id, context.getSourcePlayer());

		this.setSimpleBody("edu_tools.ui.teleport.no_players.body");

		this.addButton("edu_tools.ui.buttons.back", (): void => {
			sceneManager.goBack(context);
		});

		this.show(context.getSourcePlayer(), sceneManager);
	}
}
