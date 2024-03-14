import { Notice, WorkspaceLeaf } from "obsidian";
import GrapplingHook from "src/main";
import { getRootLeaves } from "src/utils";

export function cycleTabsAcrossSplits(plugin: GrapplingHook): void {
	const activeLeaf = plugin.app.workspace.getLeaf();
	if (!activeLeaf) return;

	const openTabs = getRootLeaves(plugin.app);
	if (openTabs.length < 2) {
		new Notice("No other tabs to switch to.");
		return;
	}
	const activeTabIndex = openTabs.findIndex((l) => l.id === activeLeaf.id);
	if (activeTabIndex === -1) {
		new Notice("No active tab found.");
		return;
	}
	const nextLeafIndex = (activeTabIndex + 1) % openTabs.length;
	const nextLeaf = openTabs[nextLeafIndex] as WorkspaceLeaf;
	plugin.app.workspace.setActiveLeaf(nextLeaf, { focus: true });
}
