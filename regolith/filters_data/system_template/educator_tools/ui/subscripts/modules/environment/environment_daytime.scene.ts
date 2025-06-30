import { DaytimeType, TimeOfDay } from "@minecraft/server";
import { ModalUIScene } from "../scene_manager/ui-scene";
import { SceneContext } from "../scene_manager/scene-context";
import { SceneManager } from "../scene_manager/scene-manager";
import { EnvironmentService } from "./environment.service";

export class EnvironmentDaytimeScene extends ModalUIScene {
	static readonly id = "environment_daytime";

	constructor(
		sceneManager: SceneManager,
		context: SceneContext,
		environmentService: EnvironmentService,
	) {
		super(EnvironmentDaytimeScene.id, context.getSourcePlayer(), "confirm");

		this.setContext(context);

		const daytimes = Object.keys(TimeOfDay).filter((key) => isNaN(Number(key)));

		this.addDropdown(
			"edu_tools.ui.environment_daytime.select_daytime",
			daytimes,
			(selectedDaytime: number): void => {
				environmentService.setDayTime(
					TimeOfDay[daytimes[selectedDaytime] as keyof typeof TimeOfDay],
				);
			},
		);

		this.addToggle(
			"edu_tools.ui.environment_daytime.set_daytime_cycle",
			(isEnabled: boolean): void => {
				environmentService.setDayLightCycle(isEnabled);
			},
			environmentService.getDayLightCycle(),
		);

		this.show(context.getSourcePlayer(), sceneManager);
	}
}
