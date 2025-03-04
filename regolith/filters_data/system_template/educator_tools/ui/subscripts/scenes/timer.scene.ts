import { world } from "@minecraft/server";
import { SceneManager } from "../scene-manager";
import { ActionUIScene } from "../ui-scene";

const SceneName = "timer";

/**
 * Class representing the Timer Scene.
 */
export class TimerScene extends ActionUIScene {
	/**
	 * Creates an instance of TimerScene.
	 * @param sceneManager - The SceneManager instance.
	 */
	constructor(sceneManager: SceneManager) {
		sceneManager.addToSceneHistory(SceneName);
		super("timer", sceneManager.getSourcePlayer());

		const timerExists = sceneManager.getWorldData().getTimer() != null;

		if (timerExists) {
			const timer = sceneManager.getWorldData().getTimer();
			if (timer == null) {
				console.error("No timer saved in sceneManager");
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
						sceneManager.getWorldData().getTimer()?.resume();
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
									handler: () => sceneManager.openScene("edit_timer"),
								},
								{
									label: "edu_tools.ui.buttons.exit",
									handler: () => sceneManager.openScene("timer"),
								},
							],
						};
						sceneManager.openScene("confirm", config);
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
										// Assuming reset logic is handled inside EditTimerScene or similar.
										sceneManager.openScene("timer");
									},
								},
								{
									label: "edu_tools.ui.buttons.exit",
									handler: () => sceneManager.openScene("timer"),
								},
							],
						};
						sceneManager.openScene("confirm", config);
					},
					"textures/edu_tools/ui/icons/timer/reset_timer",
				);
			} else {
				this.addButton(
					"edu_tools.ui.timer.buttons.pause",
					(): void => {
						sceneManager.getWorldData().getTimer()?.pause();
						sceneManager.openScene("timer");
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
									const timer = sceneManager.getWorldData().getTimer();
									if (timer) {
										timer.despawnTimer();
										sceneManager.getWorldData().clearTimer();
									}
									sceneManager.openScene("main");
								},
							},
							{
								label: "edu_tools.ui.buttons.exit",
								handler: () => sceneManager.openScene("timer"),
							},
						],
					};
					sceneManager.openScene("confirm", config);
				},
				"textures/edu_tools/ui/icons/timer/stop_timer",
			);

			if (sceneManager.getWorldData().getHideTimerEntity()) {
				this.addButton(
					"edu_tools.ui.timer.buttons.hide_timer",
					(): void => {
						sceneManager.getWorldData().toggeHideTimerEntity();
					},
					"textures/edu_tools/ui/icons/timer/hide_timer",
				);
			} else {
				this.addButton(
					"edu_tools.ui.timer.buttons.show_timer",
					(): void => {
						sceneManager.getWorldData().toggeHideTimerEntity();
					},
					"textures/edu_tools/ui/icons/timer/show_timer",
				);
			}

			this.addButton("edu_tools.ui.buttons.back", (): void => {
				sceneManager.openScene("main");
			});
		} else {
			this.addButton(
				"edu_tools.ui.timer.buttons.create",
				(): void => {
					sceneManager.openScene("edit_timer");
				},
				"textures/edu_tools/ui/icons/timer/create_timer",
			);
			this.addButton("edu_tools.ui.buttons.back", (): void => {
				sceneManager.openScene("main");
			});
		}
		this.show(sceneManager.getSourcePlayer());
	}
}
