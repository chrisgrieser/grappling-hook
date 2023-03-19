import { MarkdownView, Notice, Plugin, TFile } from "obsidian";

// add type safety for the undocumented methods
interface bookmarkItem {
	type: string;
	title: string; // filename
	path?: string;
	items: bookmarkItem[]; // if type "group", then can recursively contain itself
}
declare module "obsidian" {
	/* eslint-disable no-unused-vars */
	interface App {
		internalPlugins: {
			plugins: {
				starred: {
					instance: {
						items: bookmarkItem[];
					};
				};
				bookmarks: {
					instance: {
						items: bookmarkItem[];
					};
				};
			};
		};
	}
	/* eslint-enable no-unused-vars */
}

export default class GrapplingHookPlugin extends Plugin {
	statusbarAltFile: HTMLElement;

	async onload() {
		console.info(this.manifest.name + " Plugin loaded.");

		this.statusbarAltFile = this.addStatusBarItem();
		this.displayAlternateNote();
		this.registerEvent(
			// second arg needs to be arrow-function, so that `this` gets set
			// correctly. https://discord.com/channels/686053708261228577/840286264964022302/1016341061641183282
			this.app.workspace.on("file-open", () => {
				this.displayAlternateNote();
			})
		);

		this.addCommand({
			id: "alternate-note",
			name: "Switch to Alternate Note",
			callback: () => this.openAlternateNote(),
		});
		this.addCommand({
			id: "cycle-starred-notes",
			name: "Cycle Bookmarked Notes / Send Selection to Last Bookmark",
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

	// recursively flatten the array and collect the paths in the collector array
	getBookmarkpaths(input: bookmarkItem[], collector: string[]) {
		input.forEach((item: bookmarkItem) => {
			if (item.type === "file") {
				const fileExists = this.pathToTFile(item.path);
				if (fileExists) collector.push(item.path);
			}
			if (item.type === "group")
				this.getBookmarkpaths(item.items, collector);
		});
	}

	getStarredFiles() {
		let starsAndBookmarks: string[] = []; // collects stars and bookmarks
		const stars = this.app.internalPlugins.plugins.starred?.instance?.items;
		const bookmarks =
			this.app.internalPlugins.plugins.bookmarks?.instance?.items;
		if (bookmarks) this.getBookmarkpaths(bookmarks, starsAndBookmarks);
		if (stars) this.getBookmarkpaths(stars, starsAndBookmarks);

		// remove duplicates (stars + bookmarks) and sort by last modification
		starsAndBookmarks = [...new Set(starsAndBookmarks)].sort(
			(a: string, b: string) => {
				const aTfile = this.pathToTFile(a);
				const bTfile = this.pathToTFile(b);
				return bTfile.stat.mtime - aTfile.stat.mtime;
			}
		);
		return starsAndBookmarks;
	}

	getNextTFile(filePathArray: string[], currentFilePath: string) {
		// .findIndex returns -1 if current file is not starred
		const currentIndex = filePathArray.findIndex(
			(path: string) => path === currentFilePath
		);
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
	// STATUS BAR

	displayAlternateNote() {
		const threshold = 30;
		const altTFile = this.getAlternateNote();
		let statusbarText = altTFile ? altTFile.basename : "";
		if (statusbarText.length > threshold)
			statusbarText = statusbarText.slice(0, threshold) + "…";
		this.statusbarAltFile.setText(statusbarText);
	}

	//───────────────────────────────────────────────────────────────────────────
	// COMMANDS

	async starredNotesCycler() {
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
			new Notice(
				`Appended to "${firstStarTFile.basename}":\n\n"${selection}"`
			);
		}
	}
}
