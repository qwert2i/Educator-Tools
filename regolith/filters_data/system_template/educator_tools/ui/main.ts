import { world, Player, ItemUseAfterEvent } from "@minecraft/server";
import { SceneManager } from "./subscripts/scene-manager";
import { WorldData } from "./subscripts/world-data";

const wd: WorldData = new WorldData();

// Subscribe to the item use event
world.afterEvents.itemUse.subscribe((event: ItemUseAfterEvent) => {
	// Check if the used item is the educator tool
	if (event.itemStack.typeId === "edu_tools:educator_tool") {
		if (event.source === wd.getHostPlayer()) {
			// Create a new SceneManager instance and open the main scene
			const sceneManager = new SceneManager(wd, event.source as Player);
			sceneManager.openScene("main");
		} else {
			// Send a message to the player that they are not allowed to use the educator tool
			event.source.sendMessage({
				translate: "edu_tools.message.no_host",
			});
		}
	}
});
