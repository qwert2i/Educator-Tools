import { Player, world } from "@minecraft/server";
import { SceneContext } from "../scene_manager/scene-context";
import { SceneManager } from "../scene_manager/scene-manager";
import { ModalUIScene } from "../scene_manager/ui-scene";
import { CopyInventoryService } from "./copy-inventory.service";

export class CopyItemScene extends ModalUIScene {
	static readonly id = "copy_item";

	constructor(
		sceneManager: SceneManager,
		context: SceneContext,
		private copyInventoryService: CopyInventoryService,
	) {
		super(CopyItemScene.id, context.getSourcePlayer(), "confirm");
		const sourcePlayer = world.getEntity(
			context.getSubjectTeam()!.memberIds[0],
		) as Player;

		const items = this.copyInventoryService.getItemsInInventory(sourcePlayer);
		const itemStacks = items.map((itemData) => itemData.itemName);

		this.addDropdown(
			"edu_tools.ui.copy_item.select_item",
			itemStacks,
			(selectedItem: number): void => {
				this.copyInventoryService.copyItemToTeam(
					sourcePlayer,
					context.getTargetTeam()!,
					items[selectedItem].index,
				);
			},
		);

		this.show(context.getSourcePlayer(), sceneManager);
	}
}
