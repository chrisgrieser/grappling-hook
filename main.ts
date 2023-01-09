import { Plugin } from "obsidian";

export default class grapplingHook extends Plugin {

	async onload() {
		console.log("🪝 Grappling Hook Plugin loaded.");
	}

	async onunload() { console.log("🪝 Grappling Hook Plugin unloaded.") }

}
