import { SceneContext } from "../scene_manager/scene-context";
import { SceneManager } from "../scene_manager/scene-manager";
import { ActionUIScene } from "../scene_manager/ui-scene";
import { TeamsService } from "./teams.service";

export class TeamSelectScene extends ActionUIScene {
	static readonly id = "team_select";
	constructor(sceneManager: SceneManager, context: SceneContext) {
		//context.addToHistory(TeamSelectScene.id);
		super(TeamSelectScene.id, context.getSourcePlayer());

		this.setContext(context);

		if (context.isSubjectTeamRequired()) {
			this.setSimpleBody("edu_tools.ui.team_select.get_subject.body");
		} else if (context.isTargetTeamRequired()) {
			this.setSimpleBody("edu_tools.ui.team_select.get_target.body");
		} else {
			console.warn(
				"TeamSelectScene: Neither get_subject nor get_target is set in context data.",
			);
			this.setSimpleBody("edu_tools.ui.team_select.default.body");
		}

		const teamsService = sceneManager
			.getModuleManager()
			.getModule("teams") as TeamsService;
		teamsService.getAllTeams().forEach((team) => {
			this.addButton(
				"edu_tools.ui.team.name." + team.id,
				(): void => {
					if (context.isSubjectTeamRequired()) {
						context.setSubjectTeam(team);
						context.setSubjectTeamRequired(false);
						if (context.isTargetTeamRequired()) {
							sceneManager.openSceneWithContext(context, TeamSelectScene.id);
							return;
						}
					} else if (context.isTargetTeamRequired()) {
						context.setTargetTeam(team);
						context.setTargetTeamRequired(false);
					}
					const nextScene = context.getNextScene();
					if (!nextScene || !nextScene[0] || nextScene.length < 2) {
						console.error("TeamSelectScene: No or invalid next scene defined in context.");
						return;
					}
					sceneManager.openSceneWithContext(
						context,
						nextScene[0],
						nextScene[1],
					);
				},
				"textures/edu_tools/ui/icons/teams/" + (team.icon || team.id),
			);
		});
	}
}
