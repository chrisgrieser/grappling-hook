import "obsidian";

interface BookmarkItem {
	type: string;
	title: string; // filename
	path?: string;
	items: BookmarkItem[]; // if type "group", then can recursively contain itself
}

declare module "obsidian" {
	interface App {
		internalPlugins: {
			plugins: {
				bookmarks: {
					instance: {
						items: BookmarkItem[];
						getBookmarks: () => BookmarkItem[];
					};
				};
			};
		};
	}
	interface WorkspaceLeaf {
		id: string;
	}
}
