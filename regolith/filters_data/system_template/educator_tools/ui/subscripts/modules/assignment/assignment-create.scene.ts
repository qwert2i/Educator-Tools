import { SceneContext } from "../scene_manager/scene-context";
import { SceneManager } from "../scene_manager/scene-manager";
import { ModalUIScene } from "../scene_manager/ui-scene";
import { Team } from "../teams/interfaces/team.interface";

export class AssignmentCreateScene extends ModalUIScene {
	static readonly id = "assignment_create";

	constructor(sceneManager: SceneManager, context: SceneContext) {
		super(AssignmentCreateScene.id, context.getSourcePlayer());

		this.setContext(context);

		const assignment = context.getData("assignment");
		// TODO: Add label with assigned team name

		this.addTextField(
			"edu_tools.ui.assignment.create.fields.title",
			"edu_tools.ui.assignment.create.fields.title_placeholder",
			(value: string): void => {
				context.setData("assignment_title", value);
			},
			assignment ? assignment.title : "",
		);
		this.addTextField(
			"edu_tools.ui.assignment.create.fields.description",
			"edu_tools.ui.assignment.create.fields.description_placeholder",
			(value: string): void => {
				context.setData("assignment_description", value);
			},
			assignment ? assignment.description : "",
		);

        if (!assignment) {
            this.addToggle("edu_tools.ui.assignment.create.fields.notify", (value: boolean): void => {
                context.setData("assignment_notify", value);
            }, true);
		// TODO: Add a field for the assignment icon

		this.show(context.getSourcePlayer(), sceneManager).then(() => {
			if (!assignment) {
				context.setSubjectTeamRequired(true);
				context.setNextScene("assignment_created");
				context.setData("team_filter", (team: Team): boolean => {
					return true;
				});
				sceneManager.openSceneWithContext(context, "team_select", true);
			} else {
				sceneManager.openSceneWithContext(context, "assignment_created", true);
			}
		});
	}
}
