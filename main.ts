import { MarkdownView, Notice, Plugin, TFile } from "obsidian";

// add type safety for the undocumented methods
interface starredItem {
	type: string; // whether starred file or starred search
	title: string; // filename
	path: string;
}
declare module "obsidian" {
	/* eslint-disable no-unused-vars */
	interface Workspace {
		lastOpenFiles: string[]; // list of 10 most recent files
	}
	interface App {
		internalPlugins: {
			config: {
				starred: boolean; // whether the Starred Core Plugin is enabled
			};
			plugins: {
				starred: {
					instance: {
						items: starredItem[];
					};
				};
			};
		};
	}
	/* eslint-enable no-unused-vars */
}

export default class grapplingHookPlugin extends Plugin {
	statusbar: HTMLElement;

	async onload() {
		console.info(this.manifest.name + " Plugin loaded.");

		this.statusbar = this.addStatusBarItem();
		this.displayAlternateNote();
		this.registerEvent(
			// second arg needs to be arrow-function, so that `this` gets set
			// correctly. https://discord.com/channels/686053708261228577/840286264964022302/1016341061641183282
			this.app.workspace.on("file-open", () => {
				this.displayAlternateNote();
			}),
		);

		this.addCommand({
			id: "alternate-note",
			name: "Switch to Alternate Note",
			callback: () => this.openAlternateNote(),
		});
		this.addCommand({
			id: "cycle-starred-notes",
			name: "Cycle Starred Notes / Send Selection to Last Starred Note",
			callback: () => this.starredNotesCycler(),
		});
	}

	async onunload() {
		console.info(this.manifest.name + " Plugin unloaded.");
	}

	//───────────────────────────────────────────────────────────────────────────
	// Helpers

	activeLeaf() {
		return this.app.workspace.getLeaf();
	}
	pathToTFile(filepath: string) {
		const file = this.app.vault.getAbstractFileByPath(filepath);
		if (file instanceof TFile) return file;
	}

	getStarredFiles() {
		const stars = this.app.internalPlugins.plugins.starred.instance.items
			.filter((item: starredItem) => {
				const notStarredSearch = item.type === "file";
				const fileExists = this.pathToTFile(item.path);
				return notStarredSearch && fileExists;
			})
			.map((item: starredItem) => item.path)
			.sort((a: string, b: string) => {
				const aTfile = this.pathToTFile(a);
				const bTfile = this.pathToTFile(b);
				return bTfile.stat.mtime - aTfile.stat.mtime;
			});
		return stars;
	}

	getNextTFile(filePathArray: string[], currentFilePath: string) {
		// returns -1 if current file is not starred
		const currentIndex = filePathArray.findIndex((path: string) => path === currentFilePath);

		let nextIndex = currentIndex + 1;
		if (nextIndex > filePathArray.length - 1) nextIndex = 0;
		const nextFilePath = filePathArray[nextIndex];
		return this.pathToTFile(nextFilePath);
	}

	// this function emulates vim's `:buffer #`
	getAlternateNote() {
		const recentFiles = this.app.workspace.lastOpenFiles;
		for (const filePath of recentFiles) {
			const altTFile = this.pathToTFile(filePath);
			// checks file existence, e.g. for deleted files
			if (altTFile) return altTFile;
		}
	}

	openAlternateNote() {
		const altTFile = this.getAlternateNote();
		if (!altTFile) {
			new Notice("No valid recent note exists.");
			return;
		}
		this.activeLeaf().openFile(altTFile);
	}

	//───────────────────────────────────────────────────────────────────────────

	// Status Bar
	displayAlternateNote() {
		const altTFile = this.getAlternateNote();
		if (!altTFile) {
			this.statusbar.setText("");
			return;
		}
		const statusbarText = altTFile ? altTFile.basename : "";
		this.statusbar.setText(statusbarText);
	}

	//───────────────────────────────────────────────────────────────────────────

	// Commands
	async starredNotesCycler() {
		if (!this.app.internalPlugins.config.starred) {
			new Notice("Starred Core Plugin not enabled.");
			return;
		}
		const starredFiles = this.getStarredFiles();
		if (starredFiles.length === 0) {
			new Notice("There are no starred files.");
			return;
		}

		// getActiveViewOfType will return null if the active view is null, or is not of type MarkdownView
		const view = app.workspace.getActiveViewOfType(MarkdownView);

		// INFO in reading mode, getSelection() returns whatever is selected in
		// edit mode, it seems best to check for the view not being reading mode,
		// otherwise this can unexpectedtly send the wrong selection
		const editor = view ? view.editor : false;
		const mode = editor ? view.getState().mode : "";
		let selection = "";
		if (mode === "preview") {
			// INFO base JS method instead of Obsidian API, only retrieves plain
			// text without markup though
			selection = activeWindow.getSelection().toString(); 
		} else if (mode === "source" && editor) {
			selection = editor.getSelection();
		}

		// cycle through starred files
		if (selection === "") {
			const activeLeaf = this.activeLeaf();
			const currentFilePath = this.app.workspace.getActiveFile().path;
			const nextFile = this.getNextTFile(starredFiles, currentFilePath);
			if (nextFile.path === currentFilePath) {
				new Notice("Already at the sole starred file.");
				return;
			}
			activeLeaf.openFile(nextFile);
		}

		// append to last modified starred file
		else {
			const numberOfCursors = editor ? editor.listSelections().length : 0;
			if (numberOfCursors > 1) {
				new Notice("Multiple Selections are not supported.");
				return;
			}
			const firstStarTFile = this.pathToTFile(starredFiles[0]);
			await this.app.vault.append(firstStarTFile, selection + "\n");
			new Notice(`Appended to "${firstStarTFile.basename}":\n\n"${selection}"`);
		}
	}
}
