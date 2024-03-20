import { Editor, Notice } from "obsidian";

export function openFirstUrlInFile(editor: Editor): void {
	const urlRegex = /https?:\/\/[^\s)"']+/;
	const [firstUrl] = editor.getValue().match(urlRegex) || [];
	if (!firstUrl) {
		new Notice("No URL found in current file.");
		return;
	}
	window.open(firstUrl);
}
