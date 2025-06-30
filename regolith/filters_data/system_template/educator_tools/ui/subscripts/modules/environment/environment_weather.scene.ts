import { WeatherType } from "@minecraft/server";
import { ModalUIScene } from "../scene_manager/ui-scene";
import { SceneContext } from "../scene_manager/scene-context";
import { SceneManager } from "../scene_manager/scene-manager";
import { EnvironmentService } from "./environment.service";

export class EnvironmentWeatherScene extends ModalUIScene {
	static readonly id = "environment_weather";

	constructor(
		sceneManager: SceneManager,
		context: SceneContext,
		environmentService: EnvironmentService,
	) {
		super(EnvironmentWeatherScene.id, context.getSourcePlayer(), "confirm");

		this.setContext(context);

		const weatherTypes = Object.values(WeatherType);

		this.addDropdown(
			"edu_tools.ui.environment_weather.select_weather",
			weatherTypes,
			(selectedWeather: number): void => {
				environmentService.setWeather(weatherTypes[selectedWeather]);
			},
		);

		this.addToggle(
			"edu_tools.ui.environment_weather.set_weather_cycle",
			(isEnabled: boolean): void => {
				environmentService.setWeatherCycle(isEnabled);
			},
			environmentService.getWeatherCycle(),
		);

		this.show(context.getSourcePlayer(), sceneManager);
	}
}
