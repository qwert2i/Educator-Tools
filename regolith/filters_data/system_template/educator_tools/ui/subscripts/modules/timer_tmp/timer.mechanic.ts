import {
	Dimension,
	Entity,
	EntityHealthComponent,
	Player,
	system,
	Vector3,
	world,
} from "@minecraft/server";
import { playSoundToAllPlayers } from "../../utils/play-sounds";
import { TimerService } from "./timer.service";

/*
 * Class representing a Timer.
 */
export class Timer {
	protected maxTime: number;
	protected time: number;
	protected timerEntity: Entity;
	protected timerEntityHealthComponent: EntityHealthComponent;
	protected paused: boolean = true;
	private timerService: TimerService;
	private intervalHandle: number | null = null;

	private timeEvents: { [key: number]: string } = {
		30: "edu_tools:30_seconds",
		60: "edu_tools:1_minute",
		120: "edu_tools:2_minutes",
		180: "edu_tools:3_minutes",
		300: "edu_tools:5_minutes",
		600: "edu_tools:10_minutes",
		900: "edu_tools:15_minutes",
		1800: "edu_tools:30_minutes",
		2700: "edu_tools:45_minutes",
		3600: "edu_tools:60_minutes",
		5400: "edu_tools:90_minutes",
	};

	/**
	 * Creates an instance of a timer.
	 *
	 * @param seconds - The number of seconds for the timer.
	 * @param player - The player that creates the timer.
	 * @param timerService - The timerService instance.
	 * @param time - The current time of the timer.
	 * @param location - The location to spawn the timer.
	 */
	constructor(
		seconds: number,
		player: Player,
		timerService: TimerService,
		time?: number,
		location?: [location: Vector3, dimension: Dimension],
	) {
		// Set the maxTime and time properties
		this.maxTime = seconds;
		if (time) {
			this.time = time;
		} else {
			this.time = seconds;
		}

		// Initialize the spawnDimension and spawnLocation
		let spawnDimension: Dimension;
		let spawnLocation: Vector3;

		if (location) {
			spawnLocation = location[0];
			spawnDimension = location[1];
		} else {
			spawnLocation = player.location;
			spawnDimension = player.dimension;
		}

		// Initialize the timerService property
		this.timerService = timerService;

		// Spawn the timer
		this.spawnTimer(spawnDimension, spawnLocation);

		// Start ticking the timer
		this.intervalHandle = system.runInterval(this.updateTimer.bind(this), 20);
	}

	/**
	 * Spawns the timer entity
	 *
	 * @param spawnDimension - The dimension the entity will spawn in.
	 * @param spawnLocation - The location the entity will spawn at.
	 */
	private spawnTimer(spawnDimension: Dimension, spawnLocation: Vector3) {
		if (this.timeEvents[this.maxTime]) {
			this.timerEntity = spawnDimension.spawnEntity(
				"edu_tools:timer",
				spawnLocation,
			);
			this.timerEntity.triggerEvent(this.timeEvents[this.maxTime]);
		} else {
			throw new Error("Selected time does not match timeEvents.");
		}

		if (this.timerEntity.hasComponent("minecraft:health")) {
			this.timerEntityHealthComponent = this.timerEntity.getComponent(
				"minecraft:health",
			) as EntityHealthComponent;
		} else {
			throw new Error("Timer entity does not have a health component.");
		}

		if (this.time != this.maxTime) {
			this.timerEntityHealthComponent.setCurrentValue(this.time);
		}

		this.timerEntity.triggerEvent(
			"edu_tools:set_timer_" + this.formatTime(this.time).replace(/:/g, "_"),
		);
	}

	/**
	 * Updates the timer
	 */
	private updateTimer() {
		if (this.paused) {
			const isBaby = this.timerEntity.getComponent("minecraft:is_baby");
			if (isBaby == undefined) {
				this.timerEntity.triggerEvent("edu_tools:pause_timer");
				this.timerEntity.nameTag = "--:--:--";
			} else {
				this.timerEntity.triggerEvent("edu_tools:clear_timer");
				this.timerEntity.triggerEvent(
					"edu_tools:set_timer_" +
						this.formatTime(this.time).replace(/:/g, "_"),
				);
				this.timerEntity.nameTag = this.formatTime(this.time);
			}
			return;
		}
		this.time--;
		if (this.time == 30 && this.maxTime != 30) {
			playSoundToAllPlayers("random.anvil_land", 0.3, 2);
			world.sendMessage({
				translate: "edu_tools.ui.timer.chat.30_seconds_left",
			});
		} else if (this.time == 10) {
			playSoundToAllPlayers("random.anvil_land", 0.3, 2);
			world.sendMessage({
				translate: "edu_tools.ui.timer.chat.10_seconds_left",
			});
		} else if (this.time == 5) {
			playSoundToAllPlayers("random.anvil_land", 0.3, 2);
			world.sendMessage({
				translate: "edu_tools.ui.timer.chat.5_seconds_left",
			});
		} else if (this.time == 4) {
			playSoundToAllPlayers("random.anvil_land", 0.3, 2);
			world.sendMessage({
				translate: "edu_tools.ui.timer.chat.4_seconds_left",
			});
		} else if (this.time == 3) {
			playSoundToAllPlayers("random.anvil_land", 0.3, 2);
			world.sendMessage({
				translate: "edu_tools.ui.timer.chat.3_seconds_left",
			});
		} else if (this.time == 2) {
			playSoundToAllPlayers("random.anvil_land", 0.3, 2);
			world.sendMessage({
				translate: "edu_tools.ui.timer.chat.2_seconds_left",
			});
		} else if (this.time == 1) {
			playSoundToAllPlayers("random.anvil_land", 0.3, 2);
			world.sendMessage({
				translate: "edu_tools.ui.timer.chat.1_second_left",
			});
		} else if (this.time == 0) {
			playSoundToAllPlayers("random.anvil_use", 0.3, 2);
			world.sendMessage({
				translate: "edu_tools.ui.timer.chat.time_is_up",
			});
		}

		if (this.time <= 0) {
			this.paused = true;
			this.timerService.clearTimer(); // Use TimerService instead of WorldData
			this.despawnTimer();
		} else {
			this.timerEntityHealthComponent.setCurrentValue(this.time);
			this.timerEntity.triggerEvent(
				"edu_tools:set_timer_" + this.formatTime(this.time).replace(/:/g, "_"),
			);
			this.timerEntity.nameTag = this.formatTime(this.time);
		}
	}

	/**
	 * Despawns the timer entity
	 */
	despawnTimer() {
		if (this.intervalHandle) {
			system.clearRun(this.intervalHandle);
			this.intervalHandle = null;
		}
		this.timerEntity.remove();
	}

	/**
	 * Formats the time in seconds to a string.
	 *
	 * @param seconds - The time in seconds.
	 * @returns The formatted time string.
	 */
	private formatTime(seconds: number): string {
		const hours = Math.floor(seconds / 3600);
		const minutes = Math.floor((seconds % 3600) / 60);
		const secs = seconds % 60;
		return `0${hours}:${minutes.toString().padStart(2, "0")}:${secs
			.toString()
			.padStart(2, "0")}`;
	}

	/**
	 * Resets the timer.
	 *
	 * @param seconds - The number of seconds to reset the timer to.
	 */
	resetTimer(seconds: number) {
		this.timerEntity.remove();
		this.paused = true;

		this.time = seconds;
		this.maxTime = seconds;

		const spawnDimension = world.getDimension("overworld");
		const spawnLocation = spawnDimension.getPlayers()[0].location;

		this.spawnTimer(spawnDimension, spawnLocation);
	}

	/**
	 * Gets the maximum time of the timer.
	 * @returns The maximum time in seconds
	 */
	getMaxTime() {
		return this.maxTime;
	}

	/**
	 * Gets the current time of the timer.
	 * @returns The current time in seconds
	 */
	getTime() {
		return this.time;
	}

	/**
	 * Pauses the timer.
	 */
	pause() {
		this.paused = true;
	}

	/**
	 * Checks if the timer is paused.
	 * @returns Whether the timer is paused
	 */
	isPaused() {
		return this.paused;
	}

	/**
	 * Resumes the timer.
	 */
	resume() {
		this.paused = false;
	}

	/**
	 * Gets the timer entity.
	 * @returns The timer entity
	 */
	getTimerEntity() {
		return this.timerEntity;
	}
}
