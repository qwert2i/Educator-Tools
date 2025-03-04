import { SceneManager } from "../scene-manager";
import { ModalUIScene } from "../ui-scene";
import { Vector3 } from "@minecraft/server";

const SceneName = "lock_players_settings";

/**
 * Class representing the lock players settings Scene.
 */
export class LockPlayersSettingsScene extends ModalUIScene {
	/**
	 * Creates an instance of LockPlayersSettingsScene.
	 * @param sceneManager - The SceneManager instance.
	 */
	constructor(sceneManager: SceneManager) {
		super("world_settings", sceneManager.getSourcePlayer(), "lock_players");

		this.addToggle(
			"edu_tools.ui.lock_players_settings.toggles.lock_players",
			(value: boolean): void => {
				if (value) {
					sceneManager.getWorldData().setLockPlayersActive(true);
				} else {
					sceneManager.getWorldData().setLockPlayersActive(false);
				}
			},
			sceneManager.getWorldData().getLockPlayersActive(),
		);

		this.addDropdown(
			"edu_tools.ui.lock_players_settings.dropdowns.lock_mode",
			[
				"edu_tools.ui.lock_players_settings.dropdowns.lock_mode.options.from_center",
				"edu_tools.ui.lock_players_settings.dropdowns.lock_mode.options.from_educator",
				// This setting would take more time to do, so for now I will leave it open.
				//"edu_tools.ui.lock_players_settings.dropdowns.lock_mode.options.from_area",
			],
			(value: number): void => {
				sceneManager.getWorldData().setLockPlayersMode(value);
				if (
					(value === 0 &&
						typeof sceneManager.getWorldData().getLockPlayersCenter() !==
							"object") ||
					!(sceneManager.getWorldData().getLockPlayersCenter() as Vector3)
				) {
					sceneManager
						.getWorldData()
						.setLockPlayersCenter(sceneManager.getSourcePlayer().location);
				} else if (value === 1) {
					sceneManager
						.getWorldData()
						.setLockPlayersCenter(sceneManager.getSourcePlayer());
				}
			},
			sceneManager.getWorldData().getLockPlayersMode(),
		);

		this.addToggle(
			"edu_tools.ui.lock_players_settings.toggles.teleport_to_center",
			(value: boolean): void => {
				sceneManager.getWorldData().setLockPlayersReturnToCenter(value);
			},
			sceneManager.getWorldData().getLockPlayersReturnToCenter(),
		);

		this.addSlider(
			// For some reason the translation key is not working so I will just use the string
			//"edu_tools.ui.lock_players_settings.sliders.distance_from_center",
			"Radius",
			16,
			1024,
			(value: number): void => {
				sceneManager.getWorldData().setLockPlayersDistance(value);
			},
			16,
			sceneManager.getWorldData().getLockPlayersDistance(),
		);
		this.show(sceneManager.getSourcePlayer(), sceneManager);
	}
}
