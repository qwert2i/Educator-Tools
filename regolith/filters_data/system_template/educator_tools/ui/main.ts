import { world } from "@minecraft/server";
import { PropertyStorage, CachedStorage } from "@shapescape/storage";
import { ModuleManager } from "./subscripts/module-manager";

class EducatorTools {
	private readonly storage: PropertyStorage;
	private readonly moduleManager: ModuleManager;

	constructor() {
		this.storage = new CachedStorage(world);

		// Initialize the singleton ModuleManager
		this.moduleManager = ModuleManager.getInstance();
	}
}

// Initialize the Educator Tools
new EducatorTools();
