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

	const filesInFolder = currentFile.parent.children
		.filter((file) => file instanceof TFile)
		.sort((a, b) => (a.name < b.name ? -1 : 1)) as TFile[];

	if (filesInFolder.length < 2) {
		new Notice("No other files in this folder to switch to.");
		return;
	}

	const currentIndex = filesInFolder.findIndex((file) => file.path === currentFile.path);
	const nextIndex =
		dir === "next"
			? (currentIndex + 1) % filesInFolder.length
			: (currentIndex + filesInFolder.length - 1) % filesInFolder.length;
	const nextFile = filesInFolder[nextIndex] as TFile;

	plugin.app.workspace.getLeaf().openFile(nextFile);
}
