import { SceneManager } from "../scene_manager/scene-manager";
import { ActionUIScene } from "../scene_manager/ui-scene";
import { TimerService } from "./timer.service";
import { SceneContext } from "../scene_manager/scene-context";

const sceneName = "timer";

/**
 * Class representing the Timer Scene.
 */
export class TimerScene extends ActionUIScene {
	private timerService: TimerService;

	constructor(sceneManager: SceneManager, context: SceneContext) {
		// Create the scene
		super("timer", context.getSourcePlayer());
		this.context = context;

		// Get the timer service
		this.timerService = sceneManager.getModule<TimerService>(TimerService.id)!;

		const timerExists = this.timerService.getTimer() != null;

		if (timerExists) {
			const timer = this.timerService.getTimer();
			if (timer == null) {
				console.error("No timer saved in timerService");
			}
			if (timer?.isPaused()) {
				// Determine button label via translation token depending on timer state.
				let startButtonToken: string;
				if (timer.getTime() === timer.getMaxTime()) {
					startButtonToken = "edu_tools.ui.timer.buttons.start";
				} else {
					startButtonToken = "edu_tools.ui.timer.buttons.resume";
				}
				this.addButton(
					startButtonToken,
					(): void => {
						this.timerService.getTimer()?.resume();
						sceneManager.openSceneWithContext(context, "timer");
					},
					"textures/edu_tools/ui/icons/timer/start_timer",
				);
				// Edit Timer Confirmation
				this.addButton(
					"edu_tools.ui.timer.buttons.edit",
					(): void => {
						const config = {
							title: "confirm.edit_timer",
							body: "edu_tools.ui.confirm.edit_timer.body",
							buttons: [
								{
									label: "edu_tools.ui.buttons.continue",
									handler: () =>
										sceneManager.openSceneWithContext(context, "edit_timer"),
								},
								{
									label: "edu_tools.ui.buttons.exit",
									handler: () =>
										sceneManager.openSceneWithContext(context, "timer"),
								},
							],
						};
						sceneManager.openSceneWithContext(context, "confirm", config);
					},
					"textures/edu_tools/ui/icons/timer/edit_timer",
				);
				// Reset Timer Confirmation
				this.addButton(
					"edu_tools.ui.timer.buttons.reset",
					(): void => {
						const config = {
							title: "confirm.reset_timer",
							body: "edu_tools.ui.confirm.reset_timer.body",
							buttons: [
								{
									label: "edu_tools.ui.buttons.continue",
									handler: () => {
										const timer = this.timerService.getTimer();
										if (timer) {
											this.timerService.resetTimer(timer.getMaxTime());
										}
										sceneManager.openSceneWithContext(context, "timer");
									},
								},
								{
									label: "edu_tools.ui.buttons.exit",
									handler: () =>
										sceneManager.openSceneWithContext(context, "timer"),
								},
							],
						};
						sceneManager.openSceneWithContext(context, "confirm", config);
					},
					"textures/edu_tools/ui/icons/timer/reset_timer",
				);
			} else {
				this.addButton(
					"edu_tools.ui.timer.buttons.pause",
					(): void => {
						this.timerService.getTimer()?.pause();
						sceneManager.openSceneWithContext(context, "timer");
					},
					"textures/edu_tools/ui/icons/timer/pause_timer",
				);
			}
			// Stop Timer Confirmation
			this.addButton(
				"edu_tools.ui.timer.buttons.stop",
				(): void => {
					const config = {
						title: "confirm.stop_timer",
						body: "edu_tools.ui.confirm.stop_timer.body",
						buttons: [
							{
								label: "edu_tools.ui.buttons.continue",
								handler: () => {
									const timer = this.timerService.getTimer();
									if (timer) {
										timer.despawnTimer();
										this.timerService.clearTimer();
									}
									sceneManager.openSceneWithContext(context, "main");
								},
							},
							{
								label: "edu_tools.ui.buttons.exit",
								handler: () =>
									sceneManager.openSceneWithContext(context, "timer"),
							},
						],
					};
					sceneManager.openSceneWithContext(context, "confirm", config);
				},
				"textures/edu_tools/ui/icons/timer/stop_timer",
			);

			if (this.timerService.getHideTimerEntity()) {
				this.addButton(
					"edu_tools.ui.timer.buttons.hide_timer",
					(): void => {
						this.timerService.toggleHideTimerEntity();
						sceneManager.openSceneWithContext(context, "timer");
					},
					"textures/edu_tools/ui/icons/timer/hide_timer",
				);
			} else {
				this.addButton(
					"edu_tools.ui.timer.buttons.show_timer",
					(): void => {
						this.timerService.toggleHideTimerEntity();
						sceneManager.openSceneWithContext(context, "timer");
					},
					"textures/edu_tools/ui/icons/timer/show_timer",
				);
			}

			this.addButton("edu_tools.ui.buttons.back", (): void => {
				sceneManager.openSceneWithContext(context, "main");
			});
		} else {
			this.addButton(
				"edu_tools.ui.timer.buttons.create",
				(): void => {
					sceneManager.openSceneWithContext(context, "edit_timer");
				},
				"textures/edu_tools/ui/icons/timer/create_timer",
			);
			this.addButton("edu_tools.ui.buttons.back", (): void => {
				sceneManager.openSceneWithContext(context, "main");
			});
		}

		this.show(context.getSourcePlayer(), sceneManager);
	}
}
