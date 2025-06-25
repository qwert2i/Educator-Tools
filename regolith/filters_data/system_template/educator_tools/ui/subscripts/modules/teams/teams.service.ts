import { PropertyStorage } from "@shapescape/storage";
import { Module } from "../../module-manager";
import { world, Player } from "@minecraft/server";
import { Team } from "./interfaces/team.interface";
import { SceneManager } from "../scene_manager/scene-manager";

/**
 * Service for managing player teams.
 * This service allows creating and managing teams, even when players are offline.
 */
export class TeamsService implements Module {
	public static readonly id = "teams";
	public readonly id = TeamsService.id;
	private readonly TEAMS_KEY = "teams";
	private readonly ALL_PLAYERS_TEAM_ID = "system_all_players";
	private readonly PLAYER_TEAM_PREFIX = "system_player_";
	private readonly TEACHERS_TEAM_ID = "system_teachers";
	private readonly STUDENTS_TEAM_ID = "system_students";

	constructor(private readonly storage: PropertyStorage) {
		// Initialize teams storage if it doesn't exist
		if (!this.storage.get(this.TEAMS_KEY)) {
			this.storage.set(this.TEAMS_KEY, {});
		}
	}

	registerScenes?(sceneManager: SceneManager): void {}

	/**
	 * Creates a new team.
	 * @param teamId - Unique identifier for the team
	 * @param name - Display name for the team
	 * @param options - Additional team options like color and description
	 * @returns The created team
	 */
	createTeam(
		teamId: string,
		name: string,
		options: { color?: string; description?: string; editable?: boolean } = {},
	): Team {
		const teams = this.getAllTeamsData();

		if (teams[teamId]) {
			throw new Error(`Team with ID '${teamId}' already exists`);
		}

		const newTeam: Team = {
			id: teamId,
			name,
			color: options.color,
			description: options.description,
			memberIds: [],
			editable: options.editable !== undefined ? options.editable : true,
		};

		teams[teamId] = newTeam;
		this.storage.set(this.TEAMS_KEY, teams);

		return newTeam;
	}

	/**
	 * Deletes a team.
	 * @param teamId - ID of the team to delete
	 * @returns True if team was deleted, false if team wasn't found
	 */
	deleteTeam(teamId: string): boolean {
		// Check if team is a system team (generated on-demand)
		if (this.isSystemTeam(teamId)) {
			throw new Error(`Cannot delete system team '${teamId}'`);
		}

		const teams = this.getAllTeamsData();
		const team = teams[teamId];

		if (!team) {
			return false;
		}

		// Check if team is editable
		if (team.editable === false) {
			throw new Error(`Team '${teamId}' is not editable`);
		}

		delete teams[teamId];
		this.storage.set(this.TEAMS_KEY, teams);

		return true;
	}

	/**
	 * Adds a player to a team.
	 * @param teamId - ID of the team
	 * @param playerId - ID of the player
	 * @returns True if player was added, false if player was already in the team
	 */
	addPlayerToTeam(teamId: string, playerId: string): boolean {
		// Check if team is a system team (generated on-demand)
		if (this.isSystemTeam(teamId)) {
			throw new Error(`Cannot modify system team '${teamId}'`);
		}

		const teams = this.getAllTeamsData();
		const team = teams[teamId];

		if (!team) {
			throw new Error(`Team with ID '${teamId}' doesn't exist`);
		}

		// Check if team is editable
		if (team.editable === false) {
			throw new Error(`Team '${teamId}' is not editable`);
		}

		// Check if player is already in the team
		if (team.memberIds.includes(playerId)) {
			return false;
		}

		// Add player to team
		team.memberIds.push(playerId);
		this.storage.set(this.TEAMS_KEY, teams);

		return true;
	}

	/**
	 * Removes a player from a team.
	 * @param teamId - ID of the team
	 * @param playerId - ID of the player
	 * @returns True if player was removed, false if player wasn't in the team
	 */
	removePlayerFromTeam(teamId: string, playerId: string): boolean {
		// Check if team is a system team (generated on-demand)
		if (this.isSystemTeam(teamId)) {
			throw new Error(`Cannot modify system team '${teamId}'`);
		}

		const teams = this.getAllTeamsData();
		const team = teams[teamId];

		if (!team) {
			throw new Error(`Team with ID '${teamId}' doesn't exist`);
		}

		// Check if team is editable
		if (team.editable === false) {
			throw new Error(`Team '${teamId}' is not editable`);
		}

		const memberIndex = team.memberIds.indexOf(playerId);
		if (memberIndex === -1) {
			return false;
		}

		// Remove player from team
		team.memberIds.splice(memberIndex, 1);
		this.storage.set(this.TEAMS_KEY, teams);

		return true;
	}

	/**
	 * Gets a team by its ID.
	 * @param teamId - ID of the team
	 * @returns The team object or null if not found
	 */
	getTeam(teamId: string): Team | null {
		// Check for system teams first and generate them on demand
		if (teamId === this.ALL_PLAYERS_TEAM_ID) {
			return this.generateAllPlayersTeam();
		} else if (teamId === this.TEACHERS_TEAM_ID) {
			return this.generateTeachersTeam();
		} else if (teamId === this.STUDENTS_TEAM_ID) {
			return this.generateStudentsTeam();
		} else if (teamId.startsWith(this.PLAYER_TEAM_PREFIX)) {
			const playerId = teamId.replace(this.PLAYER_TEAM_PREFIX, "");
			return this.generatePlayerTeam(playerId);
		}

		// Check stored teams
		const teams = this.getAllTeamsData();
		return teams[teamId] || null;
	}

	/**
	 * Gets all teams.
	 * @returns Array of all teams (stored and system teams)
	 */
	getAllTeams(): Team[] {
		const storedTeams = Object.values(this.getAllTeamsData());
		const systemTeams = this.getSystemTeams();

		return [...storedTeams, ...systemTeams];
	}

	/**
	 * Gets all system-generated teams.
	 * @returns Array of system-generated teams
	 */
	public getSystemTeams(): Team[] {
		const systemTeams: Team[] = [];
		const onlinePlayers = world.getAllPlayers();

		// Add All Players team
		systemTeams.push(this.generateAllPlayersTeam());

		// Add Teachers team
		systemTeams.push(this.generateTeachersTeam());

		// Add Students team
		systemTeams.push(this.generateStudentsTeam());

		// Add individual player teams
		for (const player of onlinePlayers) {
			const team = this.generatePlayerTeam(player.id);
			if (team) {
				systemTeams.push(team);
			}
		}

		return systemTeams;
	}

	/**
	 * Generates the "All Players" team on demand.
	 * @returns The All Players team
	 */
	private generateAllPlayersTeam(): Team {
		const onlinePlayers = world.getAllPlayers();
		const playerIds = onlinePlayers.map((player) => player.id);

		return {
			id: this.ALL_PLAYERS_TEAM_ID,
			name: "All Players",
			description: "All currently online players",
			memberIds: playerIds,
			isSystem: true,
			editable: false,
		};
	}

	/**
	 * Generates an individual player team on demand.
	 * @param playerId - ID of the player
	 * @returns The player's individual team or null if player not found
	 */
	private generatePlayerTeam(playerId: string): Team | null {
		const player = world.getEntity(playerId) as Player | undefined;

		if (!player) {
			return null;
		}

		return {
			id: `${this.PLAYER_TEAM_PREFIX}${playerId}`,
			name: player.name,
			description: `Individual team for ${player.name}`,
			memberIds: [playerId],
			isSystem: true,
			editable: false,
		};
	}

	/**
	 * Generates the Teachers team on demand.
	 * @returns The Teachers team
	 */
	private generateTeachersTeam(): Team {
		// Teachers team is empty by default, but can be managed by adding/removing members
		const teams = this.getAllTeamsData();
		const teachers = teams[this.TEACHERS_TEAM_ID]?.memberIds || [];
		return {
			id: this.TEACHERS_TEAM_ID,
			name: "Teachers",
			description: "All teacher players (manually assigned)",
			memberIds: teachers,
			isSystem: true,
			editable: true,
		};
	}

	/**
	 * Generates the Students team on demand.
	 * @returns The Students team
	 */
	private generateStudentsTeam(): Team {
		const onlinePlayers = world.getAllPlayers();
		const teachers = this.getTeam(this.TEACHERS_TEAM_ID)?.memberIds || [];
		const studentIds = onlinePlayers
			.map((player) => player.id)
			.filter((id) => !teachers.includes(id));
		return {
			id: this.STUDENTS_TEAM_ID,
			name: "Students",
			description: "All online players not in Teachers team",
			memberIds: studentIds,
			isSystem: true,
			editable: false,
		};
	}

	/**
	 * Gets the "All Players" team.
	 * @returns The team containing all online players
	 */
	public getAllPlayersTeam(): Team {
		return this.generateAllPlayersTeam();
	}

	/**
	 * Gets the individual team for a specific player.
	 * @param playerId - ID of the player
	 * @returns The player's individual team or null if not found
	 */
	public getPlayerIndividualTeam(playerId: string): Team | null {
		return this.generatePlayerTeam(playerId);
	}

	/**
	 * Updates team properties.
	 * @param teamId - ID of the team
	 * @param properties - Object with properties to update
	 * @returns The updated team
	 */
	updateTeam(
		teamId: string,
		properties: { name?: string; color?: string; description?: string },
	): Team {
		// Check if team is a system team (generated on-demand)
		if (this.isSystemTeam(teamId)) {
			throw new Error(`Cannot modify system team '${teamId}'`);
		}

		const teams = this.getAllTeamsData();
		const team = teams[teamId];

		if (!team) {
			throw new Error(`Team with ID '${teamId}' doesn't exist`);
		}

		// Check if team is editable
		if (team.editable === false) {
			throw new Error(`Team '${teamId}' is not editable`);
		}

		// Update properties
		if (properties.name !== undefined) {
			team.name = properties.name;
		}
		if (properties.color !== undefined) {
			team.color = properties.color;
		}
		if (properties.description !== undefined) {
			team.description = properties.description;
		}

		this.storage.set(this.TEAMS_KEY, teams);

		return team;
	}

	/**
	 * Checks if a team is a system-generated team.
	 * @param teamId - ID of the team
	 * @returns True if the team is a system team, false otherwise
	 */
	public isSystemTeam(teamId: string): boolean {
		return (
			teamId === this.ALL_PLAYERS_TEAM_ID ||
			teamId === this.TEACHERS_TEAM_ID ||
			teamId === this.STUDENTS_TEAM_ID ||
			teamId.startsWith(this.PLAYER_TEAM_PREFIX)
		);
	}

	/**
	 * Checks if a player is in a specific team.
	 * @param teamId - ID of the team
	 * @param playerId - ID of the player
	 * @returns True if player is in the team, false otherwise
	 */
	isPlayerInTeam(teamId: string, playerId: string): boolean {
		const team = this.getTeam(teamId);
		return team ? team.memberIds.includes(playerId) : false;
	}

	/**
	 * Gets all teams a player belongs to.
	 * @param playerId - ID of the player
	 * @returns Array of teams the player belongs to
	 */
	getPlayerTeams(playerId: string): Team[] {
		return this.getAllTeams().filter((team) =>
			team.memberIds.includes(playerId),
		);
	}

	/**
	 * Gets all team names.
	 * @returns Array of team names
	 */
	getAllTeamNames(): string[] {
		return this.getAllTeams().map((team) => team.name);
	}

	/**
	 * Gets all team IDs.
	 * @returns Array of team IDs
	 */
	getAllTeamIds(): string[] {
		return Object.keys(this.getAllTeamsData());
	}

	/**
	 * Gets all teams data as an object.
	 * @returns Object with team IDs as keys and team objects as values
	 */
	private getAllTeamsData(): Record<string, Team> {
		return (this.storage.get(this.TEAMS_KEY) as Record<string, Team>) || {};
	}
}
