import { Notice, Plugin, TFile } from "obsidian";

// add type safety for the undocumented methods
declare module "obsidian" {
	interface Workspace { /* eslint-disable-line no-unused-vars */
		lastOpenFiles: string[];
	}
}

export default class grapplingHook extends Plugin {
	async onload() {
		console.log("🪝 Grappling Hook Plugin loaded.");

		this.addCommand({
			id: "alternate-note",
			name: "Switch to Alternate Note",
			callback: () => this.alternateNote,
		});
	}

	async onunload() {
		console.log("🪝 Grappling Hook Plugin unloaded.");
	}

	// emulate vim's `:buffer #`
	async alternateNote() {
		const recentFiles = this.app.workspace.lastOpenFiles;
		for (const file of recentFiles) {
			// @ts-ignore, exists() seems to undocumented?
			const fileExists = await this.app.vault.exists(file); /* eslint-disable-line no-await-in-loop */
			const altTFile = app.vault.getAbstractFileByPath(file);
			if (fileExists && altTFile instanceof TFile) {
				this.app.workspace.getLeaf().openFile(altTFile);
				return;
			}
		}
		new Notice("No valid recent note exists.");
	}
}
