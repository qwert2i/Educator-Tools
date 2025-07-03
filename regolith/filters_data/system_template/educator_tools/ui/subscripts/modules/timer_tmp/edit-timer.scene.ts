import { SceneManager } from "../scene_manager/scene-manager";
import { ModalUIScene } from "../scene_manager/ui-scene";
import { TimerService } from "./timer.service";
import { SceneContext } from "../scene_manager/scene-context";

const sceneName = "edit_timer";

/**
 * Class representing the Edit Timer Scene.
 */
export class EditTimerScene extends ModalUIScene {
	private timerService: TimerService;

	constructor(sceneManager: SceneManager, context: SceneContext) {
		// Create the scene
		super("edit_timer", context.getSourcePlayer());
		this.context = context;

		// Get the timer service
		this.timerService = sceneManager.getModule<TimerService>(TimerService.id)!;

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

		const timerExists = this.timerService.getTimer() != null;

		if (timerExists) {
			// If timer exists, this is an edit operation
			const timer = this.timerService.getTimer();
			if (!timer) {
				console.error("Timer not found in TimerService");
				return;
			}

			const time = timer.getMaxTime();
			const index = times.indexOf(time);

			this.addDropdown(
				"edu_tools.ui.edit_timer.time",
				dropdownOptions,
				(selectedIndex: number) => {
					this.timerService.resetTimer(times[selectedIndex]);
					sceneManager.openSceneWithContext(context, "timer");
				},
				index,
			);
		} else {
			// If no timer exists, this is a create operation
			this.setTitle("create_timer");

			this.addDropdown(
				"edu_tools.ui.edit_timer.time",
				dropdownOptions,
				(selectedIndex: number) => {
					this.timerService.createTimer(
						times[selectedIndex],
						context.getSourcePlayer(),
					);
					sceneManager.openSceneWithContext(context, "timer");
				},
			);
		}

		this.setNextScene("timer");
		this.show(context.getSourcePlayer(), sceneManager);
	}
}
