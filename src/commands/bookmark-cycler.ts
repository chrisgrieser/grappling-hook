import { MarkdownView, Notice, TFile } from "obsidian";
import GrapplingHook from "src/main";

export async function bookmarkCycler(plugin: GrapplingHook): Promise<void> {
	const app = plugin.app;
	const view = app.workspace.getActiveViewOfType(MarkdownView);
	const editor = view?.editor;
	const mode = view?.getState().mode;

	// get BOOKMARKS
	const bookmarkObjs = app.internalPlugins.plugins.bookmarks?.instance?.getBookmarks() || [];
	const bookmarkPaths = bookmarkObjs
		.reduce((acc: string[], bookmark) => {
			if (bookmark.type === "file") {
				const file = app.vault.getAbstractFileByPath(bookmark.path as string);
				if (file instanceof TFile && bookmark.path) acc.push(bookmark.path);
			}
			return acc;
		}, [])
		.sort((a, b) => {
			const aTfile = app.vault.getFileByPath(a);
			const bTfile = app.vault.getFileByPath(b);
			if (!aTfile || !bTfile) return 0;
			return bTfile.stat.mtime - aTfile.stat.mtime;
		});

	if (bookmarkObjs.length === 0) {
		new Notice("There are no bookmarked files.");
		return;
	}

	// get SELECTION
	let selection = "";
	if (editor && mode === "source") {
		selection = editor.getSelection();
	} else if (mode === "preview") {
		// in preview mode, get selection from active window (electron)
		// CAVEAT only retrieves plain text without markup though
		// biome-ignore lint/correctness/noUndeclaredVariables: electron
		selection = activeWindow?.getSelection()?.toString() || "";
	}

	// NO selection: cycle through bookmarks files
	// WITH selection: append to last modified bookmark
	if (!selection) {
		const currentFilePath = app.workspace.getActiveFile()?.path;

		// `findIndex()` returns -1 if current file is not bookmarked, which gives
		// simply `0` as next index, resulting in the first bookmarked file, which
		// is what we want
		const currentIndex = bookmarkPaths.findIndex((path: string) => path === currentFilePath);
		const nextIndex = (currentIndex + 1) % bookmarkPaths.length;
		const nextFilePath = bookmarkPaths[nextIndex] || "";
		const nextFile = app.vault.getFileByPath(nextFilePath);
		if (!nextFile) {
			new Notice("There are no valid bookmarked files.");
			return;
		}
		if (nextFile.path === currentFilePath) {
			new Notice("Already at the sole starred file.");
			return;
		}
		app.workspace.getLeaf().openFile(nextFile);
	} else {
		const numberOfCursors = editor?.listSelections().length || 0;
		if (numberOfCursors > 1) {
			new Notice("Multiple Selections are not supported.");
			return;
		}
		const firstStarTFile = app.vault.getFileByPath(bookmarkPaths[0] as string);
		if (!firstStarTFile) {
			new Notice("There are no valid bookmarked files.");
			return;
		}
		await app.vault.append(firstStarTFile, selection + "\n");
		new Notice(`Appended to "${firstStarTFile.basename}":\n\n"${selection}"`);
	}
}
