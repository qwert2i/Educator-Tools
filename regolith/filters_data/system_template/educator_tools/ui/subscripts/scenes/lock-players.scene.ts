import { Vec3 } from "@bedrock-oss/bedrock-boost";
import { SceneManager } from "../scene-manager";
import { ActionUIScene } from "../ui-scene";

const SceneName = "lock_players";

/**
 * Class representing the LockPlayers Scene.
 */
export class LockPlayersScene extends ActionUIScene {
	/**
	 * Creates an instance of LockPlayersScene.
	 * @param sceneManager - The SceneManager instance.
	 */
	constructor(sceneManager: SceneManager) {
		sceneManager.addToSceneHistory(SceneName);

		super("lock_players", sceneManager.getSourcePlayer());

		this.setSimpleBody("edu_tools.ui.lock_players.body");
		this.addButton(
			"edu_tools.ui.lock_players.buttons.configure",
			(): void => {
				sceneManager.openScene("lock_players_settings", "lock_players");
			},
			"textures/edu_tools/ui/icons/lock_players/lock_players_settings",
		);
		if (sceneManager.getWorldData().getLockPlayersMode() === 0) {
			this.addButton(
				"edu_tools.ui.lock_players.buttons.set_center",
				(): void => {
					sceneManager
						.getWorldData()
						.setLockPlayersCenter(sceneManager.getSourcePlayer().location);
					sceneManager.openScene("lock_players");
				},
				"textures/edu_tools/ui/icons/lock_players/select_center",
			);
			this.addButton(
				"edu_tools.ui.lock_players.buttons.teleport_to_center",
				(): void => {
					sceneManager
						.getSourcePlayer()
						.teleport(
							sceneManager.getWorldData().getLockPlayersCenter() as Vec3,
						);
					sceneManager.getSourcePlayer().playSound("entity.enderman.teleport");
					sceneManager.openScene("lock_players");
				},
				"textures/edu_tools/ui/icons/lock_players/teleport_center",
			);
		}

		this.addButton("edu_tools.ui.buttons.back", (): void => {
			sceneManager.openScene("main");
		});

		this.show(sceneManager.getSourcePlayer());
	}
}
