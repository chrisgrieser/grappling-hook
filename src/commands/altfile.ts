import { FileView, Notice, TFile } from "obsidian";
import GrapplingHook from "src/main";
import { getRootLeaves } from "src/utils";

function getAlternateNote(plugin: GrapplingHook): TFile | null {
	const recentFiles = plugin.app.workspace.getLastOpenFiles();
	const currentFile = plugin.app.workspace.getActiveViewOfType(FileView)?.file?.path;
	const openableExtensions = ["md", "png", "pdf", "jpeg", "jpg"];

	for (const filePath of recentFiles) {
		const altTFile = plugin.app.vault.getFileByPath(filePath);
		const isOpenable = altTFile && openableExtensions.includes(altTFile.extension);
		if (filePath !== currentFile && isOpenable) return altTFile;
	}
	return null;
}

//──────────────────────────────────────────────────────────────────────────────

export function updateStatusbar(plugin: GrapplingHook): void {
	const threshold = 30;
	const altTFile = getAlternateNote(plugin);
	let text = altTFile ? altTFile.basename : "";
	if (text.length > threshold) text = text.slice(0, threshold) + "…";
	plugin.statusbar.setText(text);
}

export function openAlternateNote(plugin: GrapplingHook): void {
	const altTFile = getAlternateNote(plugin);
	if (!altTFile) {
		new Notice("No valid recent note exists.");
		return;
	}

	const openTabs = getRootLeaves(plugin.app);
	if (openTabs.length === 0) {
		new Notice("No open tab.");
		return;
	}
	const altFileOpenInTab = openTabs.find((tab) => {
		return (tab.view as FileView).file?.path === altTFile.path;
	});

	if (altFileOpenInTab) plugin.app.workspace.setActiveLeaf(altFileOpenInTab, { focus: true });
	else plugin.app.workspace.getLeaf().openFile(altTFile);
}
