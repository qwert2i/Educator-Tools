import { SceneContext } from "../scene_manager/scene-context";
import { SceneManager } from "../scene_manager/scene-manager";
import { ActionUIScene } from "../scene_manager/ui-scene";
import { EnvironmentService } from "./environment.service";

export class EnvironmentScene extends ActionUIScene {
	static readonly id = "environment";

	constructor(
		sceneManager: SceneManager,
		context: SceneContext,
		environmentService: EnvironmentService,
	) {
		super(EnvironmentScene.id, context.getSourcePlayer());

		this.setContext(context);
		this.setSimpleBody("edu_tools.ui.environment.body");

		this.addButton(
			"edu_tools.ui.environment.buttons.daytime_settings",
			(): void => {
				sceneManager.openSceneWithContext(context, "environment_daytime", true);
			},
			"textures/edu_tools/ui/icons/environment/daytime_settings",
		);

		this.addButton(
			"edu_tools.ui.environment.buttons.weather_settings",
			(): void => {
				sceneManager.openSceneWithContext(context, "environment_weather", true);
			},
			"textures/edu_tools/ui/icons/environment/weather_settings",
		);

		this.addButton(
			"edu_tools.ui.environment.buttons.always_day",
			(): void => {
				environmentService.alwaysDay();
				this.player.sendMessage("edu_tools.message.environment.always_day_set");
				sceneManager.openSceneWithContext(context, "environment", false);
			},
			"textures/edu_tools/ui/icons/environment/always_day",
		);

		this.addButton(
			"edu_tools.ui.buttons.back",
			() => {
				sceneManager.goBackToScene(context, "main");
			},
			"textures/edu_tools/ui/icons/_general/back",
		);

		this.show(context.getSourcePlayer(), sceneManager);
	}
}
