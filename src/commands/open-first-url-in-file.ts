import { Editor, Notice } from "obsidian";

const urlRegex = /https?:\/\/[^\s)"']+/;

export function openFirstUrlInFile(editor: Editor): void {
	const [firstUrl] = editor.getValue().match(urlRegex) || [];
	if (!firstUrl) {
		new Notice("No URL found in current file.");
		return;
	}
	window.open(firstUrl);
}
