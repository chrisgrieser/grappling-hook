import { MarkdownView, Notice, Plugin, TFile } from "obsidian";

// add type safety for the undocumented methods
interface bookmarkItem {
	type: string;
	title: string; // filename
	path?: string;
	items: bookmarkItem[]; // if type "group", then can recursively contain itself
}
declare module "obsidian" {
	interface App {
		internalPlugins: {
			plugins: {
				bookmarks: {
					instance: {
						items: bookmarkItem[];
						getBookmarks: () => bookmarkItem[];
					};
				};
			};
		};
	}
}

export default class GrapplingHookPlugin extends Plugin {
	statusbarAltFile: HTMLElement;

	async onload() {
		console.info(this.manifest.name + " Plugin loaded.");

		this.statusbarAltFile = this.addStatusBarItem();
		this.displayAlternateNote();
		this.registerEvent(
			// second arg needs to be arrow-function, so that `this` is set
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
			name: "Cycle Bookmarked Notes / Send Selection to Last Bookmark",
			callback: () => this.bookmarkCycler(),
		});
		this.addCommand({
			id: "cycle-tabs-across-splits",
			name: "Cycle Tabs (Across Splits)",
			callback: () => this.cycleTabsAcrossSplits(),
		});
	}

	async onunload() {
		console.info(this.manifest.name + " Plugin unloaded.");
	}

	//───────────────────────────────────────────────────────────────────────────
	// HELPERS

	getLeaf() {
		return this.app.workspace.getLeaf();
	}

	pathToTFile(filepath: string) {
		const file = this.app.vault.getAbstractFileByPath(filepath);
		if (file instanceof TFile) return file;
		return null;
	}

	getNextTFile(filePathArray: string[], currentFilePath: string) {
		// findIndex() returns -1 if current file is not bookmarked
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

	//───────────────────────────────────────────────────────────────────────────
	// STATUS BAR

	displayAlternateNote() {
		const threshold = 30;
		const altTFile = this.getAlternateNote();
		let statusbarText = altTFile ? altTFile.basename : "";
		if (statusbarText.length > threshold) statusbarText = statusbarText.slice(0, threshold) + "…";
		this.statusbarAltFile.setText(statusbarText);
	}

	//───────────────────────────────────────────────────────────────────────────
	// COMMANDS

	openAlternateNote() {
		const altTFile = this.getAlternateNote();
		if (!altTFile) {
			new Notice("No valid recent note exists.");
			return;
		}
		this.getLeaf().openFile(altTFile);
	}

	async bookmarkCycler() {
		const bookmarkObjs = this.app.internalPlugins.plugins.bookmarks?.instance?.getBookmarks();
		if (!bookmarkObjs || bookmarkObjs.length === 0) {
			new Notice("There are no bookmarked files.");
			return;
		}

		const sortedBookmarkPaths = bookmarkObjs
			.filter(bookmark => bookmark.type === "file") // ignore non-file bookmarks
			.map((bookmark) => bookmark.path)
			.sort((a: string, b: string) => {
				const aTfile = this.pathToTFile(a);
				const bTfile = this.pathToTFile(b);
				return bTfile.stat.mtime - aTfile.stat.mtime;
			});

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

		// cycle through bookmarks files
		if (selection === "") {
			const leaf = this.getLeaf();
			const currentFilePath = this.app.workspace.getActiveFile().path;
			const nextFile = this.getNextTFile(sortedBookmarkPaths, currentFilePath);
			if (nextFile.path === currentFilePath) {
				new Notice("Already at the sole starred file.");
				return;
			}
			leaf.openFile(nextFile);
		}

		// append to last modified bookmark
		else {
			const numberOfCursors = editor ? editor.listSelections().length : 0;
			if (numberOfCursors > 1) {
				new Notice("Multiple Selections are not supported.");
				return;
			}
			const firstStarTFile = this.pathToTFile(sortedBookmarkPaths[0]);
			await this.app.vault.append(firstStarTFile, selection + "\n");
			new Notice(`Appended to "${firstStarTFile.basename}":\n\n"${selection}"`);
		}
	}

	cycleTabsAcrossSplits() {
		const activeLeaf = this.app.workspace.getLeaf();
		if (!activeLeaf) return;

		const leaves = this.app.workspace.getLeavesOfType("markdown");
		if (leaves.length < 2) {
			new Notice("No other tabs to switch to.");
			return;
		}
		const activeLeafIndex = leaves.findIndex((l) => l.id === activeLeaf.id);
		if (activeLeafIndex === -1) return;
		const nextLeafIndex = (activeLeafIndex + 1) % leaves.length;
		const nextLeaf = leaves[nextLeafIndex] as WorkspaceLeaf;
		this.app.workspace.setActiveLeaf(nextLeaf, { focus: true });
	}
}
