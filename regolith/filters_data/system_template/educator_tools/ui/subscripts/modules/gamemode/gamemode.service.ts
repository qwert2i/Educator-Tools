import { Module } from "../../module-manager";
import { GameMode, Player, world } from "@minecraft/server";
import { SceneManager } from "../scene_manager/scene-manager";
import { Team } from "../teams/interfaces/team.interface";
import { SetGamemodeScene } from "./set-gamemode.scene";
import { SceneContext } from "../scene_manager/scene-context";

/**
 * Service for managing player gamemodes.
 * This service allows setting gamemodes for players and teams.
 */
export class GamemodeService implements Module {
	public readonly id = "gamemode";

	constructor() {}

	/**
	 * Registers scenes related to gamemode management.
	 * @param sceneManager - The scene manager
	 */
	registerScenes(sceneManager: SceneManager): void {
		sceneManager.registerScene(
			SetGamemodeScene.id,
			(manager: SceneManager, context: SceneContext) => {
				new SetGamemodeScene(manager, context);
			},
		);
	}

	/**
	 * Sets gamemode for a specific player.
	 * @param player - The player to set gamemode for
	 * @param gamemode - The gamemode to set (survival, creative, adventure)
	 */
	setPlayerGamemode(player: Player, gamemode: string): void {
		player.runCommand(`gamemode ${gamemode}`);
	}

	/**
	 * Sets gamemode for all players in a team.
	 * @param team - The team to set gamemode for
	 * @param gamemode - The gamemode to set (survival, creative, adventure)
	 * @param exceptPlayer - Optional player to exclude from the change
	 */
	setTeamGamemode(team: Team, gamemode: string, exceptPlayer?: Player): void {
		if (!team) return;

		// For each member ID in the team
		team.memberIds.forEach((playerId) => {
			// Get the player from the ID
			const player = world.getEntity(playerId) as Player | undefined;

			// Skip if player is not found or matches the exception player
			if (!player || (exceptPlayer && player.id === exceptPlayer.id)) {
				return;
			}

			// Set the gamemode
			this.setPlayerGamemode(player, gamemode);
		});
	}

	/**
	 * Sets gamemode for all online players.
	 * @param gamemode - The gamemode to set (survival, creative, adventure)
	 * @param exceptPlayer - Optional player to exclude from the change
	 */
	setAllPlayersGamemode(gamemode: string, exceptPlayer?: Player): void {
		const players = world.getPlayers();

		players.forEach((player) => {
			if (exceptPlayer && player.id === exceptPlayer.id) {
				return;
			}
			this.setPlayerGamemode(player, gamemode);
		});
	}
}
