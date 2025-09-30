import { SceneContext } from "../scene_manager/scene-context";
import { SceneManager } from "../scene_manager/scene-manager";
import { ActionUIScene } from "../scene_manager/ui-scene";
import { AssignmentService } from "./assignment.service";

export class AssignmentCreatedScene extends ActionUIScene {
	static readonly id = "assignment_created";

	constructor(
		sceneManager: SceneManager,
		context: SceneContext,
		assignmentService: AssignmentService,
	) {
		super(AssignmentCreatedScene.id, context.getSourcePlayer());

		this.setContext(context);
		let assignment = context.getData("assignment");

		if (assignment) {
			this.setRawBody([
				{ translate: "edu_tools.ui.assignment.update.body.1" },
				{ text: " §9" },
				{ text: context.getSubjectTeam()!.name },
				{ text: " §r" },
				{ translate: "edu_tools.ui.assignment.update.body.2" },
			]);
		} else {
			this.setRawBody([
				{ translate: "edu_tools.ui.assignment.create.body.1" },
				{ text: " §9" },
				{ text: context.getSubjectTeam()!.name },
				{ text: " §r" },
				{ translate: "edu_tools.ui.assignment.create.body.2" },
			]);
		}
		const title = context.getData("assignment_title")
			? context.getData("assignment_title")
			: assignment.title || "";
		const description = context.getData("assignment_description")
			? context.getData("assignment_description")
			: assignment.description || "";
		const icon = context.getData("assignment_icon")
			? context.getData("assignment_icon")
			: assignment.icon || "";
		const notify = !!context.getData("assignment_notify");

		this.addButton("edu_tools.ui.buttons.continue", (): void => {
			if (assignment) {
				assignmentService.updateAssignment(assignment.id, {
					title,
					description,
					icon,
				});
			} else {
				assignment = assignmentService.createAssignment({
					title,
					description,
					icon,
					assignedTo: context.getSubjectTeam()!.id,
				});
				if (notify) {
					assignmentService.notifyAssignmentCreated(assignment);
				}
			}
			context.setData("assignment", assignment.id);
			if (context.getHistory().includes("assignment_manage")) {
				sceneManager.goBackToScene(context, "assignment_manage");
			} else {
				sceneManager.openSceneWithContext(context, "assignment_manage", true);
			}
		});

		this.show(context.getSourcePlayer(), sceneManager);
	}
}
