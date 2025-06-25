import {
	world,
	Player,
	ItemUseAfterEvent,
	Container,
	EntityInventoryComponent,
	ItemLockMode,
	ItemStack,
	PlayerSpawnAfterEvent,
} from "@minecraft/server";
import { SceneManager } from "./subscripts/modules/scene_manager/scene-manager";
import { PropertyStorage, CachedStorage } from "@shapescape/storage";
import { ModuleManager } from "./subscripts/module-manager";

const wd: WorldData = new WorldData();

class EducatorTools {
	private readonly storage: PropertyStorage;
	private readonly moduleManager: ModuleManager;

	constructor() {
		this.storage = new CachedStorage(world);

		// Initialize the singleton ModuleManager
		this.moduleManager = ModuleManager.getInstance();

		this.registerEvents();
	}

	private registerEvents(): void {
		// Register the item use event for the educator tool
		world.afterEvents.itemUse.subscribe((event: ItemUseAfterEvent) => {
			if (event.itemStack.typeId === "edu_tools:educator_tool") {
				this.onEducatorToolUse(event);
			}
		});
		// Register the player spawn event to give the educator tool to the player
		world.afterEvents.playerSpawn.subscribe((event: PlayerSpawnAfterEvent) => {
			this.onPlayerSpawn(event);
		});
	}

	private onEducatorToolUse(event: ItemUseAfterEvent): void {
		const player = event.source as Player;
		if (this.isPlayerATeacher(player)) {
			// Create a new SceneManager instance with our PropertyStorage
			const sceneManager = new SceneManager(this.storage);
			// Create a context and open the main scene
			sceneManager.createContextAndOpenScene(player, "main");
		} else {
			// Send a message to the player that they are not allowed to use the educator tool
			event.source.sendMessage({
				translate: "edu_tools.message.no_host",
			});
		}
	}

	private giveEducatorTool(player: Player): void {
		// give them the Educator Tool if they do not have it yet
		const inventoryComponent = player.getComponent(
			"inventory",
		) as EntityInventoryComponent;
		const inventory = inventoryComponent.container as Container;

		let hasEducatorTool = false;

		for (let i = 0; i < inventory.size; i++) {
			const item = inventory.getItem(i);
			if (item === undefined) {
				continue;
			}
			// if the slot has an emerald item stack add the number of emeralds to
			// the coins variable
			if (item.typeId === "edu_tools:educator_tool") {
				hasEducatorTool = true;
				break;
			}
		}

		if (!hasEducatorTool) {
			let educatorTool = new ItemStack("edu_tools:educator_tool", 1);
			educatorTool.lockMode = ItemLockMode.inventory;
			inventory.addItem(educatorTool);
		}
	}

	private onPlayerSpawn(event: PlayerSpawnAfterEvent): void {
		if (world.getAllPlayers().length === 1) {
			this.setPlayerTeacher(event.player, true);
		}
		if (this.isPlayerATeacher(event.player)) {
			this.giveEducatorTool(event.player);
		}
	}

	private isPlayerATeacher(player: Player): boolean {
		const teachers = this.storage.get("teachers") as string[];
		if (teachers === undefined) {
			return false;
		}
		return teachers.includes(player.nameTag);
	}

	private setPlayerTeacher(player: Player, teacher: boolean): void {
		if (teacher) {
			const teachers = this.storage.get("teachers") as string[];
			if (teachers === undefined) {
				this.storage.rPush("teachers", player.nameTag);
			} else {
				if (!teachers.includes(player.nameTag)) {
					this.storage.rPush("teachers", player.nameTag);
				}
			}
		} else {
			const teachers = this.storage.get("teachers") as string[];
			if (teachers === undefined) {
				return;
			}
			if (teachers.includes(player.nameTag)) {
				this.storage.set(
					"teachers",
					teachers.filter((name) => name !== player.nameTag),
				);
			}
		}
	}
}

// Initialize the Educator Tools
new EducatorTools();
