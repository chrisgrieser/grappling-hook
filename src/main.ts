import { Editor, Plugin } from "obsidian";
import { openAlternateNote, updateStatusbar } from "./commands/altfile";
import { bookmarkCycler, openLastModifiedBookmark } from "./commands/bookmark-cycler";
import { cycleFilesInCurrentFolder } from "./commands/cycle-files-in-folder";
import { cycleTabsAcrossSplits } from "./commands/cycle-tabs-across-splits";
import { openFirstUrlInFile } from "./commands/open-first-url-in-file";
import { DEFAULT_SETTINGS, GrapplingHookSettingsMenu } from "./settings";

export default class GrapplingHook extends Plugin {
	statusbar = this.addStatusBarItem();
	settings = DEFAULT_SETTINGS; // only fallback value, overwritten in `onload`
	cssclass = this.manifest.id;

	override async onload(): Promise<void> {
		console.info(this.manifest.name + " Plugin loaded.");

		// settings & open last modified (if enabled)
		await this.loadSettings();
		this.addSettingTab(new GrapplingHookSettingsMenu(this));
		if (this.settings.openLastModifiedBookmarkOnStartup) {
			// `onLayoutReady` only triggers when Obsidian has finished loading
			this.app.workspace.onLayoutReady(() => openLastModifiedBookmark(this));
		}

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
			callback: async () => await bookmarkCycler(this),
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
		this.addCommand({
			id: "open-first-url-in-file",
			name: "Open first url in file",
			editorCallback: (editor: Editor) => openFirstUrlInFile(editor),
		});
	}

	//───────────────────────────────────────────────────────────────────────────

	override onunload(): void {
		console.info(this.manifest.name + " Plugin unloaded.");
	}

	async loadSettings(): Promise<void> {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}
	async saveSettings(): Promise<void> {
		await this.saveData(this.settings);
	}
}
