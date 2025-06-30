import { Module } from "../../module-manager";
import { GameMode, Player, world } from "@minecraft/server";
import { SceneManager } from "../scene_manager/scene-manager";
import { Team } from "../teams/interfaces/team.interface";
import { SceneContext } from "../scene_manager/scene-context";
import { TeleportScene } from "./teleport.scene";
import { ButtonConfig } from "../main/main.service";

export class TeleportService implements Module {
	static readonly id = "teleport";
	public readonly id = TeleportService.id;

	constructor() {}

	/**
	 * Registers scenes related to gamemode management.
	 * @param sceneManager - The scene manager
	 */
	registerScenes(sceneManager: SceneManager): void {
		sceneManager.registerScene(
			TeleportScene.id,
			(manager: SceneManager, context: SceneContext) => {
				new TeleportScene(manager, context, this);
			},
		);
	}

	getMainButton(): ButtonConfig {
		return {
			labelKey: "edu_tools.ui.main.buttons.teleport",
			iconPath: "textures/edu_tools/ui/icons/main/teleport",
			handler: (sceneManager: SceneManager, context: SceneContext) => {
				this.startTeleportUI(sceneManager, context);
			},
			weight: 10,
		};
	}

	private startTeleportUI(
		sceneManager: SceneManager,
		context: SceneContext,
	): void {
		const playerAmount = world.getPlayers().length;
		if (playerAmount === 1) {
			// If no players are online, show the no players teleport scene
			sceneManager.openSceneWithContext(context, "not_enough_players", true);
		} else {
			context.setSubjectTeamRequired(true);
			context.setTargetTeamRequired(true);
			context.setNextScene("teleport");
			sceneManager.openSceneWithContext(context, "team_select", false);
		}
	}

	teleportTeamToPlayer(team: Team, targetPlayer: Player): void {
		if (!team) return;

		// For each member ID in the team
		team.memberIds.forEach((playerId) => {
			if (playerId === targetPlayer.id) {
				// Skip teleporting the target player to themselves
				return;
			}
			// Get the player from the ID
			const player = world.getEntity(playerId) as Player | undefined;

			// Skip if player is not found
			if (!player) {
				return;
			}

			// Teleport the player to the target player
			player.teleport(targetPlayer.location, {
				dimension: targetPlayer.dimension,
				rotation: targetPlayer.getRotation(),
			});
		});
	}
}
