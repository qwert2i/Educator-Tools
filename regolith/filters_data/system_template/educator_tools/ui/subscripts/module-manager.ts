import { PropertyStorage, CachedStorage } from "@shapescape/storage";
import { world } from "@minecraft/server";
import { TeamsService } from "./modules/teams/teams.service";
import { WorldSettingsService } from "./modules/world_settings/world-settings.service";
import { SceneManager } from "./modules/scene_manager/scene-manager";
import { ItemService } from "./modules/item/item.service";
import { MainService } from "./modules/main/main.service";

/**
 * Interface that all modules must implement.
 * Modules have an ID property that uniquely identifies them in the system.
 */
export interface Module {
	readonly id: string;
	initialize?(): void; // Optional method for module initialization
	/**
	 * Optional method for modules to register their scenes with the SceneManager.
	 * @param sceneManager - The SceneManager instance to register scenes with.
	 */
	registerScenes?(sceneManager: SceneManager): void;
}

export class ModuleManager {
	private static instance: ModuleManager;
	private readonly modules: Map<string, Module> = new Map();
	private readonly storage: PropertyStorage;

	/**
	 * Private constructor to prevent direct instantiation.
	 * @param storage - The property storage to use.
	 */
	private constructor(storage: PropertyStorage) {
		this.storage = storage;
		this.loadDefaultModules();
	}

	/**
	 * Gets the singleton instance of the ModuleManager.
	 * @returns The ModuleManager instance.
	 */
	public static getInstance(): ModuleManager {
		if (!ModuleManager.instance) {
			// Create with default world storage if not provided
			const storage = new CachedStorage(world);
			ModuleManager.instance = new ModuleManager(storage);
		}
		return ModuleManager.instance;
	}

	/**
	 * Initialize default modules like TeamsService.
	 */
	private loadDefaultModules(): void {
		// Create TeamsService with a scoped storage
		const teamsStorage = this.storage.getSubStorage("teams");
		const teamsService = new TeamsService(teamsStorage);
		const itemService = new ItemService(this);
		const sceneManager = SceneManager.getInstance(this, this.storage);
		const mainService = new MainService();

		// Create WorldSettingsService
		const worldSettingsStorage = this.storage.getSubStorage("world_settings");
		const worldSettingsService = new WorldSettingsService(worldSettingsStorage);

		// Register services
		this.registerModule(teamsService);
		this.registerModule(worldSettingsService);
		this.registerModule(itemService);
		// Register the SceneManager with the main storage
		this.registerModule(sceneManager);
		this.registerModule(mainService);

		// Initialize all modules
		this.initializeModules();
		// Register scenes for all modules that implement registerScenes
		this.registerAllModuleScenes(sceneManager);

		// Register main button for the main service
		for (const module of this.modules.values()) {
			if (typeof module.getMainButton === "function") {
				const buttonConfig = module.getMainButton();
				if (buttonConfig) {
					mainService.registerButton(module.id, buttonConfig);
				}
			}
		}
	}

	private initializeModules(): void {
		for (const module of this.modules.values()) {
			if (typeof module.initialize === "function") {
				module.initialize();
			}
		}
	}

	/**
	 * Registers a module.
	 * @param module - The module to register.
	 */
	registerModule(module: Module): void {
		if (this.modules.has(module.id)) {
			throw new Error(`Module ${module.id} is already registered.`);
		}
		this.modules.set(module.id, module);
	}

	/**
	 * Calls the registerScenes method on a module if it implements it.
	 * @param moduleId - The ID of the module.
	 * @param sceneManager - The SceneManager instance.
	 */
	registerModuleScenes(moduleId: string, sceneManager: SceneManager): void {
		const module = this.getModule<Module>(moduleId);
		if (module && typeof module.registerScenes === "function") {
			module.registerScenes(sceneManager);
		}
	}

	/**
	 * Registers scenes for all modules that implement the registerScenes method.
	 * @param sceneManager - The SceneManager instance.
	 */
	registerAllModuleScenes(sceneManager: SceneManager): void {
		for (const moduleId of this.getAllModules()) {
			this.registerModuleScenes(moduleId, sceneManager);
		}
	}

	/**
	 * Retrieves a module by its ID.
	 * @param id - The ID of the module to retrieve.
	 * @returns The module object if found, otherwise undefined.
	 */
	getModule<T extends Module>(id: string): T | undefined {
		return this.modules.get(id) as T | undefined;
	}

	/**
	 * Unregisters a module by its ID.
	 * @param id - The ID of the module to unregister.
	 */
	unregisterModule(id: string): void {
		if (!this.modules.has(id)) {
			throw new Error(`Module ${id} is not registered.`);
		}
		this.modules.delete(id);
	}

	/**
	 * Checks if a module is registered.
	 * @param id - The ID of the module to check.
	 * @returns True if the module is registered, otherwise false.
	 */
	isModuleRegistered(id: string): boolean {
		return this.modules.has(id);
	}

	/**
	 * Retrieves all registered modules.
	 * @returns An array of all registered module IDs.
	 */
	getAllModules(): string[] {
		return Array.from(this.modules.keys());
	}

	/**
	 * Gets the storage used by the ModuleManager.
	 * @returns The PropertyStorage instance.
	 */
	getStorage(): PropertyStorage {
		return this.storage;
	}
}
