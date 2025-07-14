import { SceneContext } from "../scene_manager/scene-context";
import { SceneManager } from "../scene_manager/scene-manager";
import { ModalUIScene } from "../scene_manager/ui-scene";
import { AssignmentService } from "./assignment.service";

export class AssignmentStudentSubmitScene extends ModalUIScene {
	static readonly id = "assignment_student_submit";

	constructor(
		sceneManager: SceneManager,
		context: SceneContext,
		assignmentService: AssignmentService,
	) {
		super(AssignmentStudentSubmitScene.id, context.getSourcePlayer());

		const assignmentId = context.getData("assignment");
		const assignment = assignmentId
			? assignmentService.getAssignment(assignmentId)
			: null;

		if (!assignmentId || !assignment) {
			throw new Error("Assignment not found or not selected");
		}

		this.addLabel(assignment.title);
		this.addLabel(assignment.description);
		this.addDivider();

		this.addTextField(
			"edu_tools.ui.assignment_student_submit.note",
			"edu_tools.ui.assignment_student_submit.note_placeholder",
			(value: string): void => {
				context.setData("submission_note", value);
			},
			{
				defaultValue: "",
				tooltip: "edu_tools.ui.assignment_student_submit.note_tooltip",
			},
		);

		this.addLabel("edu_tools.ui.assignment_student_submit.submission");

		this.show(context.getSourcePlayer(), sceneManager);
	}
}
