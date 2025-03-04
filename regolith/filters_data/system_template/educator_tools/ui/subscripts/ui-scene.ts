import {
	MessageFormData,
	ActionFormData,
	ModalFormData,
} from "@minecraft/server-ui";
import { Player, RawMessage, RawMessageScore } from "@minecraft/server";
import { titleCase } from "./utils/title-case";
import { SceneManager } from "./scene-manager";
import { ConfirmSceneConfig } from "./scenes/confirm.scene";

/**
 * Interface representing a RawTextElement.
 * @param translate - Provides a translation token where, if the client has an available resource in the players' language which matches the token, will get translated on the client.
 * @param text - Provides a string literal value to use.
 * @param rawText - Provides a raw-text equivalent of the current message.
 * @param score - Provides a token that will get replaced with the value of a score.
 * @param with - Arguments for the translation token. Can be either an array of strings or RawMessage containing an array of raw text objects.
 */
export interface RawBodyElement {
	translate?: string;
	text?: string;
	rawtext?: RawBodyElement[];
	score?: RawMessageScore;
	with?: string[] | RawMessage;
}

/**
 * Class representing an Action UI Scene.
 */
export class ActionUIScene {
	protected form: ActionFormData;
	protected buttonHandlers: (() => void)[];
	protected player: Player;

	/**
	 * Creates an instance of ActionUIScene.
	 * @param id - The title of the UI window.
	 * @param player - The player that this UI window is shown to.
	 */
	constructor(id: string, player: Player) {
		this.form = new ActionFormData();
		this.form.title(`edu_tools.ui.${id}.title`);
		this.buttonHandlers = [];
		this.player = player;
	}

	/**
	 * Sets the simple body text of the UI window.
	 * @param body - The text of the body.
	 */
	setSimpleBody(body: string): void {
		this.form.body(body);
	}

	/**
	 * Uses a RawTextElement to set the body text of the UI window.
	 * @param rawtext - A list of RawTextElements that are joined together.
	 */
	setRawBody(rawtext: RawBodyElement[]): void {
		this.form.body({ rawtext: rawtext });
	}

	/**
	 * Adds a button to the UI.
	 * @param text - The text that is displayed on the button.
	 * @param handler - Defines the actions when the button is pressed.
	 * @param iconPath - The path to the item texture.
	 */
	addButton(text: string, handler: () => void, iconPath?: string): void {
		if (iconPath === undefined) {
			this.form.button(text);
		} else {
			this.form.button(text, iconPath);
		}
		this.buttonHandlers.push(handler);
	}

	/**
	 * Shows the UI to a player.
	 * @param player - The Player object the UI is shown to.
	 */
	show(player: Player): void {
		this.form.show(player).then((r) => {
			if (!r.canceled && r.selection !== undefined) {
				this.buttonHandlers[r.selection]();
			}
		});
	}
}

/**
 * Class representing a Message UI Scene.
 */
export class MessageUIScene {
	protected form: MessageFormData;
	protected body: string;
	protected buttonHandlers: (() => void)[];
	protected player: Player;

	/**
	 * Creates an instance of MessageUIScene.
	 * @param id - The id of the UI window.
	 * @param player - The player that this UI window is shown to.
	 */
	constructor(id: string, player: Player) {
		this.form = new MessageFormData();
		this.form.title(`edu_tools.ui.${id}.title`);
		this.buttonHandlers = [];
		this.player = player;
	}

	/**
	 * Sets the text and handler for button 1.
	 * @param text - The text that is displayed on the button.
	 * @param handler - Defines the actions when the button is pressed.
	 */
	setButton1(text: string, handler: () => void): void {
		this.form.button1(text);
		this.buttonHandlers.push(handler);
	}

	/**
	 * Sets the text and handler for button 2.
	 * @param text - The text that is displayed on the button.
	 * @param handler - Defines the actions when the button is pressed.
	 */
	setButton2(text: string, handler: () => void): void {
		this.form.button2(text);
		this.buttonHandlers.push(handler);
	}

	/**
	 * Sets the simple body text of the UI window.
	 * @param body - The text of the body.
	 */
	setSimpleBody(body: string): void {
		this.form.body(body);
	}

	/**
	 * Uses a RawTextElement to set the body text of the UI window.
	 * @param rawtext - A list of RawTextElements that are joined together.
	 */
	setRawBody(rawtext: RawBodyElement[]): void {
		this.form.body({ rawtext: rawtext });
	}

	/**
	 * Shows the UI to a player.
	 * @param player - The Player object the UI is shown to.
	 */
	show(player: Player): void {
		this.form.show(player).then((r) => {
			if (!r.canceled && r.selection !== undefined) {
				this.buttonHandlers[r.selection]();
			}
		});
	}
}

/**
 * Class representing a Modal UI Scene.
 */
export class ModalUIScene {
	protected form: ModalFormData;
	protected body: string;
	protected buttonHandlers: ((value: any) => void)[];
	protected player: Player;
	protected next_scene_default: string;
	protected next_scene_config?: ConfirmSceneConfig;

	/**
	 * Creates an instance of ModalUIScene.
	 * @param id - The id of the UI window.
	 * @param player - The player that this UI window is shown to.
	 * @param next_scene_default - The default next scene to open.
	 */
	constructor(
		id: string,
		player: Player,
		next_scene_default: string,
		next_scene_config?: ConfirmSceneConfig,
	) {
		this.form = new ModalFormData();
		this.form.title({
			translate: `edu_tools.ui.${id}.title`,
		});
		this.buttonHandlers = [];
		this.player = player;
		this.next_scene_default = next_scene_default;
		this.next_scene_config = next_scene_config;
	}

	/**
	 * Adds a text field to the UI.
	 * @param label - The label of the text field.
	 * @param text - The text of the text field.
	 * @param handler - Defines the actions when the text field value changes.
	 * @param default_value - The default value of the text field.
	 */
	addTextField(
		label: string,
		text: string,
		handler: (value: any) => void,
		default_value?: string,
	): void {
		this.form.textField(label, text, default_value);
		this.buttonHandlers.push(handler);
	}

	/**
	 * Adds a dropdown to the UI.
	 * @param label - The label of the dropdown.
	 * @param options - The options of the dropdown.
	 * @param handler - Defines the actions when the dropdown value changes.
	 * @param default_index - The default selected index of the dropdown.
	 */
	addDropdown(
		label: string,
		options: string[],
		handler: (value: any) => void,
		default_index?: number,
	): void {
		this.form.dropdown(label, options, default_index);
		this.buttonHandlers.push(handler);
	}

	/**
	 * Adds a slider to the UI.
	 * @param label - The label of the slider.
	 * @param min - The minimum value of the slider.
	 * @param max - The maximum value of the slider.
	 * @param handler - Defines the actions when the slider value changes.
	 * @param default_value - The default value of the slider.
	 */
	addSlider(
		label: string,
		min: number,
		max: number,
		handler: (value: any) => void,
		step: number,
		default_value: number,
	): void {
		this.form.slider(label, min, max, step, default_value);
		this.buttonHandlers.push(handler);
	}

	/**
	 * Adds a toggle to the UI.
	 * @param label - The label of the toggle.
	 * @param handler - Defines the actions when the toggle value changes.
	 * @param default_value - The default value of the toggle.
	 */
	addToggle(
		label: string,
		handler: (value: boolean) => void,
		default_value: boolean,
	): void {
		this.form.toggle(label, default_value);
		this.buttonHandlers.push(handler);
	}

	/**
	 * Sets the next scene to open.
	 * @param scene_name - The name of the next scene.
	 */
	setNextScene(scene_name: string): void {
		this.next_scene_default = scene_name;
	}

	/**
	 * Shows the UI to a player.
	 * @param player - The Player object the UI is shown to.
	 * @param SceneManager - The SceneManager instance.
	 */
	show(player: Player, SceneManager: SceneManager): void {
		this.form.show(player).then((r) => {
			if (r.canceled) {
				return;
			}
			if (r.formValues != undefined) {
				for (let i = 0; i < this.buttonHandlers.length; i++) {
					this.buttonHandlers[i](r.formValues[i]);
				}
			}
			SceneManager.openScene(this.next_scene_default, this.next_scene_config);
		});
	}
}
