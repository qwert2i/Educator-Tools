export interface Team extends TeamsData {
	id: string;
	memberIds: string[];
	isSystem?: boolean; // Flag to identify system-generated teams
	editable?: boolean; // Flag to control if team can be modified
}

export interface TeamsData {
	name: string;
	color?: string;
	icon?: string; // Optional icon for the team
	description?: string;
}
