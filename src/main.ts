import { MarkdownView, Notice, Plugin, TFile, WorkspaceLeaf } from "obsidian";

export default class GrapplingHookPlugin extends Plugin {
	altFileInStatusbar = this.addStatusBarItem();

	override onload() {
		console.info(this.manifest.name + " Plugin loaded.");

		// statusbar
		this.updateStatusbar();
		this.registerEvent(this.app.workspace.on("file-open", () => this.updateStatusbar()));

		// commands
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

	override onunload() {
		console.info(this.manifest.name + " Plugin unloaded.");
	}

	//───────────────────────────────────────────────────────────────────────────
	// ALTERNATE_NOTE & STATUS BAR

	updateStatusbar() {
		const threshold = 30;
		const altTFile = this.getAlternateNote();
		let statusbarText = altTFile ? altTFile.basename : "";
		if (statusbarText.length > threshold) statusbarText = statusbarText.slice(0, threshold) + "…";
		this.altFileInStatusbar.setText(statusbarText);
	}

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
		this.app.workspace.getLeaf().openFile(altTFile);
	}

	//───────────────────────────────────────────────────────────────────────────
	// CYCLE TABS

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

	//───────────────────────────────────────────────────────────────────────────
	// CYCLE BOOKMARKS

	pathToTFile(filepath: string): TFile | false {
		const file = this.app.vault.getAbstractFileByPath(filepath);
		if (file instanceof TFile) return file;
		return false;
	}

	/** if not on a bookmarked file, or if there is currently no file open, return
	 * the next bookmark file. If there is no bookmarked files, return false */
	getNextTFile(filePathArray: string[], currentFilePath: string | undefined): TFile | false {
		// `findIndex()` returns -1 if current file is not bookmarked, which gives
		// simply the first item, which is what we want anyway
		const currentIndex = filePathArray.findIndex((path: string) => path === currentFilePath);

		const nextIndex = (currentIndex + 1) % filePathArray.length;
		const nextFilePath = filePathArray[nextIndex] || "";
		return this.pathToTFile(nextFilePath);
	}

	async bookmarkCycler() {
		const view = this.app.workspace.getActiveViewOfType(MarkdownView);
		const editor = view?.editor || null;
		const mode = view?.getState().mode;

		// get bookmarks
		const bookmarkObjs =
			this.app.internalPlugins.plugins.bookmarks?.instance?.getBookmarks() || [];
		const sortedBookmarkPaths = bookmarkObjs
			.reduce((acc: string[], bookmark) => {
				if (bookmark.type === "file") {
					const file = this.app.vault.getAbstractFileByPath(bookmark.path as string);
					if (file instanceof TFile && bookmark.path) acc.push(bookmark.path);
				}
				return acc;
			}, [])
			.sort((a, b) => {
				const aTfile = this.pathToTFile(a);
				const bTfile = this.pathToTFile(b);
				if (!aTfile || !bTfile) return 0;
				return bTfile.stat.mtime - aTfile.stat.mtime;
			});
		console.log("👽 sortedBookmarkPaths:", sortedBookmarkPaths);

		if (bookmarkObjs.length === 0) {
			new Notice("There are no bookmarked files.");
			return;
		}

		// get selection
		let selection = "";
		if (editor && mode === "source") {
			selection = editor.getSelection();
		} else if (mode === "preview") {
			// in preview mode, get selection from active window (electron)
			// CAVEAT only retrieves plain text without markup though
			// biome-ignore lint/correctness/noUndeclaredVariables: electron
			selection = activeWindow?.getSelection()?.toString() || "";
		}

		if (!selection) {
			// no selection: cycle through bookmarks files
			const leaf = this.app.workspace.getLeaf();
			const currentFilePath = this.app.workspace.getActiveFile()?.path;
			const nextFile = this.getNextTFile(sortedBookmarkPaths, currentFilePath);
			if (!nextFile) {
				new Notice("There are no valid bookmarked files.");
				return;
			}
			if (nextFile.path === currentFilePath) {
				new Notice("Already at the sole starred file.");
				return;
			}
			leaf.openFile(nextFile);
		} else {
			// with selection: append to last modified bookmark
			const numberOfCursors = editor ? editor.listSelections().length : 0;
			if (numberOfCursors > 1) {
				new Notice("Multiple Selections are not supported.");
				return;
			}
			const firstStarTFile = this.pathToTFile(sortedBookmarkPaths[0] as string);
			if (!firstStarTFile) {
				new Notice("There are no valid bookmarked files.");
				return;
			}
			await this.app.vault.append(firstStarTFile, selection + "\n");
			new Notice(`Appended to "${firstStarTFile.basename}":\n\n"${selection}"`);
		}
	}
}
