import {
	system,
	world,
	Dimension,
	Vector3,
	Player,
	EntityInventoryComponent,
	Container,
	ItemStack,
	ItemLockMode,
} from "@minecraft/server";
import { Timer } from "./mechanics/timer.mechanic";
import { lockPlayers } from "./mechanics/lock-player.mechanic";

/**
 * Class representing the world data.
 */
export class WorldData {
	private hostPlayer: Player;
	private currentTimer: Timer | null = null;
	private showTimerEntity: boolean = true;
	private startSavingData: boolean = false;
	private lockPlayersMode: number = 0;
	private lockPlayersDistance: number = 16;
	private lockPlayersActive: boolean = false;
	private lockPlayersCenter: Vector3 | Player | null = null;
	private lockPlayersReturnToCenter: boolean = false;

	/**
	 * Creates an instance of the world data.
	 */
	constructor() {
		// Delaying activation until a player fully spawns and making sure
		// that the data is only read once
		world.afterEvents.playerSpawn.subscribe((event) => {
			if (!this.startSavingData && event.initialSpawn && !this.hostPlayer) {
				let location: [location: Vector3, dimension: Dimension] | null = null;
				// remove all timer entities and get the location of last timer
				world
					.getDimension("overworld")
					.getEntities({ type: "edu_tools:timer" })
					.forEach((entity) => {
						location = [entity.location, entity.dimension];
						entity.remove();
					});

				// initialize the host player
				this.hostPlayer = event.player;

				// give them the Educator Tool if they do not have it yet
				const inventoryComponent = this.hostPlayer.getComponent(
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

				// initializing the properties of the world

				// get the dynamic properties of the world
				const worldProperties: string[] = world.getDynamicPropertyIds();

				// re-initialize timers if the world has timer
				if (worldProperties.includes("hasTimer")) {
					if (world.getDynamicProperty("hasTimer") as boolean) {
						const maxTime: number = world.getDynamicProperty(
							"timerMaxTime",
						) as number;
						const time: number = world.getDynamicProperty(
							"timerTime",
						) as number;
						if (location != null) {
							this.currentTimer = new Timer(
								maxTime,
								world.getPlayers()[0],
								this,
								time,
								location,
							);
						} else {
							this.currentTimer = new Timer(
								maxTime,
								world.getPlayers()[0],
								this,
								time,
							);
						}
					}
				}

				// load the showTimerEntity property and hide/show the timer
				// entity if exists
				if (worldProperties.includes("showTimerEntity")) {
					if (world.getDynamicProperty("showTimerEntity") as boolean) {
						this.showTimerEntity = true;
						if (this.currentTimer) {
							this.currentTimer?.getTimerEntity().removeEffect("invisibility");
						}
					} else {
						this.showTimerEntity = false;
						if (this.currentTimer) {
							this.currentTimer
								?.getTimerEntity()
								.addEffect("invisibility", 99999, {
									showParticles: false,
								});
						}
					}
				}

				// load the lockPlayersMode properties
				if (worldProperties.includes("lockPlayersMode")) {
					this.lockPlayersMode = world.getDynamicProperty(
						"lockPlayersMode",
					) as number;
				}
				if (worldProperties.includes("lockPlayersDistance")) {
					this.lockPlayersDistance = world.getDynamicProperty(
						"lockPlayersDistance",
					) as number;
				}
				if (worldProperties.includes("lockPlayersActive")) {
					this.lockPlayersActive = world.getDynamicProperty(
						"lockPlayersActive",
					) as boolean;
				}

				if (worldProperties.includes("lockPlayersReturnToCenter")) {
					this.lockPlayersReturnToCenter = world.getDynamicProperty(
						"lockPlayersReturnToCenter",
					) as boolean;
				}

				lockPlayers(this);

				if (worldProperties.includes("lockPlayersCenter")) {
					const property = world.getDynamicProperty("lockPlayersCenter");
					if (property == "host") {
						this.lockPlayersCenter = this.hostPlayer;
					} else {
						this.lockPlayersCenter = this.getLockPlayersCenter();
					}
				} else {
					this.lockPlayersCenter = this.hostPlayer.location;
				}
				// start saving data
				this.startSavingData = true;
			}
		});

		// write dynamic properties to world every 0.5 seconds
		system.runInterval(this.writeDynamicDataToWorldProperties.bind(this), 10);
	}

	/**
	 * Sets the timer object.
	 * @param timer - The timer object that is supposed to be set.
	 */
	setTimer(timer: Timer): void {
		this.currentTimer = timer;
	}

	/**
	 * Gets the current timer object.
	 * @returns The current timer object.
	 */
	getTimer(): Timer | null {
		return this.currentTimer;
	}

	/**
	 * Removes the current timer object.
	 */
	clearTimer() {
		this.currentTimer = null;
		world.setDynamicProperty("hasTimer", false);
		world.setDynamicProperty("timerMaxTime", 0);
		world.setDynamicProperty("timerTime", 0);
	}

	/**
	 * Toggles the visibility of the timer entity.
	 */
	toggeHideTimerEntity() {
		this.showTimerEntity = !this.showTimerEntity;
		world.setDynamicProperty("showTimerEntity", this.showTimerEntity);
		if (this.showTimerEntity) {
			this.currentTimer?.getTimerEntity().removeEffect("invisibility");
		} else {
			this.currentTimer?.getTimerEntity().addEffect("invisibility", 99999, {
				showParticles: false,
			});
		}
	}

	/**
	 * @returns The visibility of the timer entity.
	 */
	getHideTimerEntity(): boolean {
		return this.showTimerEntity;
	}

	/**
	 * Sets the lock players mode.
	 * @param index - The lock players mode.
	 */
	setLockPlayersMode(index: number) {
		this.lockPlayersMode = index;
		world.setDynamicProperty("lockPlayersMode", index);
	}

	/**
	 * @returns The lock players mode.
	 */
	getLockPlayersMode(): number {
		return this.lockPlayersMode;
	}

	/**
	 * Sets the lock players distance.
	 * @param distance - The lock players distance.
	 */
	setLockPlayersDistance(distance: number) {
		this.lockPlayersDistance = distance;
		world.setDynamicProperty("lockPlayersDistance", distance);
	}

	/**
	 * @returns The lock players distance.
	 */
	getLockPlayersDistance(): number {
		return this.lockPlayersDistance;
	}

	/**
	 * Sets the lock players active.
	 * @param active - The lock players active.
	 */
	setLockPlayersActive(active: boolean) {
		this.lockPlayersActive = active;
		world.setDynamicProperty("lockPlayersActive", active);
	}

	/**
	 * @returns The lock players active.
	 */
	getLockPlayersActive(): boolean {
		return this.lockPlayersActive;
	}

	/**
	 * Sets the lock players center.
	 * @param center - The lock players center.
	 */
	setLockPlayersCenter(center: Vector3 | Player) {
		this.lockPlayersCenter = center;
		if (center instanceof Player) {
			world.setDynamicProperty("lockPlayersCenter", "host");
		} else {
			world.setDynamicProperty("lockPlayersCenter", center);
		}
	}

	/**
	 * @returns The lock players center.
	 */
	getLockPlayersCenter(): Vector3 | Player | null {
		return this.lockPlayersCenter;
	}

	/**
	 * Sets if the player should be teleported to center if to far away.
	 * @param returnToCenter boolean
	 */
	setLockPlayersReturnToCenter(returnToCenter: boolean) {
		this.lockPlayersReturnToCenter = returnToCenter;
		world.setDynamicProperty("lockPlayersReturnToCenter", returnToCenter);
	}

	/**
	 * @returns If lockedPlayers should be teleported to center if to far away.
	 * If not teleports to next viable position within the area.
	 */
	getLockPlayersReturnToCenter(): boolean {
		return this.lockPlayersReturnToCenter;
	}

	/**
	 * @returns The host player.
	 */
	getHostPlayer(): Player {
		return this.hostPlayer;
	}

	/**
	 * Writes the dynamic properties to the world.
	 */
	writeDynamicDataToWorldProperties() {
		if (!this.startSavingData) {
			return;
		}
		// Write dynamic properties to world
		if (this.currentTimer) {
			world.setDynamicProperty("hasTimer", true);
			world.setDynamicProperty("timerMaxTime", this.currentTimer.getMaxTime());
			world.setDynamicProperty("timerTime", this.currentTimer.getTime());
		}
	}
}
