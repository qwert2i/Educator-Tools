import { Player } from "@minecraft/server";
import { MainScene } from "./scenes/main.scene";
import { SetGamemodeScene } from "./scenes/set-gamemode.scene";
import { SetPlayersScene } from "./scenes/set-players.scene";
import { ConfirmScene, ConfirmSceneConfig } from "./scenes/confirm.scene";
import { WorldSettingsScene } from "./scenes/world-settings.scene";
import { TimerScene } from "./scenes/timer.scene";
import { EditTimerScene } from "./scenes/edit-timer.scene";
import { WorldData } from "./world-data";
import { LockPlayersScene } from "./scenes/lock-players.scene";
import { LockPlayersSettingsScene } from "./scenes/lock-players-settings.scene";
import { ManageHealthScene } from "./scenes/manage-health.scene";

type SceneFactory = (manager: SceneManager, ...args: any[]) => void;

/**
 * Class representing the Scene Manager.
 */
export class SceneManager {
	private sceneHistory: string[] = [];
	private worldData: WorldData;
	private sourcePlayer: Player;
	private subjectPlayersType:
		| "self"
		| "all"
		| "team"
		| "specific_player"
		| null = null;
	private subjectTeamName: string | null = null;
	private subjectPlayer: Player | null = null;
	private targetPlayersType:
		| "self"
		| "all"
		| "team"
		| "specific_player"
		| null = null;
	private targetTeamName: string | null = null;
	private targetPlayer: Player | null = null;
	private sceneRegistry: Map<string, SceneFactory> = new Map();

	/**
	 * Creates an instance of SceneManager.
	 * @param wd - The worldData object.
	 * @param sourcePlayer - The player who has the UI open.
	 */
	constructor(wd: WorldData, sourcePlayer: Player) {
		this.worldData = wd;
		this.sourcePlayer = sourcePlayer;
		this.registerScenes();
	}

	/**
	 * Registers scenes using a factory pattern.
	 */
	private registerScenes(): void {
		this.registerScene("main", (manager: SceneManager) => {
			new MainScene(manager);
			manager.clearSceneHistory();
			manager.resetSceneManager();
		});
		this.registerScene("set_gamemode", (manager: SceneManager) => {
			new SetGamemodeScene(manager);
		});
		// Now "set_players" expects an operation parameter.
		this.registerScene(
			"set_players",
			(manager: SceneManager, operation: string) => {
				new SetPlayersScene(manager, operation);
			},
		);
		this.registerScene(
			"confirm",
			(manager: SceneManager, config: ConfirmSceneConfig) => {
				new ConfirmScene(manager, config);
			},
		);
		this.registerScene("world_settings", (manager: SceneManager) => {
			new WorldSettingsScene(manager);
		});
		this.registerScene("timer", (manager: SceneManager) => {
			new TimerScene(manager);
		});
		this.registerScene("edit_timer", (manager: SceneManager) => {
			new EditTimerScene(manager, manager.worldData.getTimer() != null);
		});
		this.registerScene("lock_players", (manager: SceneManager) => {
			new LockPlayersScene(manager);
		});
		this.registerScene("lock_players_settings", (manager: SceneManager) => {
			new LockPlayersSettingsScene(manager);
		});
		this.registerScene("manage_health", (manager: SceneManager) => {
			new ManageHealthScene(manager);
		});
	}

	/**
	 * Registers a specific scene by name.
	 * @param sceneName - The name of the scene.
	 * @param factory - The scene factory function.
	 */
	private registerScene(sceneName: string, factory: SceneFactory): void {
		this.sceneRegistry.set(sceneName, factory);
	}

	/**
	 * Opens a registered scene.
	 * @param sceneName - The name of the scene to open.
	 */
	public openScene(sceneName: string, ...args: any[]): void {
		this.addToSceneHistory(sceneName);
		const sceneFactory = this.sceneRegistry.get(sceneName);
		if (sceneFactory) {
			sceneFactory(this, ...args);
		} else {
			console.error("Referenced sceneName is invalid");
		}
	}

	/**
	 * Goes back to the previously saved scene.
	 */
	public goBack(): void {
		this.sceneHistory.pop();
		const previousScene = this.sceneHistory[this.sceneHistory.length - 1];
		if (previousScene) {
			this.openScene(previousScene);
		}
	}

	/**
	 * Gets the worldData object.
	 * @returns The worldData object.
	 */
	public getWorldData(): WorldData {
		return this.worldData;
	}

	/**
	 * Gets the source player.
	 * @returns The player that has the UI open.
	 */
	public getSourcePlayer(): Player {
		return this.sourcePlayer;
	}

	/**
	 * Sets the current subject for this interaction.
	 * @param type - Defines the type of subject of the current operation.
	 * @param teamName - The team name of the subject.
	 * @param specificPlayer - The player object that is the subject.
	 */
	public setSubjectPlayersType(
		type: "self" | "all" | "team" | "specific_player" | null,
		teamName: string | null = null,
		specificPlayer: Player | null = null,
	): void {
		this.subjectPlayersType = type;
		this.subjectTeamName = teamName;
		this.subjectPlayer = specificPlayer;
	}

	/**
	 * Gets the current subject players type and associated option.
	 * @returns A tuple containing the subject players type and the team name or player.
	 */
	public getSubjectPlayersType(): [string | null, string | Player | null] {
		return [
			this.subjectPlayersType,
			this.subjectTeamName || this.subjectPlayer || null,
		];
	}

	/**
	 * Sets the current target for this interaction.
	 * @param type - Defines the type of target of the current operation.
	 * @param teamName - The team name of the target.
	 * @param specificPlayer - The player object that is the target.
	 */
	public setTargetPlayersType(
		type: "self" | "all" | "team" | "specific_player" | null,
		teamName: string | null = null,
		specificPlayer: Player | null = null,
	): void {
		this.targetPlayersType = type;
		this.targetTeamName = teamName;
		this.targetPlayer = specificPlayer;
	}

	/**
	 * Gets the current target players type and associated option.
	 * @returns A tuple containing the target players type and the team name or player.
	 */
	public getTargetPlayersType(): [string | null, string | Player | null] {
		return [this.targetPlayersType, this.targetTeamName || this.targetPlayer];
	}

	/**
	 * Adds a scene name to the scene history.
	 * @param sceneName - The name of the scene.
	 */
	public addToSceneHistory(sceneName: string): void {
		this.sceneHistory.push(sceneName);
	}

	/**
	 * Clears the entire scene history.
	 */
	public clearSceneHistory(): void {
		this.sceneHistory = [];
	}

	/**
	 * Resets the scene manager state.
	 */
	public resetSceneManager(): void {
		this.subjectPlayersType = null;
		this.subjectTeamName = null;
		this.subjectPlayer = null;
		this.targetPlayersType = null;
		this.targetTeamName = null;
		this.targetPlayer = null;
		this.clearSceneHistory();
	}
}
