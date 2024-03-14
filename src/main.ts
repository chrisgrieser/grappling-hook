import { Plugin } from "obsidian";
import { openAlternateNote, updateStatusbar } from "./commands/altfile";
import { bookmarkCycler } from "./commands/bookmark-cycler";
import { cycleFilesInCurrentFolder } from "./commands/cycle-files-in-folder";
import { cycleTabsAcrossSplits } from "./commands/cycle-tabs-across-splits";

export default class GrapplingHook extends Plugin {
	altFileInStatusbar = this.addStatusBarItem();

	override onload(): void {
		console.info(this.manifest.name + " Plugin loaded.");

		// statusbar
		updateStatusbar(this); // initialize
		this.registerEvent(this.app.workspace.on("file-open", () => updateStatusbar(this)));

		// commands
		this.addCommand({
			id: "alternate-note",
			name: "Switch to alternate note",
			callback: () => openAlternateNote(this),
		});
		this.addCommand({
			id: "cycle-starred-notes",
			name: "Cycle bookmarked notes / send selection to last bookmark",
			callback: () => bookmarkCycler(this),
		});
		this.addCommand({
			id: "cycle-tabs-across-splits",
			name: "Cycle tabs (across splits)",
			callback: () => cycleTabsAcrossSplits(this),
		});
		this.addCommand({
			id: "next-file-in-current-folder",
			name: "Next file in current folder",
			callback: () => cycleFilesInCurrentFolder(this, "next"),
		});
		this.addCommand({
			id: "previous-file-in-current-folder",
			name: "Previous file in current folder",
			callback: () => cycleFilesInCurrentFolder(this, "prev"),
		});
	}

	override onunload(): void {
		console.info(this.manifest.name + " Plugin unloaded.");
	}
}
