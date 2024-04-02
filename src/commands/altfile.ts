import { FileView, Notice, TFile } from "obsidian";
import GrapplingHook from "src/main";
import { getRootLeaves } from "src/utils";

function getAlternateNote(plugin: GrapplingHook): TFile | null {
	const recentFiles = plugin.app.workspace.getLastOpenFiles();
	const currentFile = plugin.app.workspace.getActiveViewOfType(FileView)?.file?.path;
	for (const filePath of recentFiles) {
		if (filePath === currentFile) continue;
		const altTFile = plugin.app.vault.getFileByPath(filePath);
		if (altTFile) return altTFile; // checks file existence, e.g. for deleted files
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
