import { Player, world } from "@minecraft/server";
import { SceneContext } from "../scene_manager/scene-context";
import { SceneManager } from "../scene_manager/scene-manager";
import { ActionUIScene } from "../scene_manager/ui-scene";
import { CopyInventoryService } from "./copy-inventory.service";

export class CopyInventoryScene extends ActionUIScene {
	static readonly id = "copy_inventory";

	constructor(
		sceneManager: SceneManager,
		context: SceneContext,
		private copyInventoryService: CopyInventoryService,
	) {
		super(CopyInventoryScene.id, context.getSourcePlayer());
		const sourcePlayer = world.getEntity(
			context.getSubjectTeam()!.memberIds[0],
		) as Player;

		// Dynamically add toggles for all game rules
		this.setRawBody([
			{
				translate: "edu_tools.ui.copy_inventory.body.1",
			},
			{
				text: " §9",
			},
			{
				text: context.getSubjectTeam()!.name,
			},
			{
				text: " §r",
			},
			{
				translate: "edu_tools.ui.copy_inventory.body.body.2",
			},
			{
				text: " §9",
			},
			{
				text: context.getTargetTeam()!.name,
			},
		]);

		this.addButton(
			"edu_tools.ui.copy_inventory.buttons.copy_inventory",
			(): void => {
				this.copyInventoryService.copyInventoryToTeam(
					sourcePlayer,
					context.getTargetTeam()!,
				);
			},
			"textures/edu_tools/ui/icons/copy_inventory/copy_inventory",
		);

		this.addButton(
			"edu_tools.ui.copy_inventory.buttons.copy_hotbar",
			(): void => {
				this.copyInventoryService.copyHotbarToTeam(
					sourcePlayer,
					context.getTargetTeam()!,
				);
			},
			"textures/edu_tools/ui/icons/copy_inventory/copy_hotbar",
		);

		this.addButton(
			"edu_tools.ui.copy_inventory.buttons.copy_item",
			(): void => {
				sceneManager.openSceneWithContext(context, "copy_item", false);
			},
			"textures/edu_tools/ui/icons/copy_inventory/copy_item",
		);

		this.show(context.getSourcePlayer(), sceneManager);
	}
}
