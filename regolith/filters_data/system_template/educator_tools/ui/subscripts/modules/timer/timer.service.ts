import { Module } from "../../module-manager";
import { SceneManager } from "../scene_manager/scene-manager";
import { SceneContext } from "../scene_manager/scene-context";
import { Player, Dimension, Vector3 } from "@minecraft/server";
import { Timer } from "./timer.mechanic";
import { TimerScene } from "./timer.scene";
import { EditTimerScene } from "./edit-timer.scene";

/**
 * Service for managing timers.
 * This service allows creating, editing, and controlling timers.
 */
export class TimerService implements Module {
	public static readonly id = "timer";
	private timer: Timer | null = null;
	private hideTimerEntity: boolean = false;

	constructor() {}

	/**
	 * Registers scenes related to timer management.
	 * @param sceneManager - The scene manager
	 */
	registerScenes(sceneManager: SceneManager): void {
		sceneManager.registerScene(
			"timer",
			(manager: SceneManager, context: SceneContext) => {
				new TimerScene(manager, context);
			},
		);

		sceneManager.registerScene(
			"edit_timer",
			(manager: SceneManager, context: SceneContext) => {
				new EditTimerScene(manager, context);
			},
		);
	}

	/**
	 * Gets the current timer.
	 * @returns The current timer or null if no timer is set
	 */
	getTimer(): Timer | null {
		return this.timer;
	}

	/**
	 * Sets a new timer.
	 * @param timer - The timer to set
	 */
	setTimer(timer: Timer): void {
		this.timer = timer;
	}

	/**
	 * Clears the current timer.
	 */
	clearTimer(): void {
		this.timer = null;
	}

	/**
	 * Checks if the timer entity is hidden.
	 * @returns True if the timer entity is hidden, false otherwise
	 */
	getHideTimerEntity(): boolean {
		return this.hideTimerEntity;
	}

	/**
	 * Toggles the visibility of the timer entity.
	 * @returns The new hide state
	 */
	toggleHideTimerEntity(): boolean {
		this.hideTimerEntity = !this.hideTimerEntity;

		// If we have a timer, update its entity visibility
		if (this.timer) {
			if (this.hideTimerEntity) {
				this.timer.getTimerEntity().triggerEvent("edu_tools:hide_timer");
			} else {
				this.timer.getTimerEntity().triggerEvent("edu_tools:show_timer");
			}
		}

		return this.hideTimerEntity;
	}

	/**
	 * Creates a new timer.
	 * @param seconds - The duration of the timer in seconds
	 * @param player - The player who created the timer
	 * @param location - Optional location and dimension to spawn the timer
	 * @returns The created timer
	 */
	createTimer(
		seconds: number,
		player: Player,
		location?: [location: Vector3, dimension: Dimension],
	): Timer {
		// If there's an existing timer, despawn it
		if (this.timer) {
			this.timer.despawnTimer();
		}

		// Create a new timer
		const timer = new Timer(seconds, player, this, undefined, location);
		this.setTimer(timer);
		return timer;
	}

	/**
	 * Resets the timer.
	 * @param seconds - The new duration of the timer in seconds
	 * @returns The reset timer or null if no timer exists
	 */
	resetTimer(seconds: number): Timer | null {
		if (this.timer) {
			this.timer.resetTimer(seconds);
			return this.timer;
		}
		return null;
	}
}
