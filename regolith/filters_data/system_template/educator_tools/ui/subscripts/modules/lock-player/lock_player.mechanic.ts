import { Player, system, Vector2, world } from "@minecraft/server";
import { LockPlayerService, LockSettings } from "./lock_player.service";
import { ModuleManager } from "../../module-manager";
import { TeamsService } from "../teams/teams.service";
import { Vec3 } from "@bedrock-oss/bedrock-boost";

/**
 * Mechanic responsible for enforcing player lock restrictions within specified teams.
 * Handles distance-based player containment with impulse pushing and teleportation mechanics.
 */
export class LockPlayerMechanic {
	static readonly id = "lock_player";

	/** System task ID for the main tick loop */
	private taskId: number | null = null;

	/** Reference to the teams service for team management */
	private readonly teamsService: TeamsService;

	/** Maximum impulse force applied to players when pushing them back */
	private static readonly MAX_IMPULSE = 2;

	/** Distance buffer zone where impulse is applied instead of teleportation */
	private static readonly IMPULSE_BUFFER_ZONE = 16;

	/** Safety margin from the lock radius when teleporting players back */
	private static readonly TELEPORT_SAFETY_MARGIN = 5;

	constructor(
		private readonly lockPlayerService: LockPlayerService,
		private readonly moduleManager: ModuleManager,
	) {
		this.teamsService = this.moduleManager.getModule(
			TeamsService.id,
		) as TeamsService;
	}

	/**
	 * Initializes the lock player mechanic by starting the main tick loop.
	 */
	initialize(): void {
		this.taskId = system.runInterval(() => {
			this.tick();
		}, 1);
	}

	/**
	 * Main tick function that processes all locked teams and their members.
	 * Runs every game tick to enforce lock restrictions.
	 */
	tick(): void {
		const lockedTeams = this.lockPlayerService.getLockedTeams();

		// Process each locked team
		for (const teamId of lockedTeams) {
			this.processLockedTeam(teamId);
		}
	}

	/**
	 * Processes a single locked team and enforces restrictions on its members.
	 * @param teamId - The ID of the team to process
	 */
	private processLockedTeam(teamId: string): void {
		const lockSettings = this.lockPlayerService.getLockSettings(teamId);
		if (!lockSettings) {
			return;
		}

		// Update center location if bound to a player
		this.updatePlayerBoundCenter(teamId, lockSettings);

		const team = this.teamsService.getTeam(teamId);
		if (!team) {
			return;
		}

		// Process each team member
		for (const playerId of team.memberIds) {
			const player = world.getEntity(playerId) as Player;
			if (!player) {
				continue; // Skip offline players
			}

			// Skip teachers - they are exempt from lock restrictions
			if (this.isPlayerTeacher(playerId)) {
				continue;
			}

			this.processPlayer(player, lockSettings);
		}
	}

	/**
	 * Updates the lock center if it's bound to a player's location.
	 * @param teamId - The team ID
	 * @param lockSettings - The current lock settings
	 */
	private updatePlayerBoundCenter(
		teamId: string,
		lockSettings: LockSettings,
	): void {
		if (!lockSettings.playerBound) {
			return;
		}

		const boundPlayer = world.getEntity(lockSettings.playerBound) as Player;
		if (boundPlayer) {
			lockSettings.center = boundPlayer.location;
			this.lockPlayerService.updateLockSettings(teamId, lockSettings);
		}
	}

	/**
	 * Checks if a player is a teacher (exempt from lock restrictions).
	 * @param playerId - The player ID to check
	 * @returns True if the player is a teacher
	 */
	private isPlayerTeacher(playerId: string): boolean {
		const playerTeams = this.teamsService.getPlayerTeams(playerId);
		return playerTeams
			.map((team) => team.id)
			.includes(TeamsService.TEACHERS_TEAM_ID);
	}

	/**
	 * Processes a single player and applies lock restrictions if necessary.
	 * @param player - The player to process
	 * @param lockSettings - The lock settings to enforce
	 */
	processPlayer(player: Player, lockSettings: LockSettings): void {
		const playerLocation = player.location;
		const center = lockSettings.center;
		const distance = Vec3.from(playerLocation).distance(center);

		// Player is within allowed radius - no action needed
		if (distance <= lockSettings.radius) {
			return;
		}

		// Player is outside radius - apply containment mechanics
		if (
			distance <
			lockSettings.radius + LockPlayerMechanic.IMPULSE_BUFFER_ZONE
		) {
			// Apply gentle impulse to push player back
			this.applyContainmentImpulse(player, center, playerLocation);
		} else {
			// Player is too far - teleport them back
			this.teleportPlayerBack(player, lockSettings, center, distance);
		}
	}

	/**
	 * Applies a gentle impulse to push the player back towards the center.
	 * @param player - The player to apply impulse to
	 * @param center - The center point of the lock area
	 * @param playerLocation - The current player location
	 */
	private applyContainmentImpulse(
		player: Player,
		center: any,
		playerLocation: any,
	): void {
		const impulse = {
			x: (center.x - playerLocation.x) * 0.1,
			y: 0.2, // Slight upward impulse to help with terrain
			z: (center.z - playerLocation.z) * 0.1,
		};

		// Cap the impulse to prevent excessive force
		impulse.x = Math.max(
			Math.min(impulse.x, LockPlayerMechanic.MAX_IMPULSE),
			-LockPlayerMechanic.MAX_IMPULSE,
		);
		impulse.y = Math.max(
			Math.min(impulse.y, LockPlayerMechanic.MAX_IMPULSE),
			-LockPlayerMechanic.MAX_IMPULSE,
		);
		impulse.z = Math.max(
			Math.min(impulse.z, LockPlayerMechanic.MAX_IMPULSE),
			-LockPlayerMechanic.MAX_IMPULSE,
		);

		player.applyImpulse(impulse);
		player.onScreenDisplay.setActionBar([
			{ translate: "edu_tools.message.too_far_push" },
		]);
	}

	/**
	 * Teleports the player back to either the center or the edge of the allowed area.
	 * @param player - The player to teleport
	 * @param lockSettings - The lock settings containing teleport preferences
	 * @param center - The center point of the lock area
	 * @param distance - The current distance from center
	 */
	private teleportPlayerBack(
		player: Player,
		lockSettings: LockSettings,
		center: any,
		distance: number,
	): void {
		if (lockSettings.teleportToCenter) {
			// Teleport directly to center
			player.teleport(center, {
				rotation: player.getRotation(),
			});

			player.sendMessage([
				{
					translate: "edu_tools.message.too_far_teleport_center",
				},
			]);
		} else {
			// Teleport to edge of allowed area
			this.teleportToAreaEdge(player, center, lockSettings.radius, distance);

			player.sendMessage([
				{
					translate: "edu_tools.message.too_far_teleport_area",
				},
			]);
		}

		// Play teleportation sound effect
		player.playSound("mob.endermen.portal");
	}

	/**
	 * Teleports the player to the edge of the allowed area.
	 * @param player - The player to teleport
	 * @param center - The center point of the lock area
	 * @param radius - The lock radius
	 * @param distance - The current distance from center
	 */
	private teleportToAreaEdge(
		player: Player,
		center: any,
		radius: number,
		distance: number,
	): void {
		// Calculate direction from center to player
		const direction: Vector2 = {
			x: player.location.x - center.x,
			y: player.location.z - center.z,
		};

		// Normalize the direction vector
		const normalizedDirection: Vector2 = {
			x: direction.x / distance,
			y: direction.y / distance,
		};

		// Calculate the closest valid point on the circle edge (with safety margin)
		const safeRadius = radius - LockPlayerMechanic.TELEPORT_SAFETY_MARGIN;
		const targetPoint: Vector2 = {
			x: center.x + normalizedDirection.x * safeRadius,
			y: center.z + normalizedDirection.y * safeRadius,
		};

		// Use spreadplayers command for safe teleportation (handles terrain)
		player.runCommand(
			`/spreadplayers ${targetPoint.x} ${targetPoint.y} 0 1 @s`,
		);
	}

	/**
	 * Stops the lock player mechanic by clearing the tick interval.
	 */
	stop(): void {
		if (this.taskId !== null) {
			system.clearRun(this.taskId);
			this.taskId = null;
		}
	}
}
