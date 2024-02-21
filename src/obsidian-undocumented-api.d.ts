import "obsidian";

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
	interface WorkspaceLeaf {
		id: string;
	}
}
