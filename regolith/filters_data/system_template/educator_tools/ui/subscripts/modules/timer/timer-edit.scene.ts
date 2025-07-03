import { RawMessage } from "@minecraft/server";
import { SceneContext } from "../scene_manager/scene-context";
import { SceneManager } from "../scene_manager/scene-manager";
import { ModalUIScene, RawBodyElement } from "../scene_manager/ui-scene";
import { Timer, TimerDuration, TimerService } from "./timer.service";

export class TimerEditScene extends ModalUIScene {
	static readonly id = "edit_timer";

	constructor(
		sceneManager: SceneManager,
		context: SceneContext,
		private readonly timerService: TimerService,
	) {
		super(TimerEditScene.id, context.getSourcePlayer(), "main");

		this.setContext(context);
		const timer = timerService.getTimer();

		const times = Object.values(TimerDuration).map((duration) => {
			if (typeof duration !== "number") {
				return duration; // Skip non-numeric values
			}
			const hours = Math.floor(duration / 3600);
			const minutes = Math.floor((duration % 3600) / 60);
			const seconds = duration % 60;

			const stringBuilder: RawBodyElement[] = [];

			if (hours > 0) {
				const stringBuilder: RawBodyElement[] = [
					{
						text: hours.toString().padStart(2, "0"),
					},
				];
				if (hours > 1) {
					stringBuilder.push({
						translate: "edu_tools.ui.timer.time.hours",
					});
				} else {
					stringBuilder.push({
						translate: "edu_tools.ui.timer.time.hour",
					});
				}
			}
			if (minutes > 0) {
				const stringBuilder: RawBodyElement[] = [
					{
						text: minutes.toString().padStart(2, "0"),
					},
				];
				if (minutes > 1) {
					stringBuilder.push({
						translate: "edu_tools.ui.timer.time.minutes",
					});
				} else {
					stringBuilder.push({
						translate: "edu_tools.ui.timer.time.minute",
					});
				}
			}
			if (seconds > 0) {
				const stringBuilder: RawBodyElement[] = [
					{
						text: seconds.toString().padStart(2, "0"),
					},
				];
				if (seconds > 1) {
					stringBuilder.push({
						translate: "edu_tools.ui.timer.time.seconds",
					});
				} else {
					stringBuilder.push({
						translate: "edu_tools.ui.timer.time.second",
					});
				}
			}

			const rawMessage: RawMessage = {
				rawtext: stringBuilder,
			};
			return rawMessage;
		});

		this.addDropdown(
			"edu_tools.ui.timer_edit.time",
			times,
			(selectedIndex: number): void => {
				const selectedTime = Object.values(TimerDuration)[selectedIndex];
				context.setData("timer_duration", selectedTime);
			},
			timer ? Object.values(TimerDuration).indexOf(timer.duration) : 0,
		);

		this.addToggle(
			"edu_tools.ui.timer_edit.show_timer_entity",
			(value: boolean): void => {
				context.setData("show_timer", value);
			},
			timer ? !!timer.entityShown : true,
		);

		this.show(context.getSourcePlayer(), sceneManager).then(() => {
			this.applyChanges(context);
		});
	}

	private applyChanges(context: SceneContext): void {
		const duration = context.getData("timer_duration") || 60;
		const showTimer = context.getData("show_timer") || true;
		const timer: Partial<Timer> = {
			duration: duration,
			entityShown: showTimer,
		};

		if (this.timerService.getTimer()) {
			this.timerService.updateTimer(timer);
		} else {
			// If no timer exists, create a new one
			// This will create a new timer with the provided name, description, and duration
			this.timerService.newTimer(timer, context.getSourcePlayer());
		}
	}
}
