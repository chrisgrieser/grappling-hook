import { MarkdownView, Notice, Plugin, TFile } from "obsidian";

// add type safety for the undocumented methods
interface starredItem {
	type: string; // whether starred file or starred search
	title: string; // filename
	path: string;
}
declare module "obsidian" {
	/* eslint-disable no-unused-vars */
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

export default class GrapplingHookPlugin extends Plugin {
	statusbarAltFile: HTMLElement;
	statusbarStarred: HTMLElement;

	async onload() {
		console.info(this.manifest.name + " Plugin loaded.");

		this.statusbarAltFile = this.addStatusBarItem(); // has to be set 1st for styles.css to work correctly
		this.statusbarStarred = this.addStatusBarItem(); // has to be set 2nd
		this.displayAlternateNote();
		this.displayStarredStatus();
		this.registerEvent(
			// second arg needs to be arrow-function, so that `this` gets set
			// correctly. https://discord.com/channels/686053708261228577/840286264964022302/1016341061641183282
			this.app.workspace.on("file-open", () => {
				this.displayStarredStatus();
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

	getLeaf() {
		return this.app.workspace.getLeaf();
	}

	pathToTFile(filepath: string) {
		const file = this.app.vault.getAbstractFileByPath(filepath);
		if (file instanceof TFile) return file;
		return null;
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

		const nextIndex = (currentIndex + 1) % filePathArray.length;
		const nextFilePath = filePathArray[nextIndex];
		return this.pathToTFile(nextFilePath);
	}

	// this function emulates vim's `:buffer #`
	getAlternateNote() {
		const recentFiles = this.app.workspace.getLastOpenFiles();
		for (const filePath of recentFiles) {
			const altTFile = this.pathToTFile(filePath);
			if (altTFile) return altTFile; // checks file existence, e.g. for deleted files
		}
		return null;
	}

	openAlternateNote() {
		const altTFile = this.getAlternateNote();
		if (!altTFile) {
			new Notice("No valid recent note exists.");
			return;
		}
		this.getLeaf().openFile(altTFile);
	}

	//───────────────────────────────────────────────────────────────────────────

	// Status Bar
	displayAlternateNote() {
		const altTFile = this.getAlternateNote();
		const statusbarText = altTFile ? altTFile.basename : "";
		this.statusbarAltFile.setText(statusbarText);
	}

	displayStarredStatus() {
		const currentLeaf = this.getLeaf();
		const currentTfile = currentLeaf.view instanceof MarkdownView ? currentLeaf.view.file : null;
		const isStarred = this.getStarredFiles().includes(currentTfile.path);
		const isLastModifiedStarred = this.getStarredFiles()[0] === currentTfile.path;

		let statusbarText = ""; // not triggering `:not(:empty)` = no icon
		if (isLastModifiedStarred) statusbarText = "!"; // triggers `:not(:empty)` = icon
		else if (isStarred) statusbarText = " "; // triggers `:not(:empty)` = icon

		this.statusbarStarred.setText(statusbarText);
	}

	//───────────────────────────────────────────────────────────────────────────

	// COMMANDS
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

		// getActiveViewOfType will return null if the active view is null, or is 
		// not of type MarkdownView
		const view = app.workspace.getActiveViewOfType(MarkdownView);

		const editor = view ? view.editor : null;
		const mode = editor ? view.getState().mode : null;
		let selection = "";
		if (mode === "preview") {
			// INFO base JS method instead of Obsidian API (only retrieves plain
			// text without markup though)
			selection = activeWindow.getSelection().toString();
		} else if (editor && mode === "source") {
			selection = editor.getSelection();
		}

		// cycle through starred files
		if (selection === "") {
			const leaf = this.getLeaf();
			const currentFilePath = this.app.workspace.getActiveFile().path;
			const nextFile = this.getNextTFile(starredFiles, currentFilePath);
			if (nextFile.path === currentFilePath) {
				new Notice("Already at the sole starred file.");
				return;
			}
			leaf.openFile(nextFile);
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
