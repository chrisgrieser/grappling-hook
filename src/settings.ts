import { PluginSettingTab, Setting } from "obsidian";
import GrapplingHook from "./main";

//──────────────────────────────────────────────────────────────────────────────

export const DEFAULT_SETTINGS = {
	openLastModifiedBookmarkOnStartup: false,
	keepBookmarksSidebarSorted: false,
};

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
				"[🧪 Experimental] " +
					"This will make the order of bookmarks in the sidebar reflect the order the bookmark-cycling command will move through files. " +
					"(Note that this feature only works for bookmarks that are not in a folder.)",
			)
			.addToggle((toggle) =>
				toggle.setValue(settings.keepBookmarksSidebarSorted).onChange(async (value) => {
					settings.keepBookmarksSidebarSorted = value;
					await this.plugin.saveSettings();
				}),
			);
	}
}
