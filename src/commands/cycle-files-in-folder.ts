import { Notice, TFile } from "obsidian";
import GrapplingHook from "src/main";

export function cycleFilesInCurrentFolder(plugin: GrapplingHook, dir: "next" | "prev"): void {
	const currentFile = plugin.app.workspace.getActiveFile();
	if (!currentFile) {
		new Notice("No file open.");
		return;
	}
	if (!currentFile.parent) {
		new Notice("File has no parent folder.");
		return;
	}

	const mdFileInFolder = currentFile.parent.children
		.filter((file) => file instanceof TFile && file.extension === "md")
		.sort((a, b) => (a.name < b.name ? -1 : 1)) as TFile[];

	if (mdFileInFolder.length < 2) {
		new Notice("No other files in this folder to switch to.");
		return;
	}

	const currentIndex = mdFileInFolder.findIndex((file) => file.path === currentFile.path);
	const nextIndex =
		dir === "next"
			? (currentIndex + 1) % mdFileInFolder.length
			: (currentIndex + mdFileInFolder.length - 1) % mdFileInFolder.length;
	const nextFile = mdFileInFolder[nextIndex] as TFile;

	plugin.app.workspace.getLeaf().openFile(nextFile);
}
