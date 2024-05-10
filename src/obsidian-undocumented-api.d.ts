import "obsidian";

interface BookmarkItem {
	type: string;
	title: string; // filename
	path?: string; // no `.path` = non-file-bookmarks
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
						_onItemsChanged(change: boolean): void; // update bookmarks sidebar
					};
				};
			};
		};
	}
	interface WorkspaceLeaf {
		id: string;
	}
}
