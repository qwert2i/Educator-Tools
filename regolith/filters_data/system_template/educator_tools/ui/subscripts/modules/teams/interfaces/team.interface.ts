export interface Team {
	id: string;
	name: string;
	color?: string;
	description?: string;
	memberIds: string[];
	isSystem?: boolean; // Flag to identify system-generated teams
	editable?: boolean; // Flag to control if team can be modified
}
