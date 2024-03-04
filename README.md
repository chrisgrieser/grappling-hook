# 🪝 Grappling Hook
![Obsidian Downloads](https://img.shields.io/badge/dynamic/json?logo=obsidian&color=%23483699&label=downloads&query=%24%5B%22grappling-hook%22%5D.downloads&url=https%3A%2F%2Fraw.githubusercontent.com%2Fobsidianmd%2Fobsidian-releases%2Fmaster%2Fcommunity-plugin-stats.json&style=plastic)
![Last Release](https://img.shields.io/github/v/release/chrisgrieser/grappling-hook?label=Latest%20Release&style=plastic)

Obsidian Plugin for blazingly fast file switching. For those who find the Quick
Switcher still too slow. [Endorsed by Nick
Milo.](https://youtu.be/mcrcRXp5d8A?t=462)

<!-- toc -->

- [Features](#features)
	* [Bookmark Cycler](#bookmark-cycler)
	* [Alternate Note](#alternate-note)
	* [Cycle Tab/Split](#cycle-tabsplit)
- [Installation](#installation)
- [About the developer](#about-the-developer)

<!-- tocstop -->

## Features

### Bookmark Cycler
Goes to your most recently modified bookmarked note. If you are already at a
bookmarked note, goes to the next bookmarked note, in order of the last
modification date. This allows you to quickly cycle between a core set of files
that are important. The command works well for workflows where you work with a
dynamic core set of main notes and many auxiliary notes.

When you have text selected, the bookmark cycler switches to its alternative
mode, and copies the selected text to the last modified bookmarked note,
regardless the note you are.

> __Note__  
> Only bookmarked *files* are considered. Bookmarked *blocks* or *headers* are ignored.

![Illustration bookmark cycler](./illustration/bookmark-cycler.png)
*This command is inspired by the [Harpoon plugin for neovim](https://github.com/ThePrimeagen/harpoon).*

### Alternate Note
Go to the last file you were at. As opposed to the `Navigate Back` command,
using the `Switch to Alternate Note` command moves you forward in history when
you press it the second time. This allows you to rapidly switch between two
files with only one hotkey. The name of the alternate file is also displayed in
the status bar.

If the alternate file is already open in another tab, it switches to that
tab. If not, the alternate file is opened in the current tab.

![Illustration alt-file](./illustration/alt-file.png)
*This command is equivalent to vim's `:buffer #`.*

### Cycle Tab/Split
Like the Obsidian built-in command `Go to next tab`, but includes tabs in other
splits, meaning you can cycle through *all* open tabs with one hotkey.

## Installation
➡️ [Install in Obsidian](https://obsidian.md/plugins?id=grappling-hook)

<!-- vale Google.FirstPerson = NO -->
## About the developer
In my day job, I am a sociologist studying the social mechanisms underlying the
digital economy. For my PhD project, I investigate the governance of the app
economy and how software ecosystems manage the tension between innovation and
compatibility. If you are interested in this subject, feel free to get in touch.

- [Academic Website](https://chris-grieser.de/)
- [ResearchGate](https://www.researchgate.net/profile/Christopher-Grieser)
- [Discord](https://discordapp.com/users/462774483044794368/)
- [GitHub](https://github.com/chrisgrieser/)
- [Twitter](https://twitter.com/pseudo_meta)
- [LinkedIn](https://www.linkedin.com/in/christopher-grieser-ba693b17a/)

<a href='https://ko-fi.com/Y8Y86SQ91' target='_blank'>
<img
	height='36'
	style='border:0px;height:36px;'
	src='https://cdn.ko-fi.com/cdn/kofi1.png?v=3'
	border='0'
	alt='Buy Me a Coffee at ko-fi.com'
/></a>
