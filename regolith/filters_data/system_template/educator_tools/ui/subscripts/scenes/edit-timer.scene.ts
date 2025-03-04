import { Timer } from "../mechanics/timer.mechanic";
import { SceneManager } from "../scene-manager";
import { ModalUIScene } from "../ui-scene";

const SceneName = "edit_timer";

/**
 * Class representing the Edit Timer Scene.
 */
export class EditTimerScene extends ModalUIScene {
	/**
	 * Creates an instance of EditTimerScene.
	 * @param sceneManager - The SceneManager instance.
	 * @param timerExists - Whether a timer exists.
	 */
	constructor(sceneManager: SceneManager, timerExists: boolean) {
		const dropdownOptions: string[] = [
			"edu_tools.ui.edit_timer.time.30_seconds",
			"edu_tools.ui.edit_timer.time.1_minute",
			"edu_tools.ui.edit_timer.time.2_minutes",
			"edu_tools.ui.edit_timer.time.3_minutes",
			"edu_tools.ui.edit_timer.time.5_minutes",
			"edu_tools.ui.edit_timer.time.10_minutes",
			"edu_tools.ui.edit_timer.time.15_minutes",
			"edu_tools.ui.edit_timer.time.30_minutes",
			"edu_tools.ui.edit_timer.time.45_minutes",
			"edu_tools.ui.edit_timer.time.60_minutes",
			"edu_tools.ui.edit_timer.time.90_minutes",
		];

		const times: number[] = [
			30, 60, 120, 180, 300, 600, 900, 1800, 2700, 3600, 5400,
		];

		if (timerExists) {
			super("edit_timer", sceneManager.getSourcePlayer(), "timer");

			const timer: Timer = sceneManager.getWorldData().getTimer() as Timer;
			const time: number = timer.getMaxTime();

			const index: number = times.indexOf(time);

			this.addDropdown(
				"edu_tools.ui.edit_timer.time",
				dropdownOptions,
				(index: number) => {
					timer.resetTimer(times[index]);
					sceneManager.openScene("timer");
				},
				index,
			);
		} else {
			super("create_timer", sceneManager.getSourcePlayer(), "confirm");

			this.addDropdown(
				"edu_tools.ui.edit_timer.time",
				dropdownOptions,
				(index: number) => {
					sceneManager
						.getWorldData()
						.setTimer(
							new Timer(
								times[index],
								sceneManager.getSourcePlayer(),
								sceneManager.getWorldData(),
							),
						);
				},
			);
		}
		this.setNextScene("timer");
		this.show(sceneManager.getSourcePlayer(), sceneManager);
	}
}
