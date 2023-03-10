# 🪝 Grappling Hook

![Obsidian Downloads](https://img.shields.io/badge/dynamic/json?logo=obsidian&color=%23483699&label=downloads&query=%24%5B%22grappling-hook%22%5D.downloads&url=https%3A%2F%2Fraw.githubusercontent.com%2Fobsidianmd%2Fobsidian-releases%2Fmaster%2Fcommunity-plugin-stats.json&style=plastic) ![](https://img.shields.io/github/v/release/chrisgrieser/grappling-hook?label=Latest%20Release&style=plastic) [![](https://img.shields.io/badge/changelog-click%20here-FFE800?style=plastic)](Changelog.md)

Obsidian Plugin for blazingly fast file switching. For people for whom using the Quick Switcher still takes too much time.

## Table of Contents

<!--toc:start-->
- [Features](#features)
	- [Star Cycler](#star-cycler)
	- [Alternate Note](#alternate-note)
	- [Status Bar Items](#status-bar-items)
- [Installation](#installation)
- [About the developer](#about-the-developer)
<!--toc:end-->

## Features

### Star Cycler
Goes to your most recently modified starred note. If you are already at a starred note, goes to the next starred note, in order of the last modification date. This allows you to quickly cycle between a core set of files that are important. 

When you have text selected, the star cycler switches to its alternative mode, and copies the selected text to the last modified starred note regardless on which note you are.

![illustration star cycler](./illustration/star-cycler.png)

This command is intended for when you work with a core set of main notes and many auxiliary notes.

*This command is inspired by the [Harpoon plugin for neovim](https://github.com/ThePrimeagen/harpoon).*

### Alternate Note
Go to the last file you were at. As opposed to the `Navigate Back` command, using the `Switch to Alternate Note` command moves you forward in history when you press it the second time. This allows you to rapidly switch between two files with only one hotkey. The alternate file is also displayed in the status bar.

![illustration alt-file](./illustration/alt-file.png)

*This command is essentially an implementation of vim's `:buffer #`.*

### Status Bar Items
*Grappling Hook* adds two status bar items: 
1. An icon indicating whether the current file is starred or not. If it is the last modified starred file, the icon gets an extra `!`suffix.
2. The name of the alternate file that the `Switch to Alternate Note` command
will switch to.

*Advanced Users:* the status bar items have been designed in a way that they can be customized with a [CSS snippet](https://help.obsidian.md/Extending+Obsidian/CSS+snippets). You can find the selectors in the plugin's [`styles.css` file](./styles.css).

## Installation
The plugin is available in Obsidian's Community Plugin Browser via: `Settings` → `Community Plugins` → `Browse` → Search for *"🪝 Grappling Hook"*

<!-- vale Google.FirstPerson = NO --> <!-- vale Microsoft.FirstPerson = NO -->
## About the developer
In my day job, I am a sociologist studying the social mechanisms underlying the digital economy. For my PhD project, I investigate the governance of the app economy and how software ecosystems manage the tension between innovation and compatibility. If you are interested in this subject, feel free to get in touch!

__Profiles__  
- [Academic Website](https://chris-grieser.de/)
- [ResearchGate](https://www.researchgate.net/profile/Christopher-Grieser)
- [Discord](https://discordapp.com/users/462774483044794368/)
- [GitHub](https://github.com/chrisgrieser/)
- [Twitter](https://twitter.com/pseudo_meta)
- [LinkedIn](https://www.linkedin.com/in/christopher-grieser-ba693b17a/)

__Buy Me a Coffee__  
<br>
<a href='https://ko-fi.com/Y8Y86SQ91' target='_blank'><img height='36' style='border:0px;height:36px;' src='https://cdn.ko-fi.com/cdn/kofi1.png?v=3' border='0' alt='Buy Me a Coffee at ko-fi.com' /></a>
