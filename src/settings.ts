import { PluginSettingTab, Setting } from "obsidian";
import GrapplingHook from "./main";

//──────────────────────────────────────────────────────────────────────────────

export const DEFAULT_SETTINGS = {
	openLastModifiedBookmarkOnStartup: false,
	keepBookmarksSidebarSorted: false,
};
export type GrapplingHookSettings = typeof DEFAULT_SETTINGS;

//──────────────────────────────────────────────────────────────────────────────

export class GrapplingHookSettingsMenu extends PluginSettingTab {
	plugin: GrapplingHook;

	constructor(plugin: GrapplingHook) {
		super(plugin.app, plugin);
		this.plugin = plugin;
		this.containerEl.addClass(plugin.cssclass);
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();
		const settings = this.plugin.settings;

		new Setting(containerEl)
			.setName("Startup: open last modified bookmark")
			.setDesc(
				"By default, Obsidian opens the most recent file on startup. " +
					"Enable this to open the last modified bookmark instead.",
			)
			.addToggle((toggle) =>
				toggle.setValue(settings.openLastModifiedBookmarkOnStartup).onChange(async (value) => {
					settings.openLastModifiedBookmarkOnStartup = value;
					await this.plugin.saveSettings();
				}),
			);

		new Setting(containerEl)
			.setName("Auto-sort items in bookmark sidebar by last modified time")
			.setDesc(
				"🧪 Experimental.\n" +
					"Automatically sort the items in the bookmark sidebar by last modified time. " +
					"This is useful, as the order of files in the sidebar reflects the order in which the bookmark-cycling-command navigates to files." +
					"ℹ️ This only works for bookmarks that are not in a folder.",
			)
			.addToggle((toggle) =>
				toggle.setValue(settings.keepBookmarksSidebarSorted).onChange(async (value) => {
					settings.keepBookmarksSidebarSorted = value;
					await this.plugin.saveSettings();
				}),
			);
	}
}
