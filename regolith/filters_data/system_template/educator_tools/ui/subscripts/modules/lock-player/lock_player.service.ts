import { Player, Vector3, world } from "@minecraft/server";
import { CachedStorage, PropertyStorage } from "@shapescape/storage";
import { SceneContext } from "../scene_manager/scene-context";

export interface LockSettings {
	radius: number; // The radius around the player that will be locked
	center: Vector3; // The center point of the lock, can be a Vector3
	playerBound?: string; // The UUID of the player to lock, if applicable
	teleportToCenter: boolean; // Whether to teleport the player to the center point
	showBoundaries: boolean; // Whether to show the boundaries of the locked area
	showLockMessage: boolean; // Whether to show a message when the player is locked
}

export class LockPlayerService {
	static readonly id = "lock_player";
	private readonly storage: PropertyStorage;
	private readonly lockStorage: PropertyStorage;

	constructor() {
		this.storage = new CachedStorage(world, "lock_player");
		this.lockStorage = this.storage.getSubStorage("locks");
	}

	getLockSettings(teamId: string): LockSettings | undefined {
		return this.lockStorage.get(teamId) as LockSettings | undefined;
	}

	setLockSettings(teamId: string, settings: LockSettings): void {
		this.lockStorage.set(teamId, settings);
	}

	clearLockSettings(teamId: string): void {
		this.lockStorage.drop(teamId);
	}

	clearAllLocks(): void {
		this.lockStorage.clear();
	}

	getLockedTeams(): string[] {
		return Object.keys(this.lockStorage.getAll());
	}

	updateLockSettings(teamId: string, settings: Partial<LockSettings>): void {
		const currentSettings = this.getLockSettings(teamId) || {};
		const updatedSettings = { ...currentSettings, ...settings };
		this.lockStorage.set(teamId, updatedSettings);
	}

	confirmAction(context: SceneContext): void {
		const subjectTeam = context.getSubjectTeam()!;
		const targetTeam = context.getTargetTeam();
		const radius = context.getData("radius") || 5;
		const teleportToCenter = context.getData("teleportToCenter") || false;
		const showLockMessage = context.getData("showLockMessage") || false;
		const showBoundaries = context.getData("showBoundaries") || false;
		const mode = context.getData("mode") || "center";

		if (targetTeam) {
			let center: Vector3;
			let playerBound: string | undefined = undefined;
			const targetPlayer = world.getEntity(targetTeam.memberIds[0]) as Player;
			center = targetPlayer.location;
			if (mode === "player") {
				playerBound = targetPlayer.id;
			}
			this.setLockSettings(subjectTeam.id, {
				radius,
				teleportToCenter,
				showLockMessage,
				showBoundaries,
				center,
				playerBound,
			});
		} else {
			this.updateLockSettings(subjectTeam.id, {
				radius,
				teleportToCenter,
				showLockMessage,
				showBoundaries,
			});
		}
	}
}
