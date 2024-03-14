import { App, WorkspaceLeaf } from "obsidian";

export function getRootLeaves(app: App): WorkspaceLeaf[] {
	const rootLeaves: WorkspaceLeaf[] = [];
	app.workspace.iterateRootLeaves((leaf) => {
		rootLeaves.push(leaf);
	});
	return rootLeaves;
}
