import { Player, system, Vector2, world } from "@minecraft/server";
import { LockPlayerService, LockSettings } from "./lock_player.service";
import { ModuleManager } from "../../module-manager";
import { Team } from "../teams/interfaces/team.interface";
import { TeamsService } from "../teams/teams.service";
import { Vec3 } from "@bedrock-oss/bedrock-boost";

export class LockPlayerMechanic {
	static readonly id = "lock_player";
	private taskId: number | null = null;
	private readonly teamsService: TeamsService;

	constructor(
		private readonly lockPlayerService: LockPlayerService,
		private readonly moduleManager: ModuleManager,
	) {
		this.teamsService = this.moduleManager.getModule(
			TeamsService.id,
		) as TeamsService;
	}

	initialize(): void {
		this.taskId = system.runInterval(() => {
			this.tick();
		}, 1);
	}

	tick(): void {
		const lockedTeams = this.lockPlayerService.getLockedTeams();
		for (const teamId of lockedTeams) {
			const lockSettings = this.lockPlayerService.getLockSettings(teamId);
			if (lockSettings) {
				if (lockSettings.playerBound) {
					let player = world.getEntity(lockSettings.playerBound) as Player;
					if (player) {
						lockSettings.center = player.location;
						this.lockPlayerService.updateLockSettings(teamId, lockSettings);
					}
					const team = this.teamsService.getTeam(teamId);
					if (team) {
						for (const playerId of team.memberIds) {
							const player = world.getEntity(playerId) as Player;
							if (!player) {
								continue; // Skip if player is not found
							}
							const playerTeams = this.teamsService.getPlayerTeams(playerId);
							if (
								playerTeams
									.map((t) => t.id)
									.includes(TeamsService.TEACHERS_TEAM_ID)
							) {
								continue; // Skip teachers
							}
							this.processPlayer(player, lockSettings);
						}
					}
				}
			}
		}

		const players = world.getAllPlayers();
		for (const player of players) {
			const playerTeams = this.teamsService.getPlayerTeams(player.id);
			if (playerTeams.length > 0) {
				for (const team of playerTeams) {
					const lockSettings = this.lockPlayerService.getLockSettings(team.id);
					if (lockSettings) {
					}
				}
			}
		}
	}

	processPlayer(player: Player, lockSettings: LockSettings): void {
		const playerLocation = player.location;
		let center = lockSettings.center;
		const distance = Vec3.from(playerLocation).distance(center);
		if (distance > lockSettings.radius) {
			if (distance < lockSettings.radius + 16) {
				const impulse = {
					x: (center.x - playerLocation.x) * 0.1,
					y: 0.2,
					z: (center.z - playerLocation.z) * 0.1,
				};

				// Cap the impulse to not make it too strong
				const maxImpulse = 2;
				impulse.x = Math.max(Math.min(impulse.x, maxImpulse), -maxImpulse);
				impulse.y = Math.max(Math.min(impulse.y, maxImpulse), -maxImpulse);
				impulse.z = Math.max(Math.min(impulse.z, maxImpulse), -maxImpulse);

				player.applyImpulse(impulse);
				player.onScreenDisplay.setActionBar([
					{ translate: "edu_tools.message.too_far_push" },
				]);
			} else {
				if (lockSettings.teleportToCenter) {
					player.teleport(center, {
						rotation: player.getRotation(),
					});

					player.sendMessage([
						{
							translate: "edu_tools.message.too_far_teleport_center",
						},
					]);
					player.playSound("mob.endermen.portal");
				} else {
					const direction: Vector2 = {
						x: player.location.x - center.x,
						y: player.location.z - center.z,
					};

					const normalizedDirection: Vector2 = {
						x: direction.x / distance,
						y: direction.y / distance,
					};

					// Calculate closest point on circle
					const circleRadius = lockSettings.radius - 5;
					const closestPoint: Vector2 = {
						x: center.x + normalizedDirection.x * circleRadius,
						y: center.z + normalizedDirection.y * circleRadius,
					};

					player.runCommand(
						`/spreadplayers ${closestPoint.x} ${closestPoint.y} 0 1 @s`,
					);
					player.sendMessage([
						{
							translate: "edu_tools.message.too_far_teleport_area",
						},
					]);

					player.playSound("mob.endermen.portal");
				}
			}
		}
	}

	stop(): void {
		if (this.taskId !== null) {
			system.clearRun(this.taskId);
			this.taskId = null;
		}
	}
}
